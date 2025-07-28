/**
 * FEATURE FLAGS SYSTEM
 * Sichere Kontrolle über experimentelle Features
 */

export interface FeatureFlags {
  USE_NATIVE_DESCRIPTIONS: boolean;
  ENABLE_HTML_SANITIZATION: boolean;
  ENABLE_DESCRIPTION_CACHE: boolean;
  DEBUG_DESCRIPTION_PARSING: boolean;
}

/**
 * Hauptkonfiguration für Feature Flags
 * Sicherheitsbasiert: Nur explizite Aktivierung möglich
 */
export const FEATURE_FLAGS: FeatureFlags = {
  // Native Shopify HTML Descriptions (Hauptfeature)
  USE_NATIVE_DESCRIPTIONS: 
    process.env.NODE_ENV === 'development' ||
    process.env.VERCEL_ENV === 'preview' ||
    process.env.ENABLE_NATIVE_DESCRIPTIONS === 'true',
  
  // HTML Sanitization aktivieren
  ENABLE_HTML_SANITIZATION: true,
  
  // Description Caching (für Performance)
  ENABLE_DESCRIPTION_CACHE: 
    process.env.NODE_ENV === 'production',
  
  // Debug Logging für Description Parsing
  DEBUG_DESCRIPTION_PARSING: 
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_DESCRIPTIONS === 'true'
};

/**
 * Feature Flag Getter mit Fallback-Sicherheit
 */
export function getFeatureFlag(flag: keyof FeatureFlags): boolean {
  try {
    return FEATURE_FLAGS[flag] || false;
  } catch (error) {
    console.warn(`Feature flag "${flag}" nicht verfügbar, verwende Fallback: false`);
    return false;
  }
}

/**
 * Development-Helper für Feature Flag Status
 */
export function logFeatureFlagStatus(): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('🏗️  Feature Flags Status:');
    Object.entries(FEATURE_FLAGS).forEach(([key, value]) => {
      console.log(`   ${key}: ${value ? '✅ ENABLED' : '❌ DISABLED'}`);
    });
  }
}

/**
 * Branch-spezifische Konfiguration
 */
export const BRANCH_CONFIG = {
  CURRENT_BRANCH: process.env.VERCEL_GIT_COMMIT_REF || 'local',
  IS_FEATURE_BRANCH: process.env.VERCEL_GIT_COMMIT_REF?.includes('feature/native-descriptions') || false,
  IS_PREVIEW_DEPLOYMENT: process.env.VERCEL_ENV === 'preview'
};

// Development Log
if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
  logFeatureFlagStatus();
}
