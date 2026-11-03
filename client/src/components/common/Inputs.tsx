import React, { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-content-primary">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'w-full px-3.5 py-2 text-sm bg-white border border-surface-border rounded-lg placeholder:text-content-muted focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-brand-orange transition-colors disabled:bg-surface-muted disabled:text-content-muted',
            error && 'border-status-error focus:ring-status-error focus:border-status-error',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-status-error font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-content-secondary">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-content-primary">
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          className={cn(
            'w-full px-3.5 py-2 text-sm bg-white border border-surface-border rounded-lg placeholder:text-content-muted focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-brand-orange transition-colors disabled:bg-surface-muted',
            error && 'border-status-error focus:ring-status-error focus:border-status-error',
            className
          )}
          rows={3}
          {...props}
        />
        {error && <p className="text-xs text-status-error font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-content-secondary">{helperText}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, className, id, children, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-content-primary">
            {label}
          </label>
        )}
        <select
          id={inputId}
          ref={ref}
          className={cn(
            'w-full px-3.5 py-2 text-sm bg-white border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-brand-orange transition-colors',
            error && 'border-status-error focus:ring-status-error',
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-xs text-status-error font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-content-secondary">{helperText}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
