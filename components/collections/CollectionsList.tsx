import Link from 'next/link';
import { useCollections, useProducts } from '@/hooks/useShopify';
import { ProductCard } from '@/components/product/ProductCard';
import { CategoryCard, CompactCategoryCard, HeroCategoryCard } from '@/components/collections/CategoryCard';
import { ShopifyError } from '@/components/common/ShopifyError';
import { ShopifyCollection } from '@/types/shopify';
import { SEOHelmet } from '@/components/SEOHelmet';
import { HeroVideo } from '@/components/HeroVideo';
import { ArrowRight, Home as HomeIcon, ShoppingBag, Heart, Utensils, Shirt, Gamepad2, Grid } from 'lucide-react';
import { usePageTitle, formatPageTitle } from '@/hooks/usePageTitle';

// Icon mapping for categories
const getCategoryIcon = (collectionHandle: string, collectionTitle: string) => {
  const handle = collectionHandle.toLowerCase();
  const title = collectionTitle.toLowerCase();
  
  if (handle.includes('home') || title.includes('haus') || title.includes('home')) {
    return HomeIcon;
  } else if (handle.includes('kitchen') || title.includes('küche') || title.includes('kitchen')) {
    return Utensils;
  } else if (handle.includes('fashion') || title.includes('mode') || title.includes('clothing')) {
    return Shirt;
  } else if (handle.includes('beauty') || title.includes('beauty') || title.includes('schön')) {
    return Heart;
  } else if (handle.includes('gaming') || title.includes('spiel') || title.includes('game')) {
    return Gamepad2;
  } else {
    return ShoppingBag;
  }
};

interface CollectionsProps {
  preloadedCollections?: ShopifyCollection[];
}

export function Collections({ preloadedCollections }: CollectionsProps) {
  usePageTitle(formatPageTitle('Sortimente'));
  
  const { data: collections = [], isLoading: collectionsLoading, error: collectionsError } = useCollections({
    enabled: !preloadedCollections,
    initialData: preloadedCollections,
  });
  const { data: productsData, isLoading: productsLoading } = useProducts(8);
  
  const products = productsData?.products || [];
  const highlightProducts = products.slice(0, 4);

  if (collectionsError) {
    return <ShopifyError error={String(collectionsError)} />;
  }

  return (
    <div className="min-h-screen bg-white pt-16">
      <SEOHelmet 
        title="Sortimente - Premium Produktkategorien"
        description="Entdecken Sie unsere kuratierten Produktkategorien: Küche, Lifestyle, Design und mehr. Hochwertige Artikel für jeden Bereich Ihres Lebens."
        type="website"
      />
      
      {/* Hero Section mit Titel und Intro */}
      <section className="relative h-[50vh] bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black/30 to-black/60 z-10"></div>
        <HeroVideo 
          videoSrc="https://res.cloudinary.com/dwrk3iihw/video/upload/v1750154076/4669325-uhd_4096_2160_25fps_rjfgd4.mp4"
          fallbackImage="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80"
        />
        <div className="relative z-20 text-center text-white max-w-5xl mx-auto px-6">
          <h1 className="text-5xl md:text-7xl font-light tracking-tight mb-6">
            Sortimente
          </h1>
          <p className="text-xl md:text-2xl font-light opacity-90 max-w-3xl mx-auto leading-relaxed">
            Entdecken Sie unsere sorgfältig kuratierten Produktkategorien - jede mit einer einzigartigen Auswahl für Ihren Lifestyle
          </p>
        </div>
      </section>

      {/* Inspirational Collections Grid */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          {collectionsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="h-48 bg-gray-200 animate-pulse rounded-lg"></div>
                  <div className="h-6 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-16 bg-gray-200 animate-pulse rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Featured Collection - Hero Style - KONFIGURIERT: Technik & Gadgets */}
              {collections.length > 0 && (() => {
                // Suche nach der konfigurierten Featured Collection
                const featuredCollectionHandle = 'technik-gadgets';
                const featuredCollection = collections.find((c: any) => c.handle === featuredCollectionHandle) || collections[0];
                
                return (
                  <div className="mb-16">
                    <HeroCategoryCard 
                      collection={featuredCollection} 
                      className="max-w-4xl mx-auto"
                    />
                  </div>
                );
              })()}

              {/* Regular Collections Grid - alle außer der Featured */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {collections.filter((collection: any) => collection.handle !== 'technik-gadgets').map((collection: any) => (
                  <CategoryCard 
                    key={collection.id} 
                    collection={collection}
                  />
                ))}
              </div>

              {/* Call-to-Action */}
              <div className="text-center mt-16">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto border border-gray-100">
                  <Grid className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    Alle Produkte durchstöbern
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Entdecken Sie unser vollständiges Sortiment mit erweiterten Filtermöglichkeiten
                  </p>
                  <Link href="/products">
                    <button className="inline-flex items-center bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                      Zu den Produkten
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Featured Products - HULL Style */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light mb-4 text-gray-900">
              Beliebte Produkte
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Diese Produkte begeistern unsere Kunden besonders
            </p>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="aspect-square bg-gray-200 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 animate-pulse w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {highlightProducts.map((product: any) => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/products">
              <button className="inline-flex items-center text-black hover:text-gray-600 transition-colors text-lg font-light">
                Alle Produkte ansehen
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter CTA - HULL Style */}
      <section className="py-24 bg-black text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-light mb-6 leading-tight">
            Verpassen Sie nichts
          </h2>
          <p className="text-xl opacity-80 mb-12 leading-relaxed">
            Erhalten Sie exklusive Angebote und Neuigkeiten direkt in Ihr Postfach
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Ihre E-Mail-Adresse"
              className="flex-1 px-4 py-3 bg-transparent border border-white text-white placeholder-gray-300 focus:outline-none focus:border-gray-300 rounded-none"
            />
            <button className="bg-white text-black px-8 py-3 hover:bg-gray-100 transition-colors rounded-none font-normal">
              Anmelden
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Collections;