import React, { useState } from 'react';
import { Store, ArrowLeft, ArrowRight, Check, Upload, Sparkles, ShieldCheck, ImagePlus } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { uploadImage } from '../lib/api';

interface CreateShopPageProps {
  onBack: () => void;
  onCreated: (shopId: string) => void;
}

export const CreateShopPage: React.FC<CreateShopPageProps> = ({ onBack, onCreated }) => {
  const { currentUser, createShop, isLiveMode } = useStore();
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300',
    banner_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200',
    bkash_payout_number: currentUser?.phone || '',
    nagad_payout_number: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === 'name' && !form.slug) {
      setForm((prev) => ({
        ...prev,
        slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      }));
    }
  };

  const handleFileUpload = async (file: File, field: 'logo_url' | 'banner_url') => {
    if (!currentUser) return alert('Please sign in first.');
    try {
      const url = await uploadImage(file, currentUser.id);
      handleInputChange(field, url);
    } catch (e: any) {
      alert(`Image upload failed: ${e.message}`);
    }
  };

  const handleSubmit = async () => {
    if (!currentUser) return alert('Please sign in to create a shop.');
    if (!form.name.trim()) return alert('Shop name is required.');

    setBusy(true);
    try {
      const newShop = await createShop({
        owner_id: currentUser.id,
        name: form.name.trim(),
        slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: form.description,
        logo_url: form.logo_url,
        banner_url: form.banner_url,
        is_admin_shop: false,
        is_verified: true,
        is_active: true,
        bkash_payout_number: form.bkash_payout_number,
        nagad_payout_number: form.nagad_payout_number
      });
      setStep(3);
      setTimeout(() => onCreated(newShop.id), 1800);
    } catch (e: any) {
      alert(`Could not create shop: ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  const inputCls = 'w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500';

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand-600 mb-6 transition">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex p-3 bg-brand-50 text-brand-600 rounded-2xl border border-brand-100">
          <Store className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Open Your Own Shop</h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          Launch your storefront in under 2 minutes. Keep <strong>95% of every sale</strong> — only a flat 5% platform commission applies.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-2 mb-8">
        {[
          { num: 1, label: 'Shop Identity' },
          { num: 2, label: 'Payout Setup' },
          { num: 3, label: 'Launch' }
        ].map((s, i) => (
          <React.Fragment key={s.num}>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition ${
              step >= s.num ? 'bg-brand-600 text-white shadow-md' : 'bg-slate-100 text-slate-400'
            }`}>
              <span>{step > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}</span>
              <span>{s.label}</span>
            </div>
            {i < 2 && <div className={`h-0.5 w-8 rounded ${step > s.num ? 'bg-brand-500' : 'bg-slate-200'}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Wizard Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {step === 1 && (
          <div className="p-7 space-y-5">
            <h2 className="font-extrabold text-lg text-slate-900">Basic Shop Information</h2>

            {!currentUser && (
              <p className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                ⚠ Please sign in first (top-right button) — your account becomes the shop owner.
              </p>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Shop Name *</label>
              <input type="text" value={form.name} onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g. Dhaka Fashion House" className={inputCls} />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Shop URL Slug</label>
              <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-brand-500">
                <span className="px-3 py-3 bg-slate-50 text-xs text-slate-400 border-r border-slate-200 shrink-0">/shop/</span>
                <input type="text" value={form.slug} onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="dhaka-fashion-house" className="flex-1 px-3 py-3 text-sm focus:outline-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3} placeholder="Tell buyers what makes your shop special..."
                className={`${inputCls} resize-none`} />
            </div>

            {/* Logo & Banner uploaders */}
            <div className="grid grid-cols-2 gap-4">
              {(['logo_url', 'banner_url'] as const).map((field) => (
                <div key={field} className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
                    {field === 'logo_url' ? 'Shop Logo' : 'Shop Banner'}
                  </label>
                  <div className="flex items-center gap-2">
                    <img src={form[field]} alt="" className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0" />
                    <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 cursor-pointer text-xs font-bold text-slate-600 rounded-xl transition">
                      <ImagePlus className="w-4 h-4" /> Upload
                      <input type="file" accept="image/*" className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], field)} />
                    </label>
                  </div>
                  <input type="url" value={form[field]} onChange={(e) => handleInputChange(field, e.target.value)}
                    placeholder="…or paste image URL"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-[11px] focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
              ))}
            </div>

            {/* Live Preview */}
            <div className="pt-2">
              <p className="text-xs font-bold text-slate-400 uppercase mb-2">Live Preview</p>
              <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                <div className="h-20 relative">
                  <img src={form.banner_url} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                </div>
                <div className="p-3 flex items-end gap-3 -mt-8 relative">
                  <img src={form.logo_url} alt="" className="w-14 h-14 rounded-xl border-[3px] border-white object-cover shadow" />
                  <div className="pb-1">
                    <p className="font-extrabold text-sm text-white drop-shadow">{form.name || 'Your Shop Name'}</p>
                    <p className="text-[10px] text-white/90">/shop/{form.slug}</p>
                  </div>
                </div>
              </div>
            </div>

            <button onClick={() => setStep(2)} disabled={!form.name.trim() || !currentUser}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2">
              Continue to Payout Setup <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="p-7 space-y-5">
            <h2 className="font-extrabold text-lg text-slate-900">Payout Account Setup</h2>
            <p className="text-xs text-slate-500 -mt-3">Where should we send your <strong className="text-emerald-600">95% earnings</strong>? You can withdraw anytime from your vendor dashboard.</p>

            <div className="space-y-1">
              <label className="flex items-center gap-2 text-xs font-bold text-bkash uppercase tracking-wide">
                <span className="px-2 py-0.5 bg-bkash text-white rounded text-[10px] font-extrabold">bKash</span>
                Payout Number
              </label>
              <input type="tel" value={form.bkash_payout_number}
                onChange={(e) => handleInputChange('bkash_payout_number', e.target.value)}
                placeholder="01XXXXXXXXX" className={inputCls} />
            </div>

            <div className="space-y-1">
              <label className="flex items-center gap-2 text-xs font-bold text-nagad uppercase tracking-wide">
                <span className="px-2 py-0.5 bg-nagad text-white rounded text-[10px] font-extrabold">Nagad</span>
                Payout Number
              </label>
              <input type="tel" value={form.nagad_payout_number}
                onChange={(e) => handleInputChange('nagad_payout_number', e.target.value)}
                placeholder="01XXXXXXXXX" className={inputCls} />
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              <div className="text-xs text-emerald-900 leading-relaxed">
                <p className="font-bold">Transparent Revenue Share</p>
                <p className="mt-0.5">Every sale automatically splits: <strong>95% → your wallet</strong>, <strong>5% → platform fee</strong>. Tracked live in your dashboard ledger.</p>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={() => setStep(1)}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition">Back</button>
              <button onClick={handleSubmit} disabled={busy}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-200">
                {busy ? 'Creating your shop…' : (<><Sparkles className="w-4 h-4" /> Launch My Shop!</>)}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="p-12 text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center animate-bounce">
              <Check className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">Congratulations! 🎉</h2>
            <p className="text-sm text-slate-500">
              Your shop <strong className="text-slate-800">{form.name}</strong> is now live{isLiveMode ? ' in your Supabase database' : ''} and ready for products.
            </p>
            <div className="mx-auto w-40 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full animate-pulse w-full" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
