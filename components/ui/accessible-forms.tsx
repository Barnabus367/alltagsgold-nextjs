/**
 * Accessibility-optimierte Form-Komponenten für mobile und Desktop
 * Ergänzt die bestehenden UI-Komponenten mit WCAG 2.1 AA Standards
 */

import React, { forwardRef, useId, useState } from 'react';
import { cn } from '@/lib/utils';
import { announceToScreenReader } from '@/lib/accessibility';
import { useMobileUX } from '@/hooks/useMobileUX';

interface AccessibleFormFieldProps {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  children: React.ReactElement;
  className?: string;
}

export function AccessibleFormField({ 
  label, 
  error, 
  helperText, 
  required = false, 
  children, 
  className 
}: AccessibleFormFieldProps) {
  const fieldId = useId();
  const helperId = useId();
  const errorId = useId();
  const { getTouchClasses } = useMobileUX();

  // Clone child element with proper IDs and ARIA attributes
  const childWithProps = React.cloneElement(children, {
    id: fieldId,
    'aria-describedby': cn(
      helperText && helperId,
      error && errorId
    ).trim() || undefined,
    'aria-invalid': error ? 'true' : 'false',
    'aria-required': required,
    required,
  });

  return (
    <div className={cn('space-y-2', className)}>
      <label 
        htmlFor={fieldId}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="Pflichtfeld">
            *
          </span>
        )}
      </label>
      
      {childWithProps}
      
      {helperText && (
        <p 
          id={helperId}
          className="text-sm text-gray-500 dark:text-gray-400"
        >
          {helperText}
        </p>
      )}
      
      {error && (
        <p 
          id={errorId}
          className="text-sm text-red-600 dark:text-red-400"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
}

interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const AccessibleInput = forwardRef<HTMLInputElement, AccessibleInputProps>(
  ({ className, type = 'text', error, ...props }, ref) => {
    const { capabilities, getTouchClasses } = useMobileUX();
    
    return (
      <input
        type={type}
        className={cn(
          // Base styles
          'flex w-full rounded-md border px-3 py-2 text-sm',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-muted-foreground',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-colors duration-200',
          // Touch optimization
          getTouchClasses(),
          capabilities.supportsTouch ? 'min-h-[44px]' : 'h-10',
          // Default border and background
          error 
            ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500 dark:border-red-600 dark:bg-red-900/20' 
            : 'border-gray-300 bg-white focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800',
          // Dark mode
          'dark:text-white dark:placeholder:text-gray-400',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
AccessibleInput.displayName = 'AccessibleInput';

interface AccessibleTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const AccessibleTextarea = forwardRef<HTMLTextAreaElement, AccessibleTextareaProps>(
  ({ className, error, ...props }, ref) => {
    const { getTouchClasses } = useMobileUX();
    
    return (
      <textarea
        className={cn(
          // Base styles
          'flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm',
          'placeholder:text-muted-foreground resize-vertical',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-colors duration-200',
          // Touch optimization
          getTouchClasses(),
          // Default border and background
          error 
            ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500 dark:border-red-600 dark:bg-red-900/20' 
            : 'border-gray-300 bg-white focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800',
          // Dark mode
          'dark:text-white dark:placeholder:text-gray-400',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
AccessibleTextarea.displayName = 'AccessibleTextarea';

interface AccessibleSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  placeholder?: string;
}

export const AccessibleSelect = forwardRef<HTMLSelectElement, AccessibleSelectProps>(
  ({ className, children, error, placeholder, ...props }, ref) => {
    const { capabilities, getTouchClasses } = useMobileUX();
    
    return (
      <select
        className={cn(
          // Base styles
          'flex w-full rounded-md border px-3 py-2 text-sm bg-white',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-colors duration-200',
          // Touch optimization
          getTouchClasses(),
          capabilities.supportsTouch ? 'min-h-[44px]' : 'h-10',
          // Default border and background
          error 
            ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500 dark:border-red-600 dark:bg-red-900/20' 
            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800',
          // Dark mode
          'dark:text-white',
          className
        )}
        ref={ref}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children}
      </select>
    );
  }
);
AccessibleSelect.displayName = 'AccessibleSelect';

interface AccessibleCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: boolean;
}

export const AccessibleCheckbox = forwardRef<HTMLInputElement, AccessibleCheckboxProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const generatedId = useId();
    const checkboxId = id || generatedId;
    const { capabilities, getTouchClasses } = useMobileUX();
    
    return (
      <div className="flex items-start space-x-3">
        <div className="flex items-center h-5">
          <input
            type="checkbox"
            id={checkboxId}
            className={cn(
              // Base styles
              'rounded border-gray-300 text-blue-600',
              'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'transition-colors duration-200',
              // Touch optimization
              getTouchClasses(),
              capabilities.supportsTouch 
                ? 'h-6 w-6 min-h-[44px] min-w-[44px] p-2' 
                : 'h-4 w-4',
              // Error state
              error && 'border-red-300 focus:ring-red-500',
              className
            )}
            ref={ref}
            aria-invalid={error ? 'true' : 'false'}
            {...props}
          />
        </div>
        <div className="text-sm">
          <label 
            htmlFor={checkboxId}
            className="font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
          >
            {label}
          </label>
        </div>
      </div>
    );
  }
);
AccessibleCheckbox.displayName = 'AccessibleCheckbox';

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false, 
    disabled, 
    children, 
    ...props 
  }, ref) => {
    const { capabilities, getTouchClasses } = useMobileUX();
    
    const baseClasses = cn(
      // Base styles
      'inline-flex items-center justify-center rounded-md font-medium',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'transition-all duration-200',
      // Touch optimization
      getTouchClasses(),
      // Size variants
      {
        'text-sm px-3': size === 'sm',
        'text-sm px-4': size === 'md', 
        'text-base px-6': size === 'lg',
      },
      // Height based on touch capability
      {
        'py-1.5 min-h-[32px]': size === 'sm' && !capabilities.supportsTouch,
        'py-2 min-h-[36px]': size === 'md' && !capabilities.supportsTouch,
        'py-3 min-h-[40px]': size === 'lg' && !capabilities.supportsTouch,
        'py-2.5 min-h-[44px]': size === 'sm' && capabilities.supportsTouch,
        'py-3 min-h-[44px]': size === 'md' && capabilities.supportsTouch,
        'py-4 min-h-[48px]': size === 'lg' && capabilities.supportsTouch,
      },
      // Variant styles
      {
        'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500': variant === 'primary',
        'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500': variant === 'secondary',
        'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500': variant === 'outline',
        'text-gray-700 hover:bg-gray-100 focus:ring-gray-500': variant === 'ghost',
      }
    );

    return (
      <button
        className={cn(baseClasses, className)}
        disabled={disabled || loading}
        ref={ref}
        aria-disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent">
            <span className="sr-only">Laden...</span>
          </div>
        )}
        {children}
      </button>
    );
  }
);
AccessibleButton.displayName = 'AccessibleButton';

interface AccessibleFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  onSubmit?: (e: React.FormEvent) => Promise<void> | void;
  submitButton?: React.ReactNode;
}

