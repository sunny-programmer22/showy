import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, HelpCircle } from 'lucide-react';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  /** Red destructive styling for deletes/rejects */
  danger?: boolean;
}

type Resolver = (confirmed: boolean) => void;

interface ActiveConfirm {
  opts: ConfirmOptions;
  resolve: Resolver;
}

let askHandler: ((opts: ConfirmOptions) => Promise<boolean>) | null = null;

/** Promise-based replacement for window.confirm():
 *  `if (await confirmDialog({ message: 'Delete product?', danger: true })) …` */
export const confirmDialog = (opts: ConfirmOptions | string): Promise<boolean> => {
  const normalized: ConfirmOptions =
    typeof opts === 'string' ? { message: opts } : opts;
  if (askHandler) return askHandler(normalized);
  return Promise.resolve(false);
};

const FOCUSABLE = 'button:not([disabled]), [href], input, select, textarea';

export const ConfirmDialogHost: React.FC = () => {
  const [active, setActive] = useState<ActiveConfirm | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    askHandler = (opts) =>
      new Promise<boolean>((resolve) => {
        setActive((prev) => {
          prev?.resolve(false); // auto-cancel any pending prompt
          return { opts, resolve };
        });
      });
    return () => {
      askHandler = null;
    };
  }, []);

  const isOpen = !!active;

  useEffect(() => {
    if (!isOpen) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    confirmBtnRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close(false);
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const nodes = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (nodes.length === 0) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [isOpen]);

  const close = (result: boolean) => {
    active?.resolve(result);
    setActive(null);
    restoreFocusRef.current?.focus?.();
  };

  if (!active) return null;
  const { opts } = active;
  const danger = opts.danger ?? false;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-4 bg-slate-900/45 backdrop-blur-[2px] animate-fadeIn"
      onMouseDown={(e) => e.target === e.currentTarget && close(false)}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        className="w-full max-w-sm bg-white rounded-3xl shadow-lift p-6 animate-pop-in"
      >
        <div className="flex items-start gap-4">
          <span
            className={`shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center ${
              danger ? 'bg-rose-50 text-rose-500' : 'bg-brand-50 text-brand-500'
            }`}
          >
            {danger ? <AlertTriangle size={20} /> : <HelpCircle size={20} />}
          </span>
          <div className="min-w-0">
            <h3 id="confirm-title" className="font-display text-base font-bold text-slate-900">
              {opts.title ?? (danger ? 'Are you sure?' : 'Please confirm')}
            </h3>
            <p id="confirm-message" className="mt-1 text-sm text-slate-500 leading-relaxed">
              {opts.message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => close(false)}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
          >
            {opts.cancelText ?? 'Cancel'}
          </button>
          <button
            ref={confirmBtnRef}
            onClick={() => close(true)}
            className={`btn-shine flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition ${
              danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-brand-500 hover:bg-brand-600'
            }`}
          >
            {opts.confirmText ?? 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};
