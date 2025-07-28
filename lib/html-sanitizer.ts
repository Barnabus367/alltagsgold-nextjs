/**
 * HTML SANITIZATION UTILITY
 * Next.js-kompatible Lösung für sichere HTML-Verarbeitung
 */

import { getFeatureFlag } from './feature-flags';

// Typen für verschiedene Sanitization-Modi
export interface SanitizeOptions {
  allowedTags?: string[];
  allowedAttributes?: string[];
  removeEmpty?: boolean;
  maxLength?: number;
}

export interface SanitizedContent {
  html: string;
  plainText: string;
  isEmpty: boolean;
  originalLength: number;
  sanitized: boolean;
}

// Standard-Konfiguration für sichere HTML-Tags
const DEFAULT_ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'div', 'span', 'a', 'blockquote', 'hr'
];

const DEFAULT_ALLOWED_ATTRIBUTES = [
  'href', 'title', 'alt', 'class', 'id'
];

/**
 * Einfache HTML-Sanitization ohne externe Dependencies
 * Verwendet native DOM-API wenn verfügbar
 */
export function sanitizeHTMLBasic(html: string, options: SanitizeOptions = {}): SanitizedContent {
  if (!html || typeof html !== 'string') {
    return {
      html: '',
      plainText: '',
      isEmpty: true,
      originalLength: 0,
      sanitized: true
    };
  }

  const originalLength = html.length;
  
  // Einfache HTML-Bereinigung mit Regex
  let sanitized = html
    // Entferne gefährliche Tags
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
    .replace(/<input\b[^<]*(?:(?!<\/input>)<[^<]*)*<\/input>/gi, '')
    // Entferne on-Event Handler
    .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '')
    // Entferne javascript: URLs
    .replace(/href\s*=\s*["']javascript:[^"']*["']/gi, '')
    .replace(/src\s*=\s*["']javascript:[^"']*["']/gi, '');

  // Extrahiere Plain Text
  const plainText = extractPlainTextBasic(sanitized);
  
  const result: SanitizedContent = {
    html: sanitized.trim(),
    plainText: plainText.trim(),
    isEmpty: !sanitized.trim() || !plainText.trim(),
    originalLength,
    sanitized: true
  };

  // Wende Längen-Limitierung an
  if (options.maxLength && result.html.length > options.maxLength) {
    result.html = result.html.slice(0, options.maxLength) + '...';
  }

  return result;
}

/**
 * Extrahiert Plain Text aus HTML ohne externe Dependencies
 */
export function extractPlainTextBasic(html: string): string {
  if (!html) return '';
  
  return html
    // Entferne HTML-Tags
    .replace(/<[^>]*>/g, ' ')
    // Ersetze HTML-Entitäten
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&hellip;/g, '...')
    // Normalisiere Whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Server-Side HTML Sanitization (für API Routes)
 * Diese Funktion kann nur in Node.js-Umgebung verwendet werden
 */
export async function sanitizeHTMLServer(html: string, options: SanitizeOptions = {}): Promise<SanitizedContent> {
  // Fallback auf Basic-Sanitization da externe Dependencies zu komplex für Next.js Build
  return sanitizeHTMLBasic(html, options);
}



/**
 * Automatische HTML-Sanitization
 * Wählt die beste verfügbare Methode basierend auf Umgebung
 */
export async function sanitizeHTML(html: string, options: SanitizeOptions = {}): Promise<SanitizedContent> {
  if (!getFeatureFlag('USE_NATIVE_DESCRIPTIONS')) {
    return {
      html: '',
      plainText: '',
      isEmpty: true,
      originalLength: 0,
      sanitized: false
    };
  }

  // Für jetzt verwenden wir überall Basic-Sanitization
  return sanitizeHTMLBasic(html, options);
}

/**
 * Synchrone Fallback-Sanitization
 * Für Situationen wo async nicht möglich ist
 */
export function sanitizeHTMLSync(html: string, options: SanitizeOptions = {}): SanitizedContent {
  return sanitizeHTMLBasic(html, options);
}

/**
 * Validiert HTML-Content auf potentielle Sicherheitsrisiken
 */
export function validateHTMLSafety(html: string): { safe: boolean; issues: string[] } {
  const issues: string[] = [];
  
  if (/<script\b/i.test(html)) issues.push('Contains script tags');
  if (/<iframe\b/i.test(html)) issues.push('Contains iframe tags');
  if (/on\w+\s*=/i.test(html)) issues.push('Contains event handlers');
  if (/javascript:/i.test(html)) issues.push('Contains javascript: URLs');
  if (/<object\b/i.test(html)) issues.push('Contains object tags');
  if (/<embed\b/i.test(html)) issues.push('Contains embed tags');
  
  return {
    safe: issues.length === 0,
    issues
  };
}

// Exportiere die wichtigsten Funktionen als Standard
export { extractPlainTextBasic as extractPlainText };
