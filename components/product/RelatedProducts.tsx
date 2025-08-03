import { useProducts } from '@/hooks/useShopify';
import { ProductCard } from './ProductCard';
import { ShopifyProduct } from '@/types/shopify';
import Link from 'next/link';
import { ArrowRight } from '@/lib/icons';

interface RelatedProductsProps {
  currentProduct: ShopifyProduct;
  maxProducts?: number;
}

export function RelatedProducts({ currentProduct, maxProducts = 4 }: RelatedProductsProps) {
  const { data: productsData, isLoading } = useProducts(12);
  
  if (isLoading || !productsData?.products) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(maxProducts)].map((_, i) => (
            <div key={i} className="bg-gray-200 aspect-square rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }
  
  // Finde verwandte Produkte basierend auf Kollektion oder Produkttyp
  const currentCollections = currentProduct.collections?.edges?.map(e => e.node.id) || [];
  const currentType = currentProduct.productType?.toLowerCase() || '';
  
  const relatedProducts = productsData.products
    .filter((p: any) => {
      // Nicht das aktuelle Produkt
      if (p.id === currentProduct.id) return false;
      
      // Gleiche Kollektion?
      const hasSharedCollection = p.collections?.edges?.some((e: any) => 
        currentCollections.includes(e.node.id)
      );
      
      // Ähnlicher Produkttyp?
      const hasSimilarType = p.productType?.toLowerCase().includes(currentType) ||
        currentType.includes(p.productType?.toLowerCase() || '');
      
      return hasSharedCollection || hasSimilarType;
    })
    .slice(0, maxProducts);
  
  // Wenn nicht genug verwandte Produkte, fülle mit anderen auf
  if (relatedProducts.length < maxProducts) {
    const additionalProducts = productsData.products
      .filter((p: any) => p.id !== currentProduct.id && !relatedProducts.includes(p))
      .slice(0, maxProducts - relatedProducts.length);
    
    relatedProducts.push(...additionalProducts);
  }
  
  if (relatedProducts.length === 0) return null;
  
  // Keywords für interne Links
  const categoryKeywords = {
    küche: ['Küchenhelfer', 'Küchengeräte', 'Kochen'],
    haushalt: ['Haushaltshelfer', 'Reinigung', 'Organisation'],
    beauty: ['Selbstpflege', 'Beauty', 'Wellness'],
    technik: ['Gadgets', 'Elektronik', 'Smart Home']
  };
  
  // Finde passende Kategorie
  const category = Object.entries(categoryKeywords).find(([key, words]) => 
    words.some(word => currentProduct.title.includes(word) || currentType.includes(key))
  )?.[0];
  
  return (
    <section className="py-12">
      <div className="mb-8">
        <h2 className="text-2xl font-light text-gray-900 mb-2">
          Ähnliche Produkte
        </h2>
        <p className="text-gray-600">
          Entdecken Sie weitere {category ? categoryKeywords[category as keyof typeof categoryKeywords][0] : 'Produkte'} aus unserem Sortiment
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {relatedProducts.map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {/* Interne Links zu wichtigen Seiten */}
      <div className="border-t pt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Mehr entdecken
        </h3>
        <div className="flex flex-wrap gap-4">
          <Link 
            href="/collections" 
            className="flex items-center gap-2 text-amber-600 hover:text-amber-700 transition-colors"
          >
            Alle Kategorien ansehen
            <ArrowRight className="w-4 h-4" />
          </Link>
          
          {currentCollections.length > 0 && (
            <Link 
              href={`/collections/${currentProduct.collections?.edges[0]?.node.handle}`}
              className="flex items-center gap-2 text-amber-600 hover:text-amber-700 transition-colors"
            >
              Mehr {currentProduct.collections?.edges[0]?.node.title}
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
          
          <Link 
            href="/blog" 
            className="flex items-center gap-2 text-amber-600 hover:text-amber-700 transition-colors"
          >
            Tipps & Ratgeber
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}