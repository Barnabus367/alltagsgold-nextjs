import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useCollection, useProducts } from '@/hooks/useShopify';
import { ProductCard } from '@/components/product/ProductCard';
import { ImprovedProductFilterBar } from '@/components/product/ImprovedProductFilterBar';
import { ShopifyError } from '@/components/common/ShopifyError';
import { SEOHelmet } from '@/components/SEOHelmet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Grid, List, ArrowLeft, Package, Tag } from 'lucide-react';
import { usePageTitle, formatPageTitle } from '@/hooks/usePageTitle';
import { useProductSearch, useProductFilter } from '@/hooks/useShopify';
import { trackSearch } from '@/lib/analytics';
import { ShopifyProduct, ShopifyCollection } from '@/types/shopify';
import { getCategoryImage } from '@/lib/categoryImages';
import Link from 'next/link';

// Collection Headlines and Subheadlines
function getCollectionHeadline(title: string, handle: string): string {
  const headlines: Record<string, string> = {
    'haushaltsgerate': 'Smartes Wohnen neu definiert',
    'reinigungsgerate': 'Sauberkeit ohne Kompromisse',
    'luftreiniger-luftbefeuchter': 'Gesunde Raumluft für jeden Tag',
    'technik-gadgets': 'Innovation für den Alltag',
    'kuchengerate-1': 'Kulinarik auf höchstem Niveau',
    'bbq-grill': 'Perfekte Grill-Erlebnisse',
    'aufbewahrung-organisation': 'Ordnung trifft Design',
    'selfcare-beauty': 'Zeit für pure Entspannung',
    'dekoration': 'Ihr Zuhause, Ihr Stil',
    'beleuchtung': 'Licht mit Charakter',
    
    // Neue Kollektionen Headlines
    'haustierbedarf-alles-fuer-dein-haustier': 'Für Ihre geliebten Vierbeiner',
    'kueche': 'Küchenträume werden wahr',
    'wellness-entspannung': 'Ihre persönliche Wellness-Oase',
    'auto-zubehoer': 'Fahren mit Stil und Komfort',
    'led-produkte': 'Licht der Zukunft',
    'badezimmeraccessoires-und-textilien': 'Badezimmer-Luxus für jeden Tag',
    'beleuchtung-lampen': 'Lichtkunst für Ihr Zuhause'
  };
  
  return headlines[handle] || `${title} - Premium Lifestyle`;
}

function getCollectionSubheadline(title: string, handle: string): string {
  const subheadlines: Record<string, string> = {
    'haushaltsgerate': 'Innovative Geräte für den modernen Haushalt',
    'reinigungsgerate': 'Effiziente Reinigung für jeden Bereich',
    'luftreiniger-luftbefeuchter': 'Technologie für optimales Raumklima',
    'technik-gadgets': 'Smarte Lösungen für Ihr digitales Leben',
    'kuchengerate-1': 'Professionelle Ausstattung für Genießer',
    'bbq-grill': 'Premium Grillausrüstung für Outdoor-Profis',
    'aufbewahrung-organisation': 'Intelligente Systeme für mehr Ordnung',
    'selfcare-beauty': 'Wellness und Pflege für zu Hause',
    'dekoration': 'Stilvolle Akzente für Ihr Ambiente',
    'beleuchtung': 'Atmosphäre durch durchdachte Beleuchtung',
    
    // Neue Kollektionen
    'haustierbedarf-alles-fuer-dein-haustier': 'Alles für das Wohlbefinden Ihrer Lieblinge',
    'kueche': 'Kulinarische Perfektion für Ihre Küche',
    'wellness-entspannung': 'Entspannung und Erholung für Körper & Geist',
    'auto-zubehoer': 'Premium Zubehör für Ihr Fahrzeug',
    'led-produkte': 'Energieeffiziente LED-Technologie',
    'badezimmeraccessoires-und-textilien': 'Komfort und Stil für Ihr Badezimmer',
    'beleuchtung-lampen': 'Lichtdesign für jeden Raum'
  };
  
  return subheadlines[handle] || 'Entdecken Sie unsere kuratierte Auswahl';
}

