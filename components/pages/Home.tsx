import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { HighlightProductCard } from '@/components/product/HighlightProductCard';
import { ShopifyError } from '@/components/common/ShopifyError';
import { useProducts, useCollections } from '@/hooks/useShopify';
import { formatPrice } from '@/lib/shopify';
import { ShopifyProduct, ShopifyCollection } from '@/types/shopify';
import Link from 'next/link';
import { getCategoryImage } from '@/lib/categoryImages';
import { TrustSlider } from '@/components/common/TrustSlider';
import { USPSection } from '@/components/common/USPSection';
import { usePageTitle, formatPageTitle } from '@/hooks/usePageTitle';
import { BlogTeaser } from '@/components/home/BlogTeaser';

interface HomeProps {
  searchQuery?: string;
  preloadedProducts?: ShopifyProduct[];
  preloadedCollections?: ShopifyCollection[];
  recentPosts?: any[];
}

export default function Home({ preloadedProducts, preloadedCollections, recentPosts = [] }: HomeProps) {
  usePageTitle(formatPageTitle('Home'));
  
  const { data: productsData, isLoading: productsLoading, error: productsError } = useProducts(8, {
    enabled: !preloadedProducts,
    initialData: preloadedProducts ? { products: preloadedProducts, hasNextPage: false } : undefined,
  });
  const { data: collections, isLoading: collectionsLoading, error: collectionsError } = useCollections({
    enabled: !preloadedCollections,
    initialData: preloadedCollections,
  });

  const products = productsData?.products || [];
  const featuredProducts = products.slice(0, 4);

  if (productsError || collectionsError) {
    return <ShopifyError error={productsError?.message || collectionsError?.message || 'Error loading data'} />;
  }

  return (
    <div className="min-h-screen">
      {/* Modern Reduced Hero Section */}
      <section className="relative overflow-hidden min-h-screen flex items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
      src={"https://cdn.shopify.com/s/files/1/0918/4575/5223/files/pexels-silverkblack-23224720_ft2x1y_jpg.webp?v=1753748616"}
      alt="Premium Package auf Teppich"
      width={1200}
      height={600}
      className="w-full h-full object-cover"
      priority
    />
          {/* Semi-transparent dark overlay for contrast */}
          <div className="absolute inset-0 bg-black bg-opacity-40" />
        </div>

        {/* Text Overlay - Centered */}
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          {/* Main Headline */}
          <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight">
                          <span className="text-black">alltags</span>
              <span style={{ color: '#c9a74d' }}>gold</span>
          </h1>
          
          {/* First Subline */}
          <p className="text-xl md:text-2xl mb-3 font-medium">
            Clever bestellt. Clever geliefert.
          </p>
          
          {/* Second Subline */}
          <p className="text-lg md:text-xl mb-12 opacity-90">
            Direkt aus der Schweiz. Ohne Umwege.
          </p>
          
          {/* CTA Button */}
          <Button asChild className="bg-black hover:bg-neutral-900 text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors duration-300 shadow-lg hover:shadow-xl" aria-label="Jetzt entdecken - Zu den Produktkategorien">
            <Link href="/collections">Jetzt entdecken</Link>
          </Button>
        </div>
      </section>

      {/* USP Section - Vertrauenselemente */}
      <USPSection />

      {/* Trust Slider - Editorial Marquee */}
      <TrustSlider />
      

      {/* Hero-Style Sortimente Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light mb-4 text-gray-900">
              Sortimente
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Entdecken Sie unsere kuratierten Produktkategorien für jeden Bereich Ihres Lebens
            </p>
          </div>

          {collectionsLoading || productsLoading ? (
            <div className="space-y-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-xl"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {collections?.slice(0, 6).map((collection: any) => {
                // SHOPIFY-FIRST: Verwende echte Shopify-Bilder mit intelligenten Fallbacks
                const heroImage = getCategoryImage(collection.title, collection.handle, collection.image?.url);
                
                return (
                  <Link key={collection.id} href={`/collections/${collection.handle}`}>
                    <div className="group cursor-pointer">
                      <div className="relative h-64 md:h-80 rounded-xl overflow-hidden">
                        {/* Hero Background Image */}
                        {heroImage ? (
                          <Image
                            src={heroImage}
                            alt={`${collection.title} - AlltagsGold Kollektion`}
                            width={1200}
                            height={600}
                            className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                            priority
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300" />
                        )}
                        
                        {/* Dark Overlay for Text Readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        
                        {/* Content Overlay */}
                        <div className="relative h-full flex flex-col justify-end p-8 md:p-12">
                          <div className="text-white">
                            <h3 className="text-2xl md:text-3xl font-light mb-3 text-white drop-shadow-lg">
                              {collection.title}
                            </h3>
                            <p className="text-gray-100 text-lg mb-6 max-w-2xl leading-relaxed drop-shadow">
                              {collection.description || 'Entdecken Sie unsere Auswahl hochwertiger Produkte'}
                            </p>
                            <div className="inline-block">
                              <span className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white font-medium hover:bg-white/30 transition-all duration-300 group-hover:translate-x-1">
                                Kollektion entdecken
                                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light mb-4 text-gray-900">
              Ausgewählte Produkte
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Handverlesene Gadgets für Ihren Alltag
            </p>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product: any) => (
                <HighlightProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Blog Teaser */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <BlogTeaser posts={recentPosts} />
        </div>
      </section>
    </div>
  );
}
