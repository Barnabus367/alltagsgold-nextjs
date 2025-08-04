import React from 'react';
import { useRippleEffect } from '@/hooks/useMicroInteractions';
import { cn } from '@/lib/utils';

interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export function RippleButton({ 
  children, 
  className,
  variant = 'primary',
  ...props 
}: RippleButtonProps) {
  const rippleRef = useRippleEffect();
  
  const variantStyles = {
    primary: 'bg-black text-white hover:bg-gray-800',
    secondary: 'bg-white text-black border-2 border-black hover:bg-gray-50',
    ghost: 'bg-transparent text-black hover:bg-gray-100'
  };
  
  return (
    <button
      ref={rippleRef as React.RefObject<HTMLButtonElement>}
      className={cn(
        'relative overflow-hidden px-6 py-3 rounded-lg transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}