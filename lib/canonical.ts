/**
 * Canonical URL Utilities für SEO-optimierte URLs
 * Entfernt Query-Parameter und stellt konsistente Domain sicher
 */

// Robuste SITE_URL Konfiguration mit Fallback
// Priorität: 1. Env Variable, 2. Production Check, 3. Fallback
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 
                       (process.env.VERCEL_ENV === 'production' ? 'https://www.alltagsgold.ch' : 
                        process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : null) ||
                       'https://www.alltagsgold.ch';

/**
 * Bereinigt URL von SEO-schädlichen Query-Parametern
 */
export function cleanUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    
    // Liste der Query-Parameter die entfernt werden sollen
    const parametersToRemove = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'ref', 'source', 'fbclid', 'gclid', 'msclkid', 'mc_cid', 'mc_eid',
      '_ga', '_gl', 'igshid', 'campaign', 'adgroup', 'keyword',
      // Varianten-Parameter für Canonical entfernen
      'variant', 'variantId', 'selectedVariant'
    ];
    
    // Entferne alle problematischen Parameter
    parametersToRemove.forEach(param => {
      urlObj.searchParams.delete(param);
    });
    
    // Entferne Pagination für Canonical (außer bei legitimen Paginationen)
    const page = urlObj.searchParams.get('page');
    if (page && !isLegitimatePageParameter(urlObj.pathname)) {
      urlObj.searchParams.delete('page');
    }
    
    return urlObj.toString();
  } catch (error) {
    // Fallback bei invaliden URLs
    return url;
  }
}

/**
 * Prüft ob Pagination-Parameter legitim ist
 */
function isLegitimatePageParameter(pathname: string): boolean {
  // Erlaubte Pfade für Pagination
  const paginatedPaths = [
    '/collections/', 
    '/products', 
    '/blog',
    '/search'
  ];
  
  return paginatedPaths.some(path => pathname.startsWith(path));
}

/**
 * Generiert kanonische URL für gegebenen Pfad
 */
export function generateCanonicalUrl(path: string): string {
  // Entferne führende Slashes und doppelte Slashes
  const cleanPath = path.replace(/^\/+/, '').replace(/\/+/g, '/');
  
  // Homepage-Spezialfall
  if (!cleanPath || cleanPath === '/') {
    return SITE_URL;
  }
  
  // Vollständige URL zusammenbauen
  const fullUrl = `${SITE_URL}/${cleanPath}`;
  
  // Query-Parameter bereinigen
  return cleanUrl(fullUrl);
}

/**
 * Extrahiert sauberen Pfad aus aktueller URL (für SSR-safe Implementierung)
 */
export function getCleanPathFromUrl(url?: string): string {
  if (!url) return '/';
  
  try {
    const urlObj = new URL(url);
    return urlObj.pathname;
  } catch (error) {
    return '/';
  }
}

/**
 * Generiert Canonical URL für Produktseiten
 * Entfernt automatisch Varianten-Parameter
 */
export function generateProductCanonical(handle: string): string {
  return generateCanonicalUrl(`products/${handle}`);
}

/**
 * Bereinigt einen Pfad von Query-Parametern für Canonical-Verwendung
 * Nutzt Next.js router.asPath und entfernt unerwünschte Parameter
 */
export function cleanCanonicalPath(asPath: string): string {
  // Wenn kein asPath, return root
  if (!asPath) return '/';
  
  // Extrahiere Basis-Pfad und Query-String
  const [basePath, queryString] = asPath.split('?');
  
  // Wenn keine Query-Parameter, return Basis-Pfad
  if (!queryString) return basePath;
  
  // Parse Query-Parameter
  const params = new URLSearchParams(queryString);
  
  // Entferne unerwünschte Parameter (inkl. Varianten)
  const parametersToRemove = [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
    'ref', 'source', 'fbclid', 'gclid', 'msclkid', 'mc_cid', 'mc_eid',
    '_ga', '_gl', 'igshid', 'campaign', 'adgroup', 'keyword',
    'variant', 'variantId', 'selectedVariant'
  ];
  
  parametersToRemove.forEach(param => params.delete(param));
  
  // Behalte nur erlaubte Parameter (z.B. sort, filter für Collections)
  const allowedParams = ['sort', 'filter', 'category'];
  const cleanParams = new URLSearchParams();
  
  allowedParams.forEach(param => {
    if (params.has(param)) {
      cleanParams.set(param, params.get(param)!);
    }
  });
  
  // Baue sauberen Pfad zusammen
  const cleanQuery = cleanParams.toString();
  return cleanQuery ? `${basePath}?${cleanQuery}` : basePath;
}

/**
 * Generiert Canonical URL für Collection-Seiten
 */
export function generateCollectionCanonical(handle: string): string {
  return generateCanonicalUrl(`collections/${handle}`);
}

/**
 * Generiert Canonical URL für Blog-Posts
 */
export function generateBlogCanonical(handle: string): string {
  return generateCanonicalUrl(`blog/${handle}`);
}

/**
 * Validiert Canonical URL nach SEO-Best-Practice
 */
export function validateCanonicalUrl(url: string): {
  isValid: boolean;
  issues: string[];
  warnings: string[];
} {
  const issues: string[] = [];
  const warnings: string[] = [];
  
  try {
    const urlObj = new URL(url);
    
    // Prüfe HTTPS
    if (urlObj.protocol !== 'https:') {
      issues.push('Canonical URL must use HTTPS');
    }
    
    // Prüfe Domain
    if (urlObj.hostname !== 'www.alltagsgold.ch') {
      issues.push(`Invalid domain: ${urlObj.hostname}, should be www.alltagsgold.ch`);
    }
    
    // Prüfe auf Query-Parameter
    if (urlObj.search) {
      warnings.push(`Canonical URL contains query parameters: ${urlObj.search}`);
    }
    
    // Prüfe auf Fragment
    if (urlObj.hash) {
      warnings.push(`Canonical URL contains fragment: ${urlObj.hash}`);
    }
    
    // Prüfe auf doppelte Slashes
    if (urlObj.pathname.includes('//')) {
      issues.push('Path contains double slashes');
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      warnings
    };
  } catch (error) {
    return {
      isValid: false,
      issues: ['Invalid URL format'],
      warnings: []
    };
  }
}