import React, { memo } from 'react';

interface ProductDescriptionProps {
  html: string;
  loading?: boolean;
  isEmpty?: boolean;
  className?: string;
}

/**
 * ProductDescription - Eigenständige Komponente für saubere Produktbeschreibungs-Typografie
 * 
 * Features:
 * - Optimierte Tailwind Typography
 * - Loading & Empty States
 * - Sanitized HTML Rendering
 * - Keine Icons/Emojis
 * - Responsive Design
 */
export const ProductDescription = memo(({ 
  html, 
  loading = false, 
  isEmpty = false,
  className = ''
}: ProductDescriptionProps) => {
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

  // Main Content Rendering
  return (
    <article 
      className={`prose prose-sm max-w-none text-gray-800 ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
});

ProductDescription.displayName = 'ProductDescription';

export default ProductDescription;
