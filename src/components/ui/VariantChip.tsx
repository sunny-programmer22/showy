import React from 'react';

export const VariantChip: React.FC<{ label?: string | null }> = ({ label }) => {
  if (!label) return null;
  return (
    <span className="inline-block text-[10px] font-extrabold uppercase tracking-wide text-slate-500 bg-slate-200/70 border border-slate-300/70 rounded-md px-1.5 py-0.5 mr-1">
      {label}
    </span>
  );
};