function getCollectionOverlay(handle: string): string {
  // Dezente anthrazitfarbene Overlays mit warmgoldenen Akzenten - premium und zurückhaltend
  const overlays: Record<string, string> = {
    'haushaltsgerate': 'from-gray-900/50 via-gray-800/40 to-yellow-900/25',
    'reinigungsgerate': 'from-slate-900/50 via-gray-800/40 to-amber-900/25',
    'luftreiniger-luftbefeuchter': 'from-gray-900/50 via-slate-800/40 to-yellow-900/25',
    'technik-gadgets': 'from-zinc-900/50 via-gray-800/40 to-amber-900/25',
    'kuchengerate-1': 'from-gray-900/50 via-stone-800/40 to-yellow-900/25',
    'bbq-grill': 'from-slate-900/50 via-gray-800/40 to-amber-900/25',
    'aufbewahrung-organisation': 'from-gray-900/50 via-zinc-800/40 to-yellow-900/25',
    'selfcare-beauty': 'from-stone-900/50 via-gray-800/40 to-amber-900/25',
    'dekoration': 'from-gray-900/50 via-slate-800/40 to-yellow-900/25',
    'beleuchtung': 'from-zinc-900/50 via-gray-800/40 to-amber-900/25',
    
    // Neue Kollektionen Overlays
    'haustierbedarf-alles-fuer-dein-haustier': 'from-emerald-900/50 via-gray-800/40 to-amber-900/25',
    'kueche': 'from-red-900/50 via-gray-800/40 to-yellow-900/25',
    'wellness-entspannung': 'from-purple-900/50 via-gray-800/40 to-amber-900/25',
    'auto-zubehoer': 'from-blue-900/50 via-gray-800/40 to-yellow-900/25',
    'led-produkte': 'from-cyan-900/50 via-gray-800/40 to-amber-900/25',
    'badezimmeraccessoires-und-textilien': 'from-teal-900/50 via-gray-800/40 to-yellow-900/25',
    'beleuchtung-lampen': 'from-orange-900/50 via-gray-800/40 to-amber-900/25'
  };
  
  return overlays[handle] || 'from-gray-900/50 via-gray-800/40 to-yellow-900/25';
}

interface CollectionDetailProps {
  preloadedCollection?: ShopifyCollection | null;
}

