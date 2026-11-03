import React, { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export const Card: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'bg-white/95 backdrop-blur-sm border border-slate-200/90 rounded-2xl shadow-[0_2px_12px_-2px_rgba(15,23,42,0.05)] hover:shadow-[0_8px_24px_-4px_rgba(15,23,42,0.08)] transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn('px-6 py-4 border-b border-surface-border/60 flex items-center justify-between', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTitle: React.FC<HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <h3
      className={cn('font-semibold text-content-primary text-base', className)}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardContent: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={cn('p-6', className)} {...props}>
      {children}
    </div>
  );
};
