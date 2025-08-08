import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layout } from '@/components/layout/Layout';
import { NextSEOHead } from '@/components/seo/NextSEOHead';
import { ProductCard } from '@/components/product/ProductCard';
import { useWishlist } from '@/hooks/useWishlist';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingBag, Trash2 } from '@/lib/icons';
import { usePageTitle, formatPageTitle } from '@/hooks/usePageTitle';
import { generateStaticPageSEO } from '@/lib/seo';

export default function WishlistPage() {
  const [mounted, setMounted] = useState(false);
  
  usePageTitle(formatPageTitle('Wunschliste'));
  
  const { wishlistItems, clearWishlist, wishlistCount } = useWishlist();

  // Generate SEO metadata for wishlist page
  const seoData = generateStaticPageSEO('wishlist');

  // Verhindert Hydration-Fehler durch client-only rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Zeige Loading während der Hydration um Fehler zu vermeiden
  if (!mounted) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 pt-16">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="animate-pulse space-y-8">
              <div className="text-center">
                <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-48 mx-auto"></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-4">
                    <div className="aspect-square bg-gray-200 rounded-lg"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <NextSEOHead 
        seo={seoData}
        canonicalUrl="wishlist" 
      />
      <Layout>
        <div className="min-h-screen bg-gray-50 pt-16">
          <div className="max-w-7xl mx-auto px-6 py-12">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <Heart className="h-8 w-8 text-red-500 mr-3" />
                <h1 className="text-4xl md:text-5xl font-light text-gray-900">
                  Meine Wunschliste
                </h1>
              </div>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {wishlistCount > 0 
                  ? `${wishlistCount} ${wishlistCount === 1 ? 'Produkt' : 'Produkte'} in Ihrer Wunschliste`
                  : 'Ihre Wunschliste ist noch leer'
                }
              </p>
            </div>

            {/* Wishlist Content */}
            {wishlistItems.length > 0 ? (
              <>
                {/* Actions Bar */}
                <div className="flex items-center justify-between mb-8 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                  <span className="text-sm text-gray-600">
                    {wishlistCount} {wishlistCount === 1 ? 'Artikel' : 'Artikel'}
                  </span>
                  <Button 
                    variant="outline" 
                    onClick={clearWishlist}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Alle entfernen
                  </Button>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {wishlistItems.map((item) => (
                    <ProductCard 
                      key={item.id} 
                      product={item.product}
                    />
                  ))}
                </div>
              </>
            ) : (
              /* Empty State */
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <Heart className="h-24 w-24 text-gray-300 mx-auto mb-6" />
                  <h2 className="text-2xl font-light text-gray-900 mb-4">
                    Ihre Wunschliste ist leer
                  </h2>
                  <p className="text-gray-600 mb-8">
                    Entdecken Sie unsere hochwertigen Lifestyle-Produkte und speichern Sie Ihre Favoriten für später.
                  </p>
                  <div className="space-y-4">
                    <Link href="/products">
                      <Button className="w-full sm:w-auto">
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Produkte entdecken
                      </Button>
                    </Link>
                    <br />
                    <Link href="/collections">
                      <Button variant="outline" className="w-full sm:w-auto">
                        Kollektionen durchstöbern
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
}