export const AccessibleForm = forwardRef<HTMLFormElement, AccessibleFormProps>(
  ({ className, onSubmit, children, submitButton, ...props }, ref) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (isSubmitting) return;
      
      setIsSubmitting(true);
      setSubmitStatus('idle');
      announceToScreenReader('Formular wird gesendet');
      
      try {
        await onSubmit?.(e);
        setSubmitStatus('success');
        announceToScreenReader('Formular erfolgreich gesendet');
      } catch (error) {
        setSubmitStatus('error');
        announceToScreenReader('Fehler beim Senden des Formulars');
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <form
        className={cn('space-y-6', className)}
        onSubmit={handleSubmit}
        ref={ref}
        noValidate
        {...props}
      >
        {children}
        
        {/* Default submit button if none provided */}
        {submitButton || (
          <AccessibleButton
            type="submit"
            loading={isSubmitting}
            variant="primary"
            size="md"
            className="w-full"
          >
            Senden
          </AccessibleButton>
        )}
        
        {/* Status indicators */}
        {submitStatus === 'success' && (
          <div 
            className="p-3 bg-green-50 border border-green-200 rounded-md text-green-800"
            role="alert"
            aria-live="polite"
          >
            Formular erfolgreich gesendet!
          </div>
        )}
        
        {submitStatus === 'error' && (
          <div 
            className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800"
            role="alert"
            aria-live="polite"
          >
            Fehler beim Senden. Bitte versuchen Sie es erneut.
          </div>
        )}
        
        {/* Hidden status region for screen readers */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {isSubmitting && 'Formular wird gesendet...'}
          {submitStatus === 'success' && 'Formular erfolgreich gesendet'}
          {submitStatus === 'error' && 'Fehler beim Senden des Formulars'}
        </div>
      </form>
    );
  }
);
AccessibleForm.displayName = 'AccessibleForm';
