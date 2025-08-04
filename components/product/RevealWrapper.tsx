import React, { useEffect } from 'react';
import { useRevealAnimation } from '@/hooks/useRevealAnimation';

interface RevealWrapperProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fade-up' | 'fade-left' | 'fade-right' | 'scale';
  delay?: number;
  threshold?: number;
}

export function RevealWrapper({ 
  children, 
  className = '', 
  animation = 'fade-up',
  delay = 0,
  threshold = 0.1 
}: RevealWrapperProps) {
  const { elementRef, isRevealed } = useRevealAnimation({ threshold });

  return (
    <div
      ref={elementRef as React.RefObject<HTMLDivElement>}
      className={`reveal-element reveal-${animation} ${className} ${isRevealed ? 'revealed' : ''}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}