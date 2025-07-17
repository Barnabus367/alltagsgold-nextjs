import { useState, useMemo } from 'react';
import { useProducts, useCollections } from '@/hooks/useShopify';
import { ProductCard } from '@/components/product/ProductCard';
import { ImprovedProductFilterBar } from '@/components/product/ImprovedProductFilterBar';
import { ShopifyError } from '@/components/common/ShopifyError';
import { useProductSearch, useProductFilter } from '@/hooks/useShopify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Grid, List } from 'lucide-react';
import { usePageTitle, formatPageTitle } from '@/hooks/usePageTitle';
import { trackSearch } from '@/lib/analytics';
import { SEOHelmet } from '@/components/SEOHelmet';
import { ShopifyProduct, ShopifyCollection } from '@/types/shopify';

interface ProductsProps {
  preloadedProducts?: ShopifyProduct[];
}

export function Products({ preloadedProducts }: ProductsProps) {
  usePageTitle(formatPageTitle('Alle Produkte'));
  
  const { data: productsData, isLoading, error } = useProducts(250, {
    enabled: !preloadedProducts,
    initialData: preloadedProducts ? { products: preloadedProducts, hasNextPage: false } : undefined,
  });
  const { data: collections = [] } = useCollections();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollection, setSelectedCollection] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filteredByFilterBar, setFilteredByFilterBar] = useState<ShopifyProduct[]>([]);
  
  const products = productsData?.products || [];
  
  // Use filtered products from ProductFilterBar if available, otherwise use all products
  const baseProducts = filteredByFilterBar.length > 0 ? filteredByFilterBar : products;
  
  // Search and filter products
  const searchResults = useProductSearch(searchQuery, baseProducts);
  const filteredProducts = useProductFilter(searchResults, {
    collection: selectedCollection === 'all' ? undefined : selectedCollection
  });

  // Sort products
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
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
  }, [filteredProducts, sortBy]);

  if (error) {
    return <ShopifyError error={error.message} />;
  }

  return (
    <div className="min-h-screen bg-white pt-16">
      <SEOHelmet
        title="Alle Produkte - Premium Lifestyle"
        description={`Entdecken Sie ${products.length} innovative Produkte für den Alltag. Premium Qualität und schweizerische Standards für besondere Momente.`}
        type="website"
      />
      {/* Hero Section */}
      <section className="relative h-[45vh] bg-gradient-to-br from-blue-900 via-gray-900 to-black flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black/30 to-black/50 z-10"></div>
        <img 
          src="https://res.cloudinary.com/dwrk3iihw/image/upload/w_800,q_auto,f_webp/v1750348380/pexels-alexasfotos-2255441_njetbg.jpg"
          alt="Alle Produkte"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 text-center text-white max-w-5xl mx-auto px-6">
          <h1 className="text-5xl md:text-7xl font-light tracking-tight mb-6">
            Alle Produkte
          </h1>
          <p className="text-xl md:text-2xl font-light opacity-90 max-w-3xl mx-auto leading-relaxed">
            {products.length} innovative Produkte für Ihren Alltag - mit intelligenten Filtern schnell finden
          </p>
        </div>
      </section>

      {/* Improved Product Filter Bar */}
      <section className="py-6 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <ImprovedProductFilterBar 
            products={products}
            onFilteredProducts={setFilteredByFilterBar}
            compact={true}
            className="shadow-sm"
          />
        </div>
      </section>

      {/* Traditional Filters & Search - HULL Style */}
      <section className="py-8 border-b border-gray-100 bg-white sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Produkte suchen..."
                value={searchQuery}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchQuery(value);
                  // Track search events for analytics
                  if (value.length >= 3) {
                    trackSearch({
                      search_string: value,
                      content_category: 'all_products'
                    });
                  }
                }}
                className="pl-10 border-gray-300 focus:border-black focus:ring-black rounded-none"
              />
            </div>

            <div className="flex items-center gap-4">
              {/* Collection Filter */}
              <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                <SelectTrigger className="w-48 border-gray-300 focus:border-black focus:ring-black rounded-none">
                  <SelectValue placeholder="Kategorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Kategorien</SelectItem>
                  {collections.map((collection: any) => (
                    <SelectItem key={collection.id} value={collection.handle}>
                      {collection.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 border-gray-300 focus:border-black focus:ring-black rounded-none">
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
              <div className="flex border border-gray-300 rounded-none">
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
                  className="rounded-none border-0 border-l border-gray-300"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid - HULL Style */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          {isLoading ? (
            <div className={`grid gap-8 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {[...Array(12)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="aspect-square bg-gray-100 animate-pulse"></div>
                  <div className="h-4 bg-gray-100 animate-pulse"></div>
                  <div className="h-4 bg-gray-100 animate-pulse w-2/3"></div>
                </div>
              ))}
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-2xl font-light text-gray-900 mb-4">
                Keine Produkte gefunden
              </h3>
              <p className="text-gray-600 mb-8">
                Versuchen Sie eine andere Suche oder ändern Sie die Filter.
              </p>
              <Button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCollection('all');
                }}
                variant="outline"
                className="border-black text-black hover:bg-black hover:text-white rounded-none"
              >
                Filter zurücksetzen
              </Button>
            </div>
          ) : (
            <>
              {/* Results Info */}
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                <p className="text-gray-600 font-light">
                  {sortedProducts.length} {sortedProducts.length === 1 ? 'Produkt' : 'Produkte'} gefunden
                  {searchQuery && (
                    <span className="ml-1">für "{searchQuery}"</span>
                  )}
                </p>
              </div>

              {/* Products Grid */}
              <div className={`grid gap-8 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1 lg:grid-cols-2 gap-12'
              }`}>
                {sortedProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default Products;