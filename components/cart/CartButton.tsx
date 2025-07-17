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
      className={`relative p-0 transition-colors ${textClasses}`}
    >
      <Link href="/cart">
        <div className="flex items-center gap-1">
          <ShoppingCart className="h-4 w-4" />
          <span className="text-sm font-normal tracking-wide">
            {cartItemCount}
          </span>
        </div>
      </Link>
    </Button>
  );
}
