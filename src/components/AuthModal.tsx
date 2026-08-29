import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, LogIn, UserPlus, MailCheck, ShoppingBag, ShieldCheck, Truck } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { supabase } from '../lib/supabase';
import { toast } from '../components/ui/Toast';

export const AuthModal: React.FC = () => {
  const { authModalOpen, setAuthModalOpen, signIn, signUp } = useStore();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmSent, setConfirmSent] = useState(false);

  // Close on Escape (a11y)
  useEffect(() => {
    if (!authModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAuthModalOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [authModalOpen, setAuthModalOpen]);

  if (!authModalOpen) return null;

  const close = () => {
    setAuthModalOpen(false);
    setError('');
    setConfirmSent(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'signup') {
        const result = await signUp(email.trim(), password, fullName.trim());
        if (result === 'confirm-email') {
          setConfirmSent(true);
        } else {
          close();
        }
      } else {
        await signIn(email.trim(), password);
        close();
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  const [oauthBusy, setOauthBusy] = useState<'google' | 'facebook' | null>(null);
  const handleOAuth = async (provider: 'google' | 'facebook') => {
    if (!supabase) {
      toast.error('Supabase not configured — add VITE_SUPABASE_URL/KEY');
      return;
    }
    setOauthBusy(provider);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'OAuth failed');
      toast.error(err.message || 'OAuth failed');
      setOauthBusy(null);
    }
  };

  const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
  const FacebookIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );

  const inputCls = 'w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-300 transition';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label={mode === 'login' ? 'Sign in to Showy' : 'Create your Showy account'}
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lift overflow-hidden border border-white/40 animate-pop-in">
        <div className="flex">
          {/* Brand panel */}
          <div className="hidden sm:flex w-36 shrink-0 flex-col justify-between relative overflow-hidden bg-gradient-to-br from-slate-900 via-brand-800 to-brand-600 p-5">
            <div className="pointer-events-none absolute -top-10 -right-10 w-36 h-36 bg-brand-400/30 blur-2xl rounded-full" />
            <button onClick={close} aria-label="Close sign in window" className="absolute right-2.5 top-2.5 p-1 hover:bg-white/15 rounded-lg transition z-10">
              <X className="w-4 h-4 text-white" />
            </button>
            <div className="relative p-2.5 w-fit bg-white/10 border border-white/20 rounded-xl backdrop-blur">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-4 text-[11px] font-semibold text-white/85 relative">
              <p className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> Verified sellers</p>
              <p className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-amber-300" /> Nationwide delivery</p>
              <p className="text-white font-extrabold text-base leading-snug">Shop.<br /><span className="text-gradient">Sell.</span><br />Grow.</p>
            </div>
          </div>

          {/* Form panel */}
          <div className="flex-1 min-w-0">
            {/* Mobile header */}
            <div className="sm:hidden relative bg-gradient-to-r from-brand-600 to-brand-700 p-5 text-white">
              <button onClick={close} aria-label="Close sign in window" className="absolute right-3.5 top-3.5 p-1 hover:bg-white/20 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
              <h2 className="font-display text-lg font-extrabold tracking-tight">
                {mode === 'login' ? 'Welcome back!' : 'Create your account'}
              </h2>
              <p className="text-xs text-white/80 mt-0.5">Showy — multi-vendor marketplace</p>
            </div>

            {confirmSent ? (
              <div className="p-8 text-center space-y-4">
                <MailCheck className="w-14 h-14 mx-auto text-emerald-500" />
                <h3 className="font-display font-extrabold text-slate-900">Confirm your email</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  We sent a confirmation link to <strong className="text-slate-700">{email}</strong>.
                  Click it, then sign in here.
                </p>
                <button onClick={close} className="btn-shine px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl w-full">
                  Got it
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="hidden sm:block">
                  <h2 className="font-display text-xl font-extrabold tracking-tight text-slate-900">
                    {mode === 'login' ? 'Welcome back!' : 'Create your account'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5 mb-1">
                    {mode === 'login' ? 'Sign in to shop, sell and track orders' : 'Join the marketplace in seconds'}
                  </p>
                </div>

                {mode === 'signup' && (
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                      placeholder="Full name" className={inputCls} />
                  </div>
                )}

                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address" className={inputCls} autoComplete="email" />
                </div>

                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password (min 6 chars)" className={inputCls} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
                </div>

                {error && (
                  <p role="alert" className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 animate-pop-in">
                    {error}
                  </p>
                )}

                <button type="submit" disabled={busy}
                  className="btn-shine w-full py-3.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 disabled:opacity-60 text-white font-extrabold text-sm rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-cta active:scale-[.98]">
                  {busy ? 'Please wait…' : mode === 'login' ? (<><LogIn className="w-4 h-4" /> Sign In</>) : (<><UserPlus className="w-4 h-4" /> Create Account</>)}
                </button>

                <div className="relative flex items-center gap-3 py-1">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">or continue with</span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => handleOAuth('google')} disabled={!!oauthBusy || busy}
                    className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-sm font-bold text-slate-700 transition disabled:opacity-60">
                    {oauthBusy === 'google' ? <span className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" /> : <GoogleIcon />}
                    Google
                  </button>
                  <button type="button" onClick={() => handleOAuth('facebook')} disabled={!!oauthBusy || busy}
                    className="flex items-center justify-center gap-2 py-2.5 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-xl text-sm font-bold transition disabled:opacity-60">
                    {oauthBusy === 'facebook' ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FacebookIcon />}
                    Facebook
                  </button>
                </div>

                <p className="text-xs text-center text-slate-500">
                  {mode === 'login' ? "New to Showy? " : 'Already have an account? '}
                  <button type="button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
                    className="font-extrabold text-brand-600 hover:text-brand-500 hover:underline underline-offset-2">
                    {mode === 'login' ? 'Create one' : 'Sign in'}
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
