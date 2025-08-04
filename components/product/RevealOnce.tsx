import React from 'react';
import { useRevealOnce } from '@/hooks/useSubtleScrollEffects';

interface RevealOnceProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fade-up' | 'fade-left' | 'fade-right' | 'scale';
  delay?: number;
}

export function RevealOnce({ 
  children, 
  className = '', 
  animation = 'fade-up',
  delay = 0 
}: RevealOnceProps) {
  const { elementRef, isRevealed } = useRevealOnce(0.1);
  
  const animationClass = {
    'fade-up': 'animate-fadeInUp',
    'fade-left': 'animate-fadeInLeft',
    'fade-right': 'animate-fadeInRight',
    'scale': 'animate-scaleIn'
  }[animation];
  
  return (
    <div
      ref={elementRef as React.RefObject<HTMLDivElement>}
      className={`reveal-once ${isRevealed ? 'revealed' : ''} ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}