export function CollectionDetail({ preloadedCollection }: CollectionDetailProps) {
  const router = useRouter();
  const { handle } = router.query as { handle: string };
  
  // Use preloaded data or fall back to client-side fetching
  const { data: clientCollection, isLoading: collectionLoading, error: collectionError } = useCollection(handle!, {
    enabled: !preloadedCollection && !!handle,
    initialData: preloadedCollection || undefined,
  });
  
  const collection = preloadedCollection || clientCollection;
  const { data: productsData, isLoading: productsLoading, error: productsError } = useProducts(250);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filteredByFilterBar, setFilteredByFilterBar] = useState<ShopifyProduct[]>([]);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);

  usePageTitle(formatPageTitle(collection?.title || 'Kollektion'));

  // Hide scroll indicator when user scrolls
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowScrollIndicator(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filter products by collection with memoized allProducts
  const collectionProducts = useMemo(() => {
    const allProducts = productsData?.products || [];
    if (!collection) return [];
    return allProducts.filter((product: any) => 
      product.collections?.edges?.some((edge: any) => edge.node.handle === collection.handle)
    );
  }, [productsData?.products, collection]);

  // Use filtered products from ProductFilterBar if available, otherwise use collection products
  const baseProducts = filteredByFilterBar.length > 0 ? filteredByFilterBar : collectionProducts;

  // Search and additional filtering
  const searchResults = useProductSearch(searchQuery, baseProducts);

  // Sort products
  const sortedProducts = useMemo(() => {
    const sorted = [...searchResults];
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => 
          parseFloat(a.priceRange.minVariantPrice.amount) - parseFloat(b.priceRange.minVariantPrice.amount)
        );
      case 'price-high':
        return sorted.sort((a, b) => 
          parseFloat(b.priceRange.minVariantPrice.amount) - parseFloat(a.priceRange.minVariantPrice.amount)
        );
      case 'title':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return sorted;
    }
  }, [searchResults, sortBy]);

  if (collectionError || productsError) {
    return <ShopifyError error={String(collectionError || productsError)} />;
  }

  if (collectionLoading || !collection) {
    return (
      <div className="min-h-screen bg-white pt-16">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const categoryImage = getCategoryImage(collection.title, collection.handle, collection.image?.url);

  return (
    <div className="min-h-screen bg-white pt-16">
      <SEOHelmet
        title={`${collection.title} - Premium Kollektion`}
        description={collection.description || `Entdecken Sie unsere ${collection.title} Kollektion mit hochwertigen Produkten für Ihren Lifestyle.`}
        type="website"
        collection={collection}
      />

      {/* Sticky Back Button */}
      <div className="fixed top-20 left-4 z-50">
        <Link href="/collections">
          <button className="w-12 h-12 bg-white/80 backdrop-blur-sm hover:bg-white/90 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
        </Link>
      </div>

      {/* Swiss Premium Collection Hero */}
      <section className="relative h-[50vh] min-h-[600px] bg-gradient-to-br from-gray-900 to-black overflow-hidden">
        <Image
          src={categoryImage}
          alt={`${collection.title} Kollektion`}
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover filter saturate-75 brightness-90"
          priority
          unoptimized={categoryImage.includes('res.cloudinary.com')}
        />
        <div className={`absolute inset-0 bg-gradient-to-br ${getCollectionOverlay(collection.handle)}`} />
        
        {/* Elegant Centered Content */}
        <div className="absolute inset-0 flex items-center justify-center pt-16">
          <div className="text-center px-6 max-w-4xl">
            {/* Premium Swiss Headline */}
            <h1 className="swiss-hero-headline text-white mb-8">
              {getCollectionHeadline(collection.title, collection.handle)}
            </h1>
            
            {/* Refined Subline */}
            <p className="swiss-hero-subline text-gray-100 mb-16">
              {getCollectionSubheadline(collection.title, collection.handle)}
            </p>
            
            {/* Optimierter Ghost Button - VIEL weiter nach unten positioniert */}
            <div className="flex justify-center mt-12 mb-8">
              <button 
                onClick={() => {
                  const productsSection = document.querySelector('#products-section');
                  productsSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="swiss-ghost-button"
              >
                Kollektion entdecken
              </button>
            </div>
            
            {/* Dezenter Down Arrow mit noch mehr Abstand */}
            {showScrollIndicator && (
              <div className="mt-16">
                <div className="swiss-scroll-indicator">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Collection Filter Bar */}
      <section className="py-3 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <ImprovedProductFilterBar 
            products={collectionProducts}
            onFilteredProducts={setFilteredByFilterBar}
            compact={true}
            className="shadow-sm"
          />
        </div>
      </section>

      {/* Traditional Search & Sort Controls */}
      <section className="py-2 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="In dieser Kollektion suchen..."
                value={searchQuery}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchQuery(value);
                  if (value.length >= 3) {
                    trackSearch({
                      search_string: value,
                      content_category: collection.handle
                    });
                  }
                }}
                className="pl-10 border-gray-300 focus:border-blue-600 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-center gap-4">
              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 border-gray-300 focus:border-blue-600">
                  <SelectValue placeholder="Sortierung" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Empfohlen</SelectItem>
                  <SelectItem value="title">Name A-Z</SelectItem>
                  <SelectItem value="price-low">Preis aufsteigend</SelectItem>
                  <SelectItem value="price-high">Preis absteigend</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-none border-0"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-none border-0"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section id="products-section" className="py-6 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          {productsLoading ? (
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
              {[...Array(12)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="aspect-square bg-gray-200 animate-pulse rounded-lg"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : sortedProducts.length > 0 ? (
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
              {sortedProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Keine Produkte gefunden
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || filteredByFilterBar.length > 0 
                  ? 'Versuchen Sie andere Filter oder Suchbegriffe.'
                  : 'Diese Kollektion enthält derzeit keine Produkte.'
                }
              </p>
              {(searchQuery || filteredByFilterBar.length > 0) && (
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setFilteredByFilterBar([]);
                  }}
                  variant="outline"
                >
                  Filter zurücksetzen
                </Button>
              )}
            </div>
          )}

          {/* Results Summary */}
          {sortedProducts.length > 0 && (
            <div className="mt-12 text-center">
              <p className="text-gray-600">
                <span className="font-medium text-gray-900">{sortedProducts.length}</span>
                {' '}von {collectionProducts.length} Produkten in der Kollektion "{collection.title}"
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default CollectionDetail;