import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

type Listener = (t: ToastItem) => void;

let listeners: Listener[] = [];
let counter = 0;

const emit = (type: ToastType, message: string) => {
  const item = { id: ++counter, type, message };
  listeners.forEach((l) => l(item));
};

/** Drop-in replacement for alert():
 *  toast.success('Saved!') · toast.error('Failed') · toast.info('Heads up') */
export const toast = {
  success: (message: string) => emit('success', message),
  error: (message: string) => emit('error', message),
  info: (message: string) => emit('info', message),
};

const TOAST_DURATION = 3800;

const STYLES: Record<ToastType, { Icon: typeof CheckCircle2; chip: string }> = {
  success: { Icon: CheckCircle2, chip: 'bg-emerald-50 text-emerald-500' },
  error: { Icon: XCircle, chip: 'bg-rose-50 text-rose-500' },
  info: { Icon: Info, chip: 'bg-brand-50 text-brand-500' },
};

export const Toaster: React.FC = () => {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const listener: Listener = (t) => {
      setItems((prev) => [...prev.slice(-2), t]);
      window.setTimeout(() => {
        setItems((prev) => prev.filter((x) => x.id !== t.id));
      }, TOAST_DURATION);
    };
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  const dismiss = (id: number) =>
    setItems((prev) => prev.filter((x) => x.id !== id));

  /* Sits above the mobile bottom nav (bottom-20) */
  return (
    <div
      aria-live="polite"
      className="fixed z-[80] bottom-20 left-4 right-4 sm:left-auto sm:bottom-6 sm:w-[24rem] flex flex-col gap-2 pointer-events-none"
    >
      {items.map((t) => {
        const { Icon, chip } = STYLES[t.type];
        return (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex items-center gap-3 bg-white border border-slate-100 shadow-lift rounded-2xl p-3.5 animate-pop-in"
          >
            <span className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${chip}`}>
              <Icon size={17} />
            </span>
            <p className="flex-1 min-w-0 text-sm font-semibold text-slate-700 leading-snug">
              {t.message}
            </p>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="shrink-0 p-1 text-slate-300 hover:text-slate-500 transition"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
