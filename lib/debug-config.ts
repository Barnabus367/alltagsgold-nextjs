/**
 * Debug Configuration - Zentrale Steuerung für Development-Tools
 * 
 * WICHTIG: Diese Konfiguration hat KEINEN Einfluss auf Production!
 * Alle Debug-Features sind in Production automatisch deaktiviert.
 */

export const debugConfig = {
  // Einzelne Debug-Features - müssen explizit aktiviert werden
  enableAnalyticsDashboard: process.env.NEXT_PUBLIC_DEBUG_ANALYTICS === 'true',
  enableClickTracking: process.env.NEXT_PUBLIC_DEBUG_CLICKS === 'true',
  enableNavigationDiagnostics: process.env.NEXT_PUBLIC_DEBUG_NAVIGATION === 'true',
  enablePerformanceMonitoring: process.env.NEXT_PUBLIC_DEBUG_PERFORMANCE === 'true',
  enableConsoleLogging: process.env.NEXT_PUBLIC_DEBUG_CONSOLE === 'true',
  
  // Master-Switch für alle Debug-Tools
  enableAllDebugTools: process.env.NEXT_PUBLIC_DEBUG_ALL === 'true',
};

/**
 * Helper-Funktion zum sicheren Prüfen von Debug-Features
 * @param feature - Name des Debug-Features
 * @returns true wenn Feature aktiviert ist UND wir im Development sind
 */
export const isDebugEnabled = (feature: keyof typeof debugConfig): boolean => {
  // In Production sind ALLE Debug-Features deaktiviert
  if (process.env.NODE_ENV === 'production') return false;
  
  // In Development: Prüfe ob Feature aktiviert ist
  return debugConfig.enableAllDebugTools || debugConfig[feature];
};

/**
 * Debug-Logger - Nur wenn Console-Logging aktiviert ist
 */
export const debugLog = (...args: any[]) => {
  if (isDebugEnabled('enableConsoleLogging')) {
    console.log('[DEBUG]', ...args);
  }
};

/**
 * Performance-Logger - Nur wenn Performance-Monitoring aktiviert ist
 */
export const perfLog = (label: string, ...args: any[]) => {
  if (isDebugEnabled('enablePerformanceMonitoring')) {
    console.log(`[PERF:${label}]`, ...args);
  }
};