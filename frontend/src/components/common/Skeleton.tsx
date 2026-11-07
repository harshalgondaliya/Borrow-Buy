import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-3xl border border-charcoal-200/80 overflow-hidden shadow-card animate-pulse">
      <div className="aspect-[4/3] bg-charcoal-100 w-full" />
      <div className="p-5 space-y-3.5">
        <div className="flex justify-between items-center">
          <div className="h-3.5 bg-charcoal-100 rounded-lg w-1/3" />
          <div className="h-3.5 bg-charcoal-100 rounded-lg w-1/6" />
        </div>
        <div className="h-4.5 bg-charcoal-200 rounded-lg w-3/4" />
        <div className="h-3 bg-charcoal-100 rounded-lg w-1/2" />
        <div className="pt-3.5 border-t border-charcoal-100 flex justify-between items-center">
          <div className="h-6 bg-charcoal-200 rounded-lg w-1/3" />
          <div className="h-8 bg-charcoal-200 rounded-xl w-1/4" />
        </div>
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="w-full space-y-3 animate-pulse">
      <div className="h-9 bg-charcoal-100 rounded-xl w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 bg-charcoal-50 border border-charcoal-100 rounded-2xl w-full" />
      ))}
    </div>
  );
};
