import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';

interface CartButtonProps {
  textClasses?: string;
}

export function CartButton({ textClasses = "text-white hover:text-gray-300" }: CartButtonProps) {
  const { cartItemCount } = useCart();

  return (
    <Button 
      asChild
      variant="ghost"
      className={`relative min-h-[44px] min-w-[44px] p-3 transition-colors touch-manipulation ${textClasses}`}
    >
      <Link href="/cart">
        <div className="flex items-center gap-1">
          <ShoppingCart className="h-5 w-5" />
          <span className="text-sm font-normal tracking-wide">
            {cartItemCount}
          </span>
        </div>
      </Link>
    </Button>
  );
}
