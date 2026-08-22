import React, { useState } from 'react';
import { X, Mail, Lock, User, LogIn, UserPlus, MailCheck } from 'lucide-react';
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

  const inputWrap = 'relative';
  const inputCls = 'w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-600 to-brand-700 p-6 text-white relative">
          <button onClick={close} className="absolute right-4 top-4 p-1 hover:bg-white/20 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-extrabold tracking-tight">
            {mode === 'login' ? 'Welcome back!' : 'Create your account'}
          </h2>
          <p className="text-xs text-white/80 mt-1">
            {mode === 'login' ? 'Sign in to shop, sell and track orders' : 'Join the marketplace in seconds'}
          </p>
        </div>

        {/* Body */}
        {confirmSent ? (
          <div className="p-8 text-center space-y-4">
            <MailCheck className="w-14 h-14 mx-auto text-emerald-500" />
            <h3 className="font-extrabold text-slate-900">Confirm your email</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              We sent a confirmation link to <strong className="text-slate-700">{email}</strong>.
              Click it, then sign in here.
            </p>
            <button onClick={close} className="px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl w-full">
              Got it
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {mode === 'signup' && (
              <div className={inputWrap}>
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full name" className={inputCls} />
              </div>
            )}

            <div className={inputWrap}>
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address" className={inputCls} autoComplete="email" />
            </div>

            <div className={inputWrap}>
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (min 6 chars)" className={inputCls} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
            </div>

            {error && (
              <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button type="submit" disabled={busy}
              className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-extrabold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-md">
              {busy ? 'Please wait…' : mode === 'login' ? (<><LogIn className="w-4 h-4" /> Sign In</>) : (<><UserPlus className="w-4 h-4" /> Create Account</>)}
            </button>

            <p className="text-xs text-center text-slate-500">
              {mode === 'login' ? "New to Showy? " : 'Already have an account? '}
              <button type="button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
                className="font-extrabold text-brand-600 hover:underline">
                {mode === 'login' ? 'Create one' : 'Sign in'}
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};
