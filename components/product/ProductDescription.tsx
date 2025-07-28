import React, { memo, useState } from 'react';

interface ProductDescriptionProps {
  html: string;
  loading?: boolean;
  isEmpty?: boolean;
  className?: string;
  collapsible?: boolean;
  truncateLines?: number;
}

/**
 * ProductDescription - Eigenständige Komponente für saubere Produktbeschreibungs-Typografie
 * 
 * Features:
 * - Optimierte Tailwind Typography
 * - Loading & Empty States
 * - Sanitized HTML Rendering
 * - Collapsible/Expandable Content
 * - Text Truncation mit "Mehr anzeigen"
 * - Responsive Design
 * - Accessibility Support
 */
export const ProductDescription = memo(({ 
  html, 
  loading = false, 
  isEmpty = false,
  className = '',
  collapsible = false,
  truncateLines = 5
}: ProductDescriptionProps) => {
  const [isExpanded, setIsExpanded] = useState(!collapsible);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Loading State
  if (loading) {
    return (
      <div className={`text-gray-500 ${className}`}>
        Beschreibung wird geladen...
      </div>
    );
  }

  // Empty State
  if (isEmpty || !html) {
    return (
      <div className={`text-gray-500 ${className}`}>
        Keine Beschreibung verfügbar
      </div>
    );
  }

  // Collapsible Section Rendering
  if (collapsible) {
    return (
      <section aria-labelledby="product-description" className={`border border-gray-200 rounded-lg ${className}`}>
        <div className="px-4 py-3">
          <h3>
            <button
              id="product-description"
              aria-controls="description-content"
              aria-expanded={isExpanded}
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-between w-full text-left font-medium text-gray-900 hover:text-gray-700 transition-colors"
              tabIndex={0}
            >
              <span>Produktbeschreibung</span>
              <svg 
                fill="none" 
                viewBox="0 0 16 16" 
                width="16" 
                height="16" 
                className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              >
                <path 
                  fill="currentColor" 
                  fillRule="evenodd" 
                  d="M13.25 5 8 10.444 2.75 5 2 5.778 8 12l6-6.222z" 
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </h3>
          
          {isExpanded && (
            <div 
              id="description-content" 
              aria-hidden={!isExpanded}
              className="mt-4"
            >
              <div className="prose prose-lg max-w-none text-gray-800">
                <div 
                  className={isCollapsed ? `line-clamp-${truncateLines}` : ''}
                  dangerouslySetInnerHTML={{ __html: html }}
                />
                
                {html.length > 300 && (
                  <button
                    type="button"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="mt-3 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                    aria-label={isCollapsed ? "Mehr von der Beschreibung anzeigen" : "Weniger von der Beschreibung anzeigen"}
                  >
                    <svg 
                      fill="none" 
                      viewBox="0 0 16 16" 
                      width="14" 
                      height="14" 
                      className={`mr-1 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
                    >
                      <path 
                        fill="currentColor" 
                        fillRule="evenodd" 
                        d="m8.5 1-5 4.95.713.707 3.782-3.743V15h1.01V2.914l3.78 3.743.714-.707z" 
                        clipRule="evenodd"
                      />
                    </svg>
                    {isCollapsed ? "Mehr anzeigen" : "Weniger anzeigen"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Standard Rendering (Non-Collapsible)
  return (
    <article 
      className={`prose prose-lg max-w-none text-gray-800 ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
});

ProductDescription.displayName = 'ProductDescription';

export default ProductDescription;
