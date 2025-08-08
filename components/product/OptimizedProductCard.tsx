import React from 'react';
import Link from 'next/link';
import { useImageLoader } from '@/hooks/useSubtleScrollEffects';
import { PremiumImage } from '@/components/common/PremiumImage';
import { formatPriceSafe } from '@/lib/type-guards';
import { cn } from '@/lib/utils';

interface OptimizedProductCardProps {
  product: any;
  className?: string;
}

export function OptimizedProductCard({ product, className }: OptimizedProductCardProps) {
  const { imgRef, isLoaded } = useImageLoader();
  
  const primaryImage = product.images?.edges?.[0]?.node;
  const price = product.priceRange?.minVariantPrice || product.variants?.edges?.[0]?.node?.price;
  
  return (
    <Link 
      href={`/products/${product.handle}`}
      prefetch={true}
      className={cn(
        'group block bg-white rounded-lg overflow-hidden',
        'transition-all duration-300 ease-out',
        'hover:shadow-lg hover:-translate-y-1',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black',
        className
      )}
    >
      <div className="aspect-square overflow-hidden bg-gray-50">
        <div className={cn(
          'w-full h-full transition-opacity duration-500',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}>
          <img
            ref={imgRef as React.RefObject<HTMLImageElement>}
            src={primaryImage?.url || ''}
            alt={primaryImage?.altText || product.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        </div>
        {!isLoaded && (
          <div className="absolute inset-0 skeleton" />
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2">
          {product.title}
        </h3>
        
        <div className="flex items-center justify-between">
          <span className="text-xl font-semibold text-gray-900">
            {formatPriceSafe(price)}
          </span>
          
          <span className="text-sm text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Ansehen →
          </span>
        </div>
      </div>
    </Link>
  );
}