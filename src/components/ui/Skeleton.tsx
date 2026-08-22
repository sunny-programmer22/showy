import React from 'react';

/** Shimmer placeholder block. aria-hidden so screen readers skip it. */
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse rounded-xl bg-slate-200/70 ${className}`} aria-hidden="true" />
);

/** Mirrors ProductCard markup for a seamless loading→content swap */
export const ProductCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl border border-slate-200/70 shadow-soft overflow-hidden flex flex-col">
    <Skeleton className="aspect-square rounded-none" />
    <div className="p-4">
      <Skeleton className="h-3 w-24 mb-2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/5 mt-1.5" />
      <Skeleton className="h-3 w-16 mt-3" />
      <div className="mt-4 pt-3 border-t border-dashed border-slate-200 flex items-center justify-between">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="w-10 h-10 !rounded-xl" />
      </div>
    </div>
  </div>
);

export const ProductGridSkeleton: React.FC<{ count?: number; className?: string }> = ({
  count = 8,
  className = '',
}) => (
  <div className={`grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}>
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);
