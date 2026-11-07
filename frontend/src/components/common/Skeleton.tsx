import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden p-0 shadow-sm animate-pulse">
      <div className="aspect-[4/3] bg-slate-100 w-full" />
      <div className="p-5 space-y-3">
        <div className="flex justify-between">
          <div className="h-3 bg-slate-100 rounded w-1/3" />
          <div className="h-3 bg-slate-100 rounded w-1/6" />
        </div>
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-3 bg-slate-100 rounded w-full" />
        <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
          <div className="h-5 bg-slate-200 rounded w-1/4" />
          <div className="h-7 bg-slate-200 rounded-xl w-1/4" />
        </div>
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="w-full space-y-3 animate-pulse">
      <div className="h-8 bg-slate-100 rounded-xl w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 bg-slate-50 border border-slate-100 rounded-xl w-full" />
      ))}
    </div>
  );
};
