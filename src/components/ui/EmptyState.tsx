import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) => (
  <div className="flex flex-col items-center justify-center text-center py-14 px-4">
    <div className="relative mb-4">
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-brand-100 to-indigo-100 blur-lg opacity-70" />
      <div className="relative w-16 h-16 rounded-3xl bg-white shadow-soft border border-slate-100 flex items-center justify-center text-brand-400">
        <Icon size={28} strokeWidth={1.8} />
      </div>
    </div>
    <h3 className="font-display text-lg font-bold text-slate-900">{title}</h3>
    {description && (
      <p className="mt-1.5 text-sm text-slate-500 max-w-xs leading-relaxed">{description}</p>
    )}
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="btn-shine mt-6 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition"
      >
        {actionLabel}
      </button>
    )}
  </div>
);
