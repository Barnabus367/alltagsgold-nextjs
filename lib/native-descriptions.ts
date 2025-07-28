/**
 * NATIVE SHOPIFY CONTENT PROCESSING
 * Neue Logik für direkte HTML-Darstellung von Shopify-Beschreibungen
 */

import { sanitizeHTML, sanitizeHTMLBasic, extractPlainTextBasic, SanitizedContent } from './html-sanitizer';
import { getFeatureFlag } from './feature-flags';

export interface NativeContentResult {
  html: string;
  plainText: string;
  isEmpty: boolean;
  source: 'descriptionHtml' | 'description' | 'fallback';
  sections?: ContentSection[];
  metadata: {
    originalLength: number;
    processedLength: number;
    sanitized: boolean;
    fallbackUsed: boolean;
  };
}

export interface ContentSection {
  id: string;
  title: string;
  content: string;
  type: 'html' | 'list' | 'text';
}

/**
 * Hauptfunktion für Native Content Processing
 * Priorisiert descriptionHtml über description
 */
export async function generateNativeContent(productData: any): Promise<NativeContentResult> {
  const debugEnabled = getFeatureFlag('DEBUG_DESCRIPTION_PARSING');
  
  if (debugEnabled) {
    console.log('🔄 Processing Native Content for:', productData.title);
  }

  // 1. Content-Quelle bestimmen
  const descriptionHtml = productData.descriptionHtml?.trim();
  const descriptionText = productData.description?.trim();
  const productTitle = productData.title || 'Unbekanntes Produkt';

  let source: 'descriptionHtml' | 'description' | 'fallback' = 'fallback';
  let rawContent = '';

  if (descriptionHtml) {
    rawContent = descriptionHtml;
    source = 'descriptionHtml';
  } else if (descriptionText) {
    rawContent = descriptionText;
    source = 'description';
  } else {
    // Fallback für Produkte ohne Beschreibung
    rawContent = `<p>${productTitle}</p><p>Weitere Informationen folgen in Kürze.</p>`;
    source = 'fallback';
  }

  if (debugEnabled) {
    console.log(`📝 Content Source: ${source}, Length: ${rawContent.length}`);
  }

  // 2. Content sanitizen (wenn HTML)
  let sanitizedContent: SanitizedContent;
  
  if (source === 'descriptionHtml' || source === 'fallback') {
    // HTML-Content sanitizen
    sanitizedContent = await sanitizeHTML(rawContent);
  } else {
    // Plain-Text zu HTML konvertieren
    const htmlContent = convertTextToHtml(rawContent);
    sanitizedContent = await sanitizeHTML(htmlContent);
  }

  // 3. Content-Strukturierung (optional für kompatible UI)
  const sections = extractContentSections(sanitizedContent.html);

  // 4. Ergebnis zusammenstellen
  const result: NativeContentResult = {
    html: sanitizedContent.html,
    plainText: sanitizedContent.plainText,
    isEmpty: sanitizedContent.isEmpty,
    source,
    sections: sections.length > 0 ? sections : undefined,
    metadata: {
      originalLength: sanitizedContent.originalLength,
      processedLength: sanitizedContent.html.length,
      sanitized: getFeatureFlag('ENABLE_HTML_SANITIZATION'),
      fallbackUsed: source === 'fallback'
    }
  };

  if (debugEnabled) {
    console.log('✅ Native Content Result:', {
      source: result.source,
      htmlLength: result.html.length,
      plainTextLength: result.plainText.length,
      sectionsCount: result.sections?.length || 0,
      isEmpty: result.isEmpty
    });
  }

  return result;
}

/**
 * Plain-Text zu strukturiertem HTML konvertieren
 * Für description-Fallback bei fehlendem descriptionHtml
 */
function convertTextToHtml(text: string): string {
  if (!text) return '';

  return text
    // Doppelte Zeilenumbrüche zu Paragraphen
    .split('\n\n')
    .map(paragraph => paragraph.trim())
    .filter(paragraph => paragraph.length > 0)
    .map(paragraph => {
      // Einzelne Zeilenumbrüche zu <br> Tags
      const processedParagraph = paragraph.replace(/\n/g, '<br>');
      return `<p>${processedParagraph}</p>`;
    })
    .join('');
}

