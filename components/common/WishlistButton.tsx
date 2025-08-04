import { Heart } from '@/lib/icons';
import { useWishlist } from '@/hooks/useWishlist';
import { ShopifyProduct } from '@/types/shopify';
import { Button } from '@/components/ui/button';
import { announceToScreenReader } from '@/lib/accessibility';

interface WishlistButtonProps {
  product: ShopifyProduct;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function WishlistButton({ 
  product, 
  className = '', 
  size = 'md',
  showLabel = false 
}: WishlistButtonProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);

  const sizeClasses = {
    sm: 'h-8 w-8 p-1',
    md: 'h-10 w-10 p-2',
    lg: 'h-12 w-12 p-3'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const wasAdded = toggleWishlist(product);
    
    const message = wasAdded 
      ? `${product.title} zur Wunschliste hinzugefügt`
      : `${product.title} von Wunschliste entfernt`;
    announceToScreenReader(message);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`
        ${sizeClasses[size]} 
        ${isWishlisted ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-red-500'}
        transition-colors duration-200
        ${className}
      `}
      onClick={handleToggle}
      aria-label={
        isWishlisted 
          ? `${product.title} von Wunschliste entfernen`
          : `${product.title} zur Wunschliste hinzufügen`
      }
      type="button"
    >
      <Heart 
        className={`
          ${iconSizes[size]} 
          ${isWishlisted ? 'fill-current' : ''}
          transition-all duration-200
        `} 
      />
      {showLabel && (
        <span className="ml-2 text-sm">
          {isWishlisted ? 'Entfernen' : 'Merken'}
        </span>
      )}
    </Button>
  );
}
