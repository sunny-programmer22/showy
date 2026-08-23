import React, { useState, useEffect } from 'react';
import { X, Smartphone, Copy, CheckCircle2, KeyRound, ShieldCheck } from 'lucide-react';
import { toast } from './ui/Toast';

interface ManualPaymentModalProps {
  isOpen: boolean;
  method: 'bkash' | 'nagad';
  amount: number;
  merchantNumber: string;
  onSubmit: (trxId: string) => void;
  onClose: () => void;
}

export const ManualPaymentModal: React.FC<ManualPaymentModalProps> = ({
  isOpen,
  method,
  amount,
  merchantNumber,
  onSubmit,
  onClose
}) => {
  const [trxId, setTrxId] = useState('');
  const [last4, setLast4] = useState('');
  const [idMode, setIdMode] = useState<'trx' | 'last4'>('trx');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTrxId('');
      setLast4('');
      setIdMode('trx');
      setCopied(false);
    }
  }, [isOpen]);

  // Close on Escape (a11y)
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const brandColor = method === 'bkash' ? 'bg-[#e2136e]' : 'bg-[#f7921e]';
  const brandName = method === 'bkash' ? 'bKash' : 'Nagad';

  const copyNumber = async () => {
    try {
      await navigator.clipboard.writeText(merchantNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const handleSubmit = () => {
    if (idMode === 'trx') {
      const id = trxId.trim().toUpperCase();
      if (!/^[A-Z0-9]{6,16}$/.test(id)) {
        toast.error(`Enter the ${brandName} Transaction ID (TrxID) from your confirmation SMS.`);
        return;
      }
      onSubmit(`TRX:${id}`);
    } else {
      if (!/^\d{4}$/.test(last4)) {
        toast.error('Enter the last 4 digits of the number you paid from.');
        return;
      }
      onSubmit(`MOB:****${last4}`);
    }
  };

  const canSubmit = idMode === 'trx' ? /^[A-Z0-9]{6,16}$/.test(trxId.trim()) : /^\d{4}$/.test(last4);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`${brandName} manual payment`}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`relative w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden ${brandColor}`}>
        <div className={`${brandColor} text-white p-5 relative`}>
          <button onClick={onClose} aria-label="Close payment window" className="absolute right-4 top-4 p-1 hover:bg-white/20 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <Smartphone className="w-8 h-8" />
            <div>
              <p className="font-extrabold text-xl tracking-tight">{brandName}</p>
              <p className="text-[10px] opacity-90 font-medium uppercase tracking-widest">Send Money · Step 1 of 2</p>
            </div>
          </div>
        </div>

        <div className="bg-black/15 px-5 py-3 flex items-center justify-between">
          <span className="text-white/80 text-xs font-semibold">Amount to send</span>
          <span className="text-white font-extrabold text-lg">৳ {amount.toLocaleString()}</span>
        </div>

        <div className="bg-white p-6 space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base leading-snug">
            Send <span className="whitespace-nowrap">৳{amount.toLocaleString()}</span> to this {brandName} number
          </h3>

          <button onClick={copyNumber}
            className="w-full flex items-center justify-between px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl hover:border-brand-400 transition group"
            aria-label={`Copy ${brandName} number`}>
            <span className="font-mono font-extrabold text-lg text-slate-900">{merchantNumber}</span>
            {copied
              ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              : <Copy className="w-5 h-5 text-slate-400 group-hover:text-brand-600" />}
          </button>
          <p className="text-[11px] text-slate-500 -mt-2">
            Use <strong>{brandName === 'bKash' ? '"Send Money"' : '"Send Money"'}</strong> (not Cash Out). Tap the number above to copy.
          </p>

          <div className="pt-1 space-y-2">
            <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="Payment reference type">
              <button type="button" onClick={() => setIdMode('trx')}
                aria-selected={idMode === 'trx'} role="tab"
                className={`py-2 rounded-lg text-xs font-extrabold border-2 transition ${idMode === 'trx' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                I have TrxID
              </button>
              <button type="button" onClick={() => setIdMode('last4')}
                aria-selected={idMode === 'last4'} role="tab"
                className={`py-2 rounded-lg text-xs font-extrabold border-2 transition ${idMode === 'last4' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                Last 4 digits
              </button>
            </div>

            {idMode === 'trx' ? (
              <input
                autoFocus
                type="text"
                maxLength={16}
                placeholder="TrxID e.g. 9F7HK2M1XZ"
                value={trxId}
                onChange={(e) => setTrxId(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                aria-label="Transaction ID"
                className="w-full px-4 py-3.5 border border-slate-200 rounded-xl text-lg font-extrabold tracking-[0.3em] text-center uppercase focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            ) : (
              <input
                autoFocus
                type="tel"
                inputMode="numeric"
                maxLength={4}
                placeholder="e.g. 4503"
                value={last4}
                onChange={(e) => setLast4(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                aria-label="Last 4 digits of sender number"
                className="w-full px-4 py-3.5 border border-slate-200 rounded-xl text-xl font-extrabold tracking-[0.6em] text-center focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            )}
            <p className="text-[10px] text-slate-400 leading-relaxed">
              {idMode === 'trx'
                ? <>Find the TrxID in the {brandName} confirmation SMS after sending.</>
                : <>No TrxID? Just enter the last 4 digits of the mobile number you sent from — we will match it.</>}
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`w-full py-3.5 rounded-xl font-extrabold text-white text-sm transition disabled:bg-slate-300 ${method === 'bkash' ? 'bg-bkash hover:brightness-110' : 'bg-nagad hover:brightness-110'}`}
          >
            Confirm Payment
          </button>

          <p className="text-[10px] text-slate-400 text-center flex items-start justify-center gap-1 leading-relaxed">
            <ShieldCheck className="w-3 h-3 mt-0.5 shrink-0 text-emerald-500" />
            Your order will be placed as <strong>Pending</strong>. We verify the TrxID before shipping — usually within minutes during business hours.
          </p>
        </div>
      </div>
    </div>
  );
};
