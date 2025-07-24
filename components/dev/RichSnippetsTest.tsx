/**
 * Rich Snippets Testing & Validation Component
 * Hilft bei der Entwicklung und Validierung von Schema.org Markup
 */

import { useState, useEffect } from 'react';
import { generateProductStructuredData, generateOrganizationStructuredData, generateWebSiteStructuredData } from '../../lib/structured-data';
import { ShopifyProduct } from '../../types/shopify';

interface RichSnippetsTestProps {
  product?: ShopifyProduct;
  showInProduction?: boolean;
}

export function RichSnippetsTest({ product, showInProduction = false }: RichSnippetsTestProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [testData, setTestData] = useState<any>(null);
  
  // Nur in Development oder wenn explizit erlaubt
  useEffect(() => {
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev || showInProduction) {
      setIsVisible(true);
    }
  }, [showInProduction]);
  
  useEffect(() => {
    if (product) {
      setTestData(generateProductStructuredData(product));
    } else {
      setTestData({
        organization: generateOrganizationStructuredData(),
        website: generateWebSiteStructuredData()
      });
    }
  }, [product]);
  
  if (!isVisible || !testData) return null;
  
  // Test URLs für Google Rich Results Test
  const testUrls = {
    google: 'https://search.google.com/test/rich-results',
    schema: 'https://validator.schema.org/',
    facebook: 'https://developers.facebook.com/tools/debug/',
    twitter: 'https://cards-dev.twitter.com/validator'
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <div className="bg-white border-2 border-gray-300 rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-gray-700">🔍 Rich Snippets Test</h3>
          <button 
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-2 text-xs">
          <div className="bg-gray-50 p-2 rounded">
            <strong>Schema Type:</strong> {product ? 'Product' : 'Organization + WebSite'}
          </div>
          
          {product && (
            <div className="bg-green-50 p-2 rounded">
              <strong>Rating:</strong> {testData.aggregateRating?.ratingValue}★ 
              ({testData.aggregateRating?.reviewCount} Reviews)
            </div>
          )}
          
          <div className="bg-blue-50 p-2 rounded">
            <strong>Test Links:</strong>
            <ul className="mt-1 space-y-1">
              {Object.entries(testUrls).map(([name, url]) => (
                <li key={name}>
                  <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline capitalize"
                  >
                    {name} Validator
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <details className="bg-gray-50 p-2 rounded">
            <summary className="cursor-pointer font-medium">JSON-LD Preview</summary>
            <pre className="mt-2 text-xs overflow-auto max-h-32 bg-white p-2 rounded border">
              {JSON.stringify(testData, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    </div>
  );
}

/**
 * SEO Performance Monitor - zeigt wichtige Metriken
 */
export function SEOPerformanceMonitor() {
  const [metrics, setMetrics] = useState<any>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Core Web Vitals und SEO Metriken sammeln
      const checkSEOMetrics = () => {
        const title = document.title;
        const description = document.querySelector('meta[name="description"]')?.getAttribute('content');
        const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href');
        const structuredData = document.querySelectorAll('script[type="application/ld+json"]');
        
        setMetrics({
          title: {
            text: title,
            length: title.length,
            status: title.length >= 30 && title.length <= 60 ? 'good' : 'warning'
          },
          description: {
            text: description,
            length: description?.length || 0,
            status: description && description.length >= 120 && description.length <= 160 ? 'good' : 'warning'
          },
          canonical: {
            url: canonical,
            status: canonical ? 'good' : 'error'
          },
          structuredData: {
            count: structuredData.length,
            status: structuredData.length > 0 ? 'good' : 'warning'
          }
        });
      };
      
      // Nach DOM Load checken
      setTimeout(checkSEOMetrics, 1000);
    }
  }, []);
  
  if (!metrics || process.env.NODE_ENV !== 'development') return null;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-orange-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };
  
  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3">
        <h3 className="text-sm font-bold text-gray-700 mb-2">📊 SEO Metrics</h3>
        
        <div className="space-y-2 text-xs">
          <div className={`flex justify-between ${getStatusColor(metrics.title.status)}`}>
            <span>Title:</span>
            <span>{metrics.title.length}/60</span>
          </div>
          
          <div className={`flex justify-between ${getStatusColor(metrics.description.status)}`}>
            <span>Description:</span>
            <span>{metrics.description.length}/160</span>
          </div>
          
          <div className={`flex justify-between ${getStatusColor(metrics.canonical.status)}`}>
            <span>Canonical:</span>
            <span>{metrics.canonical.status === 'good' ? '✓' : '✗'}</span>
          </div>
          
          <div className={`flex justify-between ${getStatusColor(metrics.structuredData.status)}`}>
            <span>Rich Snippets:</span>
            <span>{metrics.structuredData.count} schemas</span>
          </div>
        </div>
      </div>
    </div>
  );
}