/**
 * Content-Sektionen aus HTML extrahieren
 * Für Backward-Kompatibilität mit bestehender UI-Struktur
 */
function extractContentSections(html: string): ContentSection[] {
  const sections: ContentSection[] = [];

  try {
    // Erweiterte Überschriften-basierte Extraktion
    const headingRegex = /<h[1-6][^>]*>(.*?)<\/h[1-6]>(.*?)(?=<h[1-6]|$)/gi;
    let match;
    let sectionIndex = 0;

    while ((match = headingRegex.exec(html)) !== null) {
      const title = extractPlainTextBasic(match[1]).trim();
      const content = match[2].trim();
      
      if (title && content) {
        sections.push({
          id: `section-${sectionIndex}`,
          title,
          content,
          type: content.includes('<ul>') || content.includes('<ol>') ? 'list' : 'html'
        });
        sectionIndex++;
      }
    }

    // Fallback: Wenn keine Überschriften, erstelle Basis-Sektion
    if (sections.length === 0 && html.trim()) {
      sections.push({
        id: 'main-content',
        title: 'Produktbeschreibung',
        content: html,
        type: 'html'
      });
    }

  } catch (error) {
    console.error('Fehler bei Content-Sektion-Extraktion:', error);
  }

  return sections;
}

/**
 * Content-Qualitäts-Validierung
 */
export function validateNativeContent(content: NativeContentResult): {
  isValid: boolean;
  score: number; // 0-100
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // Content-Länge bewerten
  if (content.plainText.length < 50) {
    issues.push('Beschreibung zu kurz (<50 Zeichen)');
    recommendations.push('Ausführlichere Produktbeschreibung für bessere SEO');
    score -= 20;
  }

  if (content.plainText.length > 2000) {
    issues.push('Beschreibung sehr lang (>2000 Zeichen)');
    recommendations.push('Kürzere, fokussiertere Beschreibung für bessere User Experience');
    score -= 10;
  }

  // HTML-Struktur bewerten
  if (content.source === 'fallback') {
    issues.push('Fallback-Content verwendet');
    recommendations.push('Produktbeschreibung in Shopify vervollständigen');
    score -= 30;
  }

  // Sanitization-Verlust bewerten
  const sanitizationLoss = (content.metadata.originalLength - content.metadata.processedLength) / content.metadata.originalLength;
  if (sanitizationLoss > 0.3) {
    issues.push('Viel Content durch Sanitization verloren (>30%)');
    recommendations.push('HTML-Struktur in Shopify überprüfen und bereinigen');
    score -= 15;
  }

  return {
    isValid: score >= 70,
    score: Math.max(0, score),
    issues,
    recommendations
  };
}

/**
 * Performance-Optimierung: Content-Caching
 */
const contentCache = new Map<string, NativeContentResult>();

export async function getCachedNativeContent(
  productHandle: string, 
  productData: any
): Promise<NativeContentResult> {
  
  if (!getFeatureFlag('ENABLE_DESCRIPTION_CACHE')) {
    return generateNativeContent(productData);
  }

  const cacheKey = `${productHandle}-${productData.updatedAt || 'no-timestamp'}`;
  
  if (contentCache.has(cacheKey)) {
    return contentCache.get(cacheKey)!;
  }

  const result = await generateNativeContent(productData);
  
  // Cache-Size-Limit (max 100 Einträge)
  if (contentCache.size >= 100) {
    const firstKey = contentCache.keys().next().value;
    if (firstKey) {
      contentCache.delete(firstKey);
    }
  }
  
  contentCache.set(cacheKey, result);
  return result;
}

/**
 * Cache-Management
 */
export function clearContentCache(): void {
  contentCache.clear();
}

export function getCacheStats(): { size: number; maxSize: number } {
  return {
    size: contentCache.size,
    maxSize: 100
  };
}
