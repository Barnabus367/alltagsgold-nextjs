import { Star } from 'lucide-react';

interface ProductReviewStarsProps {
  rating?: number;
  reviewCount?: number;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ProductReviewStars({ 
  rating = 0, 
  reviewCount = 0, 
  showCount = true,
  size = 'md' 
}: ProductReviewStarsProps) {
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };
  
  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };
  
  // Temporär: Zeige keine Sterne wenn keine echten Bewertungen vorhanden
  if (!rating || rating === 0) {
    return null;
  }
  
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - Math.ceil(rating);
  
  return (
    <div className="flex items-center gap-1">
      {/* Volle Sterne */}
      {[...Array(fullStars)].map((_, i) => (
        <Star 
          key={`full-${i}`} 
          className={`${sizeClasses[size]} fill-amber-400 text-amber-400`} 
        />
      ))}
      
      {/* Halber Stern */}
      {hasHalfStar && (
        <div className="relative">
          <Star className={`${sizeClasses[size]} text-gray-300`} />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className={`${sizeClasses[size]} fill-amber-400 text-amber-400`} />
          </div>
        </div>
      )}
      
      {/* Leere Sterne */}
      {[...Array(emptyStars)].map((_, i) => (
        <Star 
          key={`empty-${i}`} 
          className={`${sizeClasses[size]} text-gray-300`} 
        />
      ))}
      
      {/* Bewertungsanzahl */}
      {showCount && reviewCount > 0 && (
        <span className={`ml-2 text-gray-600 ${textSizeClasses[size]}`}>
          ({reviewCount} {reviewCount === 1 ? 'Bewertung' : 'Bewertungen'})
        </span>
      )}
    </div>
  );
}