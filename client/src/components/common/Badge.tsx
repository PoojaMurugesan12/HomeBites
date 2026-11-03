import React, { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'teal' | 'orange' | 'navy' | 'outline';
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className,
  size = 'md'
}) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border border-slate-200/80',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 ring-1 ring-emerald-500/10',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200/80 ring-1 ring-amber-500/10',
    error: 'bg-rose-50 text-rose-700 border border-rose-200/80 ring-1 ring-rose-500/10',
    teal: 'bg-teal-50 text-teal-800 border border-teal-200/80 ring-1 ring-teal-500/10',
    orange: 'bg-orange-50 text-brand-orange border border-orange-200/80 ring-1 ring-brand-orange/15 font-semibold',
    navy: 'bg-slate-900 text-slate-100 border border-slate-800 shadow-xs',
    outline: 'border border-slate-200 text-slate-600 bg-white/70 backdrop-blur-xs'
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full gap-1',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
};
