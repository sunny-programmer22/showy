import { useEffect, useState } from 'react';
import { User, Lock, MapPin, Moon, Sun, LogOut, Languages, Upload, Gift, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useStore } from '../context/StoreContext';
import { toast } from '../components/ui/Toast';
import { useLang } from '../lib/i18n';

const SettingsPage: React.FC = () => {
  const { lang, setLanguage: setLang } = useLang();
  const { referralCode, loyaltyPoints } = useStore();
  const [userId, setUserId] = useState<string>('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [addr, setAddr] = useState({ fullName: '', phone: '', address: '', city: '' });
  const [pw, setPw] = useState('');
  const [dark, setDark] = useState(() => localStorage.getItem('showy_theme') === 'dark');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('showy_theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data.user;
      if (!u) { toast.error('Please log in to open settings.'); return; }
      setUserId(u.id);
      setEmail(u.email || '');
      const { data: p } = await supabase!.from('profiles').select('full_name,phone,avatar_url,default_address').eq('id', u.id).single();
      if (p) {
        setFullName((p as any).full_name || '');
        setPhone((p as any).phone || '');
        setAvatarUrl((p as any).avatar_url || '');
        if ((p as any).default_address) setAddr((p as any).default_address);
      }
    });
  }, []);

  const saveProfile = async () => {
    if (!supabase || !userId) { toast.error('Please log in.'); return; }
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, phone, avatar_url: avatarUrl, default_address: addr } as any)
      .eq('id', userId);
    setSaving(false);
    if (error) toast.error(error.message); else toast.success('Settings saved.');
  };

  const uploadAvatar = async (file: File) => {
    if (!supabase) return;
    const path = `${userId}/avatar-${Date.now()}.png`;
    const { error } = await supabase.storage.from('media').upload(path, file, { upsert: true });
    if (error) { toast.error(error.message); return; }
    const { data } = supabase.storage.from('media').getPublicUrl(path);
    setAvatarUrl(data.publicUrl);
    toast.success('Avatar uploaded — press Save.');
  };

  const changePassword = async () => {
    if (!supabase) return;
    if (pw.length < 6) { toast.error('Password must be at least 6 characters.'); return; }
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) toast.error(error.message); else { setPw(''); toast.success('Password updated.'); }
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Settings</h1>

      <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
        <h2 className="flex items-center gap-2 font-extrabold text-slate-800 dark:text-slate-100"><User className="w-4 h-4" /> Account</h2>
        <div className="flex items-center gap-4">
          {avatarUrl ? <img src={avatarUrl} alt="" className="w-14 h-14 rounded-full object-cover" /> : <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center"><User className="w-6 h-6 text-slate-500" /></div>}
          <label className="cursor-pointer text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            <Upload className="w-3.5 h-3.5" /> Upload avatar
            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
          </label>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" className="input-base" />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (01XXXXXXXXX)" className="input-base" />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">Email: {email}</p>
      </section>

      <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-3">
        <h2 className="flex items-center gap-2 font-extrabold text-slate-800 dark:text-slate-100"><MapPin className="w-4 h-4" /> Default Shipping Address</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <input value={addr.fullName} onChange={(e) => setAddr({ ...addr, fullName: e.target.value })} placeholder="Receiver name" className="input-base" />
          <input value={addr.phone} onChange={(e) => setAddr({ ...addr, phone: e.target.value })} placeholder="Receiver phone" className="input-base" />
          <input value={addr.address} onChange={(e) => setAddr({ ...addr, address: e.target.value })} placeholder="Street / house address" className="input-base sm:col-span-2" />
          <input value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} placeholder="City / district" className="input-base" />
        </div>
        <p className="text-[11px] text-slate-400">Saved address auto-fills at checkout.</p>
      </section>

      <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-3">
        <h2 className="flex items-center gap-2 font-extrabold text-slate-800 dark:text-slate-100"><Lock className="w-4 h-4" /> Security</h2>
        <div className="flex flex-wrap gap-2">
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="New password" className="input-base flex-1 min-w-[200px]" />
          <button onClick={changePassword} className="px-4 py-2 bg-slate-900 dark:bg-brand-600 text-white rounded-xl text-xs font-extrabold uppercase">Update Password</button>
        </div>
        <button onClick={signOut} className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700">
          <LogOut className="w-3.5 h-3.5" /> Sign out of this device
        </button>
      </section>

      <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
        <h2 className="font-extrabold text-slate-800 dark:text-slate-100">Preferences</h2>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200"><Languages className="w-4 h-4" /> Language</span>
          <div className="flex gap-1">
            {(['en', 'bn'] as const).map((l) => (
              <button key={l} onClick={() => setLang(l)}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition ${lang === l ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                {l === 'en' ? 'English' : 'বাংলা'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Dark mode</span>
          <button onClick={() => setDark(!dark)} aria-label="Toggle dark mode"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-amber-300 transition">
            {dark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>
      </section>

      <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-3">
        <h2 className="flex items-center gap-2 font-extrabold text-slate-800 dark:text-slate-100"><Gift className="w-4 h-4" /> Refer &amp; Earn — Loyalty</h2>
        <p className="text-xs text-slate-500 leading-relaxed">Share your code <span className="font-mono font-bold text-brand-600">{referralCode}</span> — friend gets ৳50 off first order, you earn ৳50 credit + 1% loyalty points on every paid order.</p>
        <div className="flex gap-2">
          <input readOnly value={`https://showy.jubair.bond/?ref=${referralCode}`} className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-mono dark:text-slate-200" />
          <button onClick={() => { navigator.clipboard.writeText(`https://showy.jubair.bond/?ref=${referralCode}`); toast.success('Referral link copied'); }} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold">Copy</button>
        </div>
        <p className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-amber-500 fill-current" /> Loyalty Points: <span className="text-brand-600">{loyaltyPoints}</span> <span className="text-slate-400 font-normal"> (≈ ৳{loyaltyPoints} off next order)</span></p>
      </section>

      <button onClick={saveProfile} disabled={saving}
        className="w-full py-3 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-extrabold rounded-2xl transition">
        {saving ? 'Saving…' : 'Save Settings'}
      </button>
    </div>
  );
};

export default SettingsPage;
