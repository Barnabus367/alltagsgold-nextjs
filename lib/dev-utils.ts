/**
 * Development-only utilities
 * Diese Utilities sind nur in der Entwicklungsumgebung aktiv
 */

/**
 * Development-only console.log
 * In Production wird nichts geloggt
 */
export const devLog = (...args: any[]) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(...args);
  }
};

/**
 * Development-only console.warn
 */
export const devWarn = (...args: any[]) => {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(...args);
  }
};

/**
 * Development-only console.error
 */
export const devError = (...args: any[]) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error(...args);
  }
};

/**
 * Check if we're in development mode
 */
export const isDev = () => process.env.NODE_ENV !== 'production';