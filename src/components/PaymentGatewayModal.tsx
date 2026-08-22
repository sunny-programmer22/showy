import React, { useState, useEffect } from 'react';
import { Smartphone, ShieldCheck, Loader2, CheckCircle2, X, KeyRound, MessageSquare } from 'lucide-react';
import { toast } from './ui/Toast';

interface PaymentGatewayModalProps {
  isOpen: boolean;
  method: 'bkash' | 'nagad' | null;
  amount: number;
  onSuccess: (transactionId: string) => void;
  onClose: () => void;
}

type Step = 'phone' | 'otp' | 'pin' | 'processing' | 'success';

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  isOpen,
  method,
  amount,
  onSuccess,
  onClose
}) => {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [pin, setPin] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [trxId, setTrxId] = useState('');

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setStep('phone');
      setOtp('');
      setPin('');
      setGeneratedOtp('');
      setCountdown(60);
    }
  }, [isOpen]);

  // OTP countdown timer
  useEffect(() => {
    if (step === 'otp' && countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [step, countdown]);

  // Close on Escape (a11y)
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !method) return null;

  const isBkash = method === 'bkash';
  const brandColor = isBkash ? 'bg-[#e2136e]' : 'bg-[#f7921e]';
  const brandName = isBkash ? 'bKash' : 'Nagad';

  const handlePhoneSubmit = () => {
    if (!/^01\d{9}$/.test(phone)) {
      toast.error('Please enter a valid 11-digit mobile number starting with 01.');
      return;
    }
    // Simulate the gateway sending an SMS OTP to the user's phone
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setCountdown(60);
    setStep('otp');
  };

  const handleOtpSubmit = () => {
    if (otp !== generatedOtp) {
      toast.error('Invalid OTP. Please check the code and try again.');
      return;
    }
    setStep('pin');
  };

  const handleResend = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setCountdown(60);
    toast.info(`New OTP sent to ${phone}. Check the SMS preview above.`);
  };

  const handlePinSubmit = () => {
    if (pin.length < 4) {
      toast.error(`${brandName} PIN must be at least 4 digits.`);
      return;
    }
    setStep('processing');

    // Simulate secure server-side verification & webhook callback
    setTimeout(() => {
      const id = `${isBkash ? 'BK' : 'NG'}${Math.random().toString(36).substring(2, 10).toUpperCase()}${Math.floor(Math.random() * 900 + 100)}`;
      setTrxId(id);
      setStep('success');
      setTimeout(() => onSuccess(id), 1600);
    }, 2200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`${brandName} secure checkout`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && step !== 'processing') onClose();
      }}
    >
      <div className={`relative w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden ${brandColor}`}>
        {/* Gateway Header */}
        <div className={`${brandColor} text-white p-5 relative`}>
          <button onClick={onClose} aria-label="Close payment window" className="absolute right-4 top-4 p-1 hover:bg-white/20 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <Smartphone className="w-8 h-8" />
            <div>
              <p className="font-extrabold text-xl tracking-tight">{brandName}</p>
              <p className="text-[10px] opacity-90 font-medium uppercase tracking-widest">Secure Checkout · PGW</p>
            </div>
          </div>
        </div>

        {/* Amount strip */}
        <div className="bg-black/15 px-5 py-3 flex items-center justify-between">
          <span className="text-white/80 text-xs font-semibold">Payment Amount</span>
          <span className="text-white font-extrabold text-lg">৳ {amount.toLocaleString()}</span>
        </div>

        {/* Body */}
        <div className="bg-white p-6 space-y-4 min-h-[300px]">
          {step === 'phone' && (
            <>
              <h3 className="font-extrabold text-slate-900 text-base">Enter your {brandName} account number</h3>
              <input
                autoFocus
                type="tel"
                maxLength={11}
                placeholder="01XXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3.5 border border-slate-200 rounded-xl text-lg font-bold tracking-wide focus:outline-none focus:ring-2 focus:ring-brand-500 text-center"
              />
              <button
                onClick={handlePhoneSubmit}
                disabled={phone.length !== 11}
                className={`w-full py-3.5 rounded-xl font-extrabold text-white text-sm transition disabled:bg-slate-300 ${isBkash ? 'bg-bkash hover:brightness-110' : 'bg-nagad hover:brightness-110'}`}
              >
                Confirm Number
              </button>
              <p className="text-[10px] text-slate-400 text-center leading-relaxed flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3" /> You will receive an SMS OTP on this number to authorize payment.
              </p>
            </>
          )}

          {step === 'otp' && (
            <>
              {/* SMS Simulation bubble */}
              <div className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl animate-pulse">
                <MessageSquare className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-emerald-800">📩 SMS from {brandName} ({phone})</p>
                  <p className="text-emerald-700 mt-0.5 font-mono">
                    Your {brandName} verification code is: <strong className="text-sm tracking-widest select-all">{generatedOtp}</strong>
                  </p>
                  <p className="text-[10px] text-emerald-500 mt-0.5">Do not share this code with anyone.</p>
                </div>
              </div>

              <h3 className="font-extrabold text-slate-900 text-base">Enter the 6-digit OTP</h3>
              <input
                autoFocus
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="- - - - - -"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3.5 border border-slate-200 rounded-xl text-2xl font-extrabold tracking-[0.5em] text-center focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                onClick={handleOtpSubmit}
                disabled={otp.length !== 6}
                className={`w-full py-3.5 rounded-xl font-extrabold text-white text-sm transition disabled:bg-slate-300 ${isBkash ? 'bg-bkash' : 'bg-nagad'}`}
              >
                Verify OTP
              </button>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Code expires in {countdown}s</span>
                <button onClick={handleResend} className="font-bold text-brand-600 hover:underline">Resend Code</button>
              </div>
            </>
          )}

          {step === 'pin' && (
            <>
              <h3 className="font-extrabold text-slate-900 text-base">Enter your {brandName} PIN</h3>
              <p className="text-xs text-slate-500 -mt-2">Authorize payment of ৳{amount.toLocaleString()} to complete your order.</p>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-4 top-4" />
                <input
                  autoFocus
                  type="password"
                  inputMode="numeric"
                  maxLength={5}
                  placeholder="•••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl text-xl tracking-[0.4em] text-center font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <button
                onClick={handlePinSubmit}
                disabled={pin.length < 4}
                className={`w-full py-3.5 rounded-xl font-extrabold text-white text-sm transition disabled:bg-slate-300 ${isBkash ? 'bg-bkash' : 'bg-nagad'}`}
              >
                Pay ৳{amount.toLocaleString()}
              </button>
              <p className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" /> Encrypted end-to-end. Merchant never sees your PIN.
              </p>
            </>
          )}

          {step === 'processing' && (
            <div className="py-16 text-center space-y-4">
              <Loader2 className={`w-12 h-12 mx-auto animate-spin ${isBkash ? 'text-bkash' : 'text-nagad'}`} />
              <p className="font-extrabold text-slate-800">Processing Payment...</p>
              <p className="text-xs text-slate-500">Verifying transaction with {brandName} secure servers.<br />Do not close this window.</p>
            </div>
          )}

          {step === 'success' && (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="w-16 h-16 mx-auto text-emerald-500 animate-bounce" />
              <p className="font-extrabold text-slate-900 text-lg">Payment Successful!</p>
              <p className="text-xs text-slate-500">Transaction ID: <strong className="font-mono text-slate-700">{trxId}</strong></p>
              <p className="text-[11px] text-emerald-600 font-bold">৳{amount.toLocaleString()} paid via {brandName}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
