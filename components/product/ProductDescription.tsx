import React, { memo, useState } from 'react';

interface ProductDescriptionProps {
  html: string;
  loading?: boolean;
  isEmpty?: boolean;
  className?: string;
  collapsible?: boolean;
  truncateLines?: number;
  previewLines?: number; // Neue Option für Preview-Zeilen
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
  truncateLines = 5,
  previewLines = 2 // Standard: 2 Zeilen Preview
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
              className="flex items-center justify-between w-full text-left font-semibold text-lg text-gray-900 hover:text-gray-700 transition-colors py-1"
              tabIndex={0}
            >
              <span>Produktbeschreibung</span>
              <svg 
                fill="none" 
                viewBox="0 0 16 16" 
                width="16" 
                height="16" 
                className={`transition-transform duration-200 text-gray-500 ${isExpanded ? 'rotate-180' : ''}`}
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
          
          {/* Preview Content (immer sichtbar wenn collapsible) */}
          {!isExpanded && (
            <div className="mt-4 pb-2">
              <div className="prose prose-base max-w-none text-gray-700 leading-relaxed">
                <div 
                  className={`line-clamp-${previewLines}`}
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              </div>
              <button
                type="button"
                onClick={() => setIsExpanded(true)}
                className="mt-3 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                aria-label="Vollständige Beschreibung anzeigen"
              >
                <svg 
                  fill="none" 
                  viewBox="0 0 16 16" 
                  width="14" 
                  height="14" 
                  className="mr-1"
                >
                  <path 
                    fill="currentColor" 
                    fillRule="evenodd" 
                    d="M7.995 1v12.086L4.213 9.343l-.713.707 4.284 4.243L8.5 15l4.999-4.95-.714-.707-3.78 3.743V1z" 
                    clipRule="evenodd"
                  />
                </svg>
                Mehr anzeigen
              </button>
            </div>
          )}
          
          {/* Full Content (expandiert) */}
          {isExpanded && (
            <div 
              id="description-content" 
              aria-hidden={!isExpanded}
              className="mt-5 pb-3"
            >
              <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed">
                <div 
                  className={isCollapsed ? `line-clamp-${truncateLines}` : ''}
                  dangerouslySetInnerHTML={{ __html: html }}
                />
                
                {html.length > 300 && (
                  <button
                    type="button"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
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
