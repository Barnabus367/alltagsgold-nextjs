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
  // Fallback auf Basic-Sanitization wenn nicht in Node.js
  if (typeof window !== 'undefined') {
    return sanitizeHTMLBasic(html, options);
  }

  try {
    // Dynamischer Import nur auf Server-Side
    const { JSDOM } = await import('jsdom');
    const createDOMPurify = await import('isomorphic-dompurify');
    
    const window = new JSDOM('').window as any;
    const DOMPurify = createDOMPurify.default(window);
    
    const config = {
      ALLOWED_TAGS: options.allowedTags || DEFAULT_ALLOWED_TAGS,
      ALLOWED_ATTR: options.allowedAttributes || DEFAULT_ALLOWED_ATTRIBUTES,
      REMOVE_EMPTY: options.removeEmpty ?? true
    };
    
    const sanitized = DOMPurify.sanitize(html, config);
    const plainText = extractPlainTextServer(sanitized, window);
    
    return {
      html: sanitized,
      plainText,
      isEmpty: !sanitized.trim(),
      originalLength: html.length,
      sanitized: true
    };
  } catch (error) {
    console.warn('Server-side HTML sanitization failed, using basic fallback:', error);
    return sanitizeHTMLBasic(html, options);
  }
}

/**
 * Extrahiert Plain Text mit Server-Side DOM
 */
function extractPlainTextServer(html: string, window: any): string {
  try {
    const doc = window.document;
    const temp = doc.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  } catch (error) {
    return extractPlainTextBasic(html);
  }
}

/**
 * Client-Side HTML Sanitization (für Browser)
 */
export async function sanitizeHTMLClient(html: string, options: SanitizeOptions = {}): Promise<SanitizedContent> {
  // Fallback auf Basic wenn nicht im Browser
  if (typeof window === 'undefined') {
    return sanitizeHTMLBasic(html, options);
  }

  try {
    // Dynamischer Import nur im Browser
    const DOMPurify = (await import('dompurify')).default;
    
    const config = {
      ALLOWED_TAGS: options.allowedTags || DEFAULT_ALLOWED_TAGS,
      ALLOWED_ATTR: options.allowedAttributes || DEFAULT_ALLOWED_ATTRIBUTES,
      REMOVE_EMPTY: options.removeEmpty ?? true
    };
    
    const sanitized = DOMPurify.sanitize(html, config);
    const plainText = extractPlainTextClient(sanitized);
    
    return {
      html: sanitized,
      plainText,
      isEmpty: !sanitized.trim(),
      originalLength: html.length,
      sanitized: true
    };
  } catch (error) {
    console.warn('Client-side HTML sanitization failed, using basic fallback:', error);
    return sanitizeHTMLBasic(html, options);
  }
}

/**
 * Extrahiert Plain Text mit Browser DOM
 */
function extractPlainTextClient(html: string): string {
  try {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  } catch (error) {
    return extractPlainTextBasic(html);
  }
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

  // Server-Side (Node.js)
  if (typeof window === 'undefined') {
    return await sanitizeHTMLServer(html, options);
  }
  
  // Client-Side (Browser)
  return await sanitizeHTMLClient(html, options);
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
