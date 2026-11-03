import React, { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'teal' | 'navy' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';

  const variants = {
    primary: 'bg-gradient-to-r from-brand-orange to-[#FF7A45] text-white hover:from-brand-orange-hover hover:to-brand-orange shadow-md shadow-brand-orange/20 hover:shadow-lg hover:shadow-brand-orange/25 focus:ring-brand-orange',
    teal: 'bg-gradient-to-r from-brand-teal to-[#14B8A6] text-white hover:from-brand-teal-hover hover:to-brand-teal shadow-md shadow-brand-teal/20 hover:shadow-lg hover:shadow-brand-teal/25 focus:ring-brand-teal',
    navy: 'bg-gradient-to-r from-brand-navy to-[#1E293B] text-white hover:from-[#1E293B] hover:to-brand-navy shadow-md shadow-slate-900/15 hover:shadow-lg hover:shadow-slate-900/20 focus:ring-brand-navy',
    outline: 'border border-surface-border bg-white text-content-primary hover:bg-slate-50 hover:border-slate-300 shadow-xs focus:ring-brand-orange',
    ghost: 'text-content-secondary hover:text-content-primary hover:bg-slate-100/80 focus:ring-brand-orange',
    danger: 'bg-gradient-to-r from-status-error to-rose-600 text-white hover:from-red-600 hover:to-rose-700 shadow-md shadow-red-500/20 focus:ring-status-error'
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5 font-semibold'
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};
