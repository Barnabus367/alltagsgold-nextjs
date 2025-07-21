/**
 * PWA Component für App-Installation und Offline-Status - Simplified
 */

import { useState, useEffect, useRef } from 'react';

export function PWAProvider({ children }: { children: React.ReactNode }) {
  // Temporär vereinfacht - keine komplexe PWA-Logik während Development
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      {/* PWA-Features nur in Production */}
    </>
  );
}
