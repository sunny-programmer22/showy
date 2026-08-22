import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, LogIn, UserPlus, MailCheck, ShoppingBag, ShieldCheck, Truck } from 'lucide-react';
import { useStore } from '../context/StoreContext';

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
