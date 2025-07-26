import { useState } from 'react';
import { useRouter } from 'next/router';
import { useCollection, useProducts } from '@/hooks/useShopify';
import { ProductCard } from '@/components/product/ProductCard';
import { SearchBar } from '@/components/common/SearchBar';
import { ShopifyError } from '@/components/common/ShopifyError';
import { NextSEOHead } from '@/components/seo/NextSEOHead';
import { generateCollectionSEO } from '@/lib/seo';
import { useProductSearch } from '@/hooks/useShopify';
import { ArrowLeft } from 'lucide-react';
import { getPriceAmountSafe } from '@/lib/type-guards';
import Link from 'next/link';
import { trackSearch } from '@/lib/analytics';

export function CollectionView() {
  const router = useRouter();
  const { handle } = router.query as { handle: string };
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  
  const { data: collection, isLoading: collectionLoading, error: collectionError } = useCollection(handle!);
  const { data: productsData, isLoading: productsLoading } = useProducts();
  
  const allProducts = productsData?.products || [];
  
  // Filter products by collection
  const collectionProducts = allProducts.filter((product: any) => 
    product.collections?.edges?.some((edge: any) => edge.node.handle === handle)
  );
  
  const searchResults = useProductSearch(searchQuery, collectionProducts);

  // Sort products
  const sortedProducts = [...searchResults].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return getPriceAmountSafe(a.priceRange.minVariantPrice) - getPriceAmountSafe(b.priceRange.minVariantPrice);
      case 'price-high':
        return getPriceAmountSafe(b.priceRange.minVariantPrice) - getPriceAmountSafe(a.priceRange.minVariantPrice);
      case 'name':
        return a.title.localeCompare(b.title);
      default:
        return 0; // featured/default order
    }
  });

  if (collectionError) {
    return <ShopifyError error={String(collectionError)} />;
  }

  return (
    <div className="min-h-screen bg-white">
      {collection && (
        <NextSEOHead 
          seo={generateCollectionSEO(collection)}
          canonicalUrl={`collections/${collection.handle}`}
        />
      )}
      
      {/* HULL-style hero section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back to collections */}
          <div className="mb-8">
            <Link href="/collections">
              <button className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zurück zu den Kategorien
              </button>
            </Link>
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl font-light text-gray-900 mb-4">
              {collectionLoading ? 'Lädt...' : collection?.title || 'Kategorie'}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {collectionLoading ? '' : collection?.description || 'Entdecke unsere Auswahl in dieser Kategorie'}
            </p>
            <div className="mt-4 text-sm text-gray-500">
              {sortedProducts.length} {sortedProducts.length === 1 ? 'Produkt' : 'Produkte'}
            </div>
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <SearchBar 
            onSearch={(query) => {
              setSearchQuery(query);
              // Track collection-specific search events
              if (query.length >= 3) {
                trackSearch({
                  search_string: query,
                  content_category: collection?.title || handle || 'collection'
                });
              }
            }}
            placeholder="In dieser Kategorie suchen..."
            className="mb-6"
          />
          
          {/* Sort options */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              {searchQuery ? `${sortedProducts.length} Ergebnisse für "${searchQuery}"` : `${sortedProducts.length} Produkte`}
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-gray-500 focus:outline-none"
            >
              <option value="featured">Empfohlen</option>
              <option value="name">Name A-Z</option>
              <option value="price-low">Preis aufsteigend</option>
              <option value="price-high">Preis absteigend</option>
            </select>
          </div>
        </div>

        {/* Products grid */}
        {productsLoading || collectionLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {sortedProducts.length === 0 && !productsLoading && !collectionLoading && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              {searchQuery ? 'Keine Produkte gefunden.' : 'Diese Kategorie enthält noch keine Produkte.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Suche zurücksetzen
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CollectionView;