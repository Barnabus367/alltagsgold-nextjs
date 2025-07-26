/**
 * Client-Side SEO Enhancements
 * Ergänzt Server-Safe Meta-Tags um Browser-spezifische Features
 */

import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { SITE_URL } from '@/lib/canonical';

interface SEOEnhancerProps {
  totalPages?: number;
  breadcrumbs?: Array<{
    name: string;
    url: string;
    position: number;
  }>;
}

export function SEOEnhancer({ totalPages, breadcrumbs }: SEOEnhancerProps) {
  const router = useRouter();
  
  useEffect(() => {
    // Nur im Browser ausführen
    if (typeof window === 'undefined') return;
    
    const currentPage = Number(router.query.page) || 1;
    const basePath = router.asPath.split('?')[0];
    
    // Pagination Links hinzufügen
    if (totalPages && totalPages > 1) {
      addPaginationLinks(currentPage, totalPages, basePath);
    }
    
    // Breadcrumb Schema client-side aktualisieren (falls dynamisch)
    if (breadcrumbs && breadcrumbs.length > 1) {
      updateBreadcrumbSchema(breadcrumbs);
    }
    
    // SEO Debug in Development
    if (process.env.NODE_ENV === 'development') {
      console.group('🔍 SEO Enhancer');
      console.log('Route:', router.asPath);
      console.log('Page:', currentPage, 'of', totalPages);
      console.log('Breadcrumbs:', breadcrumbs?.length || 0);
      console.groupEnd();
    }
    
  }, [router.asPath, router.query.page, totalPages, breadcrumbs]);
  
  return null; // Nur Side-Effects, kein UI
}

/**
 * Fügt Pagination Links dynamisch hinzu
 */
function addPaginationLinks(currentPage: number, totalPages: number, basePath: string) {
  // Entferne existierende Pagination Links
  document.querySelectorAll('link[rel="prev"], link[rel="next"]').forEach(el => el.remove());
  
  if (currentPage > 1) {
    const prevLink = document.createElement('link');
    prevLink.rel = 'prev';
    prevLink.href = currentPage === 2 
      ? `${SITE_URL}${basePath}`
      : `${SITE_URL}${basePath}?page=${currentPage - 1}`;
    document.head.appendChild(prevLink);
  }
  
  if (currentPage < totalPages) {
    const nextLink = document.createElement('link');
    nextLink.rel = 'next';
    nextLink.href = `${SITE_URL}${basePath}?page=${currentPage + 1}`;
    document.head.appendChild(nextLink);
  }
}

/**
 * Aktualisiert Breadcrumb Schema client-side
 */
function updateBreadcrumbSchema(breadcrumbs: Array<{name: string, url: string, position: number}>) {
  const existingSchema = document.getElementById('breadcrumb-schema');
  if (existingSchema) existingSchema.remove();
  
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map(breadcrumb => ({
      "@type": "ListItem",
      "position": breadcrumb.position,
      "name": breadcrumb.name,
      "item": breadcrumb.url.startsWith('http') 
        ? breadcrumb.url 
        : `${SITE_URL}${breadcrumb.url}`
    }))
  };
  
  const script = document.createElement('script');
  script.id = 'breadcrumb-schema';
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}
