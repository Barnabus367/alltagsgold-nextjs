import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Minus, Plus, ShoppingCart, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useProduct } from '@/hooks/useShopify';
import { useCart } from '@/hooks/useCart';
import { ShopifyVariant, ShopifyProduct } from '@/types/shopify';

// Feature Flag System
import { getFeatureFlag } from '@/lib/feature-flags';

// Content Processing Systems
import { generateNativeContent, getCachedNativeContent, NativeContentResult } from '@/lib/native-descriptions';
import { generateLegacyContent, LegacyContentResult } from '@/lib/legacy-descriptions';

import { ShopifyError } from '@/components/common/ShopifyError';
import { NextSEOHead } from '@/components/seo/NextSEOHead';
import { generateProductSEO } from '@/lib/seo';
import { trackViewContent, trackAddToCart } from '@/lib/analytics';
import { PremiumImage } from '@/components/common/PremiumImage';
import { ProductDescription } from '@/components/product/ProductDescription';
import { ProductReviewStars } from '@/components/common/ProductReviewStars';
import { RelatedProducts } from '@/components/product/RelatedProducts';
import { formatPrice } from '@/lib/shopify';
import { formatPriceSafe, getPriceAmountSafe } from '@/lib/type-guards';
import { usePageTitle, formatPageTitle } from '@/hooks/usePageTitle';
import { useProductNavigationCleanup } from '@/lib/navigation-handler';

interface ProductDetailProps {
  preloadedProduct?: ShopifyProduct | null;
}

// Fallback constants
const FALLBACK_VARIANT: Partial<ShopifyVariant> = {
  id: '',
  title: 'Standard',
  price: { amount: '0', currencyCode: 'CHF' },
  availableForSale: false,
  selectedOptions: []
};

const FALLBACK_PRODUCT_DATA = {
  title: 'Produkt wird geladen...',
  handle: '',
  images: { edges: [] },
  variants: { edges: [] },
  collections: { edges: [] },
  description: '',
  descriptionHtml: '',
  id: '',
  priceRange: null
};

export function ProductDetail({ preloadedProduct }: ProductDetailProps) {
  const router = useRouter();
  const { handle } = router.query as { handle: string };
  
  // Hydration state management
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Use preloaded data or fall back to client-side fetching
  const { data: clientProduct, isLoading, error } = useProduct(handle!, {
    enabled: !preloadedProduct && !!handle && isHydrated,
    initialData: preloadedProduct || undefined,
  });
  
  const product = preloadedProduct || clientProduct;
  const { addItemToCart, isAddingToCart } = useCart();
  
  // All React Hooks MUST be called before any early returns
  const [selectedVariant, setSelectedVariant] = useState<ShopifyVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Memoized safe product data - NO direct product access in render
  const safeProductData = useMemo(() => {
    if (!product) {
      console.log('🚨 NO PRODUCT DATA - using fallback');
      return FALLBACK_PRODUCT_DATA;
    }
    
    console.log('✅ PRODUCT DATA FOUND:', {
      title: product.title,
      handle: product.handle,
      hasImages: !!product.images,
      imageEdgesCount: product.images?.edges?.length || 0,
      firstImageUrl: product.images?.edges?.[0]?.node?.url
    });
    
    return {
      title: product.title || 'Unbekanntes Produkt',
      handle: product.handle || '',
      images: product.images || { edges: [] },  // FIX: Korrekte Struktur beibehalten
      variants: product.variants || { edges: [] },
      collections: product.collections || { edges: [] },
      description: product.description || '',
      descriptionHtml: product.descriptionHtml || '',
      id: product.id || '',
      priceRange: product.priceRange || null
    };
  }, [product]);

  // Memoized variant data with fallbacks
  const safeVariantData = useMemo(() => {
    const variantEdges = safeProductData.variants?.edges || [];
    const firstVariant = variantEdges[0]?.node;
    const currentVariant = selectedVariant || firstVariant;
    
    return {
      current: currentVariant || FALLBACK_VARIANT,
      all: variantEdges.map((edge: any) => edge.node).filter(Boolean),
      hasMultiple: variantEdges.length > 1
    };
  }, [safeProductData.variants, selectedVariant]);

  // Memoized image data with fallbacks  
  const safeImageData = useMemo(() => {
    const imageEdges = safeProductData.images?.edges || [];
    const images = imageEdges.map((edge: any) => edge.node).filter(Boolean);
    
    // Enhanced Debug Logging für Bildverarbeitung
    console.log('🖼️ Image Processing Debug:', {
      productHandle: safeProductData.handle,
      totalImageEdges: imageEdges.length,
      processedImagesCount: images.length,
      selectedIndex: selectedImageIndex,
      imageUrls: images.map((img: any) => img.url),
      primaryImageUrl: images[0]?.url,
      currentImageUrl: images[selectedImageIndex]?.url,
      firstImageRaw: imageEdges[0]
    });
    
    return {
      all: images,
      current: images[selectedImageIndex] || null,
      primary: images[0] || null,
      hasMultiple: images.length > 1
    };
  }, [safeProductData.images, selectedImageIndex, safeProductData.handle]);

  // Memoized pricing with safe access
  const safePricing = useMemo(() => {
    const currentPrice = safeVariantData.current?.price;
    const fallbackPrice = safeProductData.priceRange?.minVariantPrice;
    
    return {
      formatted: formatPriceSafe(currentPrice || fallbackPrice),
      amount: getPriceAmountSafe(currentPrice || fallbackPrice),
      currency: currentPrice?.currencyCode || fallbackPrice?.currencyCode || 'CHF'
    };
  }, [safeVariantData, safeProductData.priceRange]);

  // Feature Flag für Content Processing
  const useNativeDescriptions = getFeatureFlag('USE_NATIVE_DESCRIPTIONS');
  
  // Memoized content processing - Feature Flag basiert
  const contentData = useMemo(() => {
    if (useNativeDescriptions) {
      // Neue Native Content Logik (wird async geladen)
      return { type: 'native' as const, data: null };
    } else {
      // Legacy Content Processing
      const legacyContent = generateLegacyContent(safeProductData);
      return { type: 'legacy' as const, data: legacyContent };
    }
  }, [safeProductData, useNativeDescriptions]);

  // State für Native Content (async loading)
  const [nativeContent, setNativeContent] = useState<NativeContentResult | null>(null);
  const [contentLoading, setContentLoading] = useState(false);

  // Native Content async laden
  useEffect(() => {
    if (contentData.type === 'native' && safeProductData.handle) {
      setContentLoading(true);
      
      if (getFeatureFlag('DEBUG_DESCRIPTION_PARSING')) {
        console.log('🔄 Loading Native Content for:', safeProductData.handle, {
          hasDescription: !!safeProductData.description,
          hasDescriptionHtml: !!safeProductData.descriptionHtml,
          descriptionLength: safeProductData.description?.length || 0,
          descriptionHtmlLength: safeProductData.descriptionHtml?.length || 0
        });
      }
      
      getCachedNativeContent(safeProductData.handle, safeProductData)
        .then(result => {
          setNativeContent(result);
          setContentLoading(false);
          
          if (getFeatureFlag('DEBUG_DESCRIPTION_PARSING')) {
            console.log('✅ Native Content loaded:', {
              source: result.source,
              htmlLength: result.html.length,
              plainTextLength: result.plainText.length,
              sectionsCount: result.sections?.length || 0,
              isEmpty: result.isEmpty
            });
          }
        })
        .catch(error => {
          console.error('❌ Native Content loading failed:', error);
          setContentLoading(false);
          // Fallback zu Legacy bei Fehlern
        });
    }
  }, [contentData.type, safeProductData.handle, safeProductData]);

  // Finales Content-Objekt für UI-Rendering
  const optimizedContent = useMemo(() => {
    if (contentData.type === 'native') {
      if (!nativeContent) {
        // Loading-State für Native Content
        return {
          type: 'native' as const,
          loading: contentLoading,
          html: '',
          plainText: safeProductData.title || 'Laden...',
          sections: [],
          isEmpty: true
        };
      }
      
      // Native Content verfügbar
      return {
        type: 'native' as const,
        loading: false,
        html: nativeContent.html,
        plainText: nativeContent.plainText,
        sections: nativeContent.sections || [],
        isEmpty: nativeContent.isEmpty,
        metadata: nativeContent.metadata
      };
    } else {
      // Legacy Content
      const legacyData = contentData.data as LegacyContentResult;
      return {
        type: 'legacy' as const,
        loading: false,
        introText: legacyData.introText,
        benefits: legacyData.benefits || [],
        sections: legacyData.sections || [],
        isEmpty: false
      };
    }
  }, [contentData, nativeContent, contentLoading, safeProductData.title]);

  // Memoized SEO data - Feature Flag basiert
  const seoData = useMemo(() => {
    if (!product) return null;
    
    // SEO-Description basierend auf Content-Type
    let seoDescription = '';
    
    if (optimizedContent.type === 'native' && !optimizedContent.loading && !optimizedContent.isEmpty) {
      seoDescription = optimizedContent.plainText.slice(0, 160);
    } else if (optimizedContent.type === 'legacy') {
      const intro = optimizedContent.introText || '';
      const benefitsText = optimizedContent.benefits?.join(' ') || '';
      const combined = `${intro} ${benefitsText}`.trim();
      seoDescription = combined.slice(0, 160);
    } else {
      seoDescription = safeProductData.title;
    }
    
    // Temporär angepasstes Product-Objekt für SEO
    const productForSEO = {
      ...product,
      description: seoDescription
    };
    
    return generateProductSEO(productForSEO);
  }, [product, optimizedContent, safeProductData.title]);

  // Memoized structured data - Feature Flag basiert
  const structuredData = useMemo(() => {
    if (!safeProductData.id || !safeImageData.primary) return null;
    
    // Description für Structured Data
    let structuredDescription = '';
    if (optimizedContent.type === 'native' && !optimizedContent.loading && !optimizedContent.isEmpty) {
      structuredDescription = optimizedContent.plainText;
    } else if (optimizedContent.type === 'legacy') {
      const intro = optimizedContent.introText || '';
      const benefitsText = optimizedContent.benefits?.join(' ') || '';
      const combined = `${intro} ${benefitsText}`.trim();
      structuredDescription = combined || safeProductData.title;
    } else {
      structuredDescription = safeProductData.title;
    }
    
    return {
      "@type": "Product",
      name: safeProductData.title,
      image: safeImageData.primary.url,
      description: structuredDescription,
      offers: {
        "@type": "Offer",
        price: safePricing.amount,
        priceCurrency: safePricing.currency,
        availability: safeVariantData.current?.availableForSale ? "InStock" : "OutOfStock",
        url: `https://www.alltagsgold.ch/products/${safeProductData.handle}`
      }
    };
  }, [safeProductData, safeImageData.primary, optimizedContent, safePricing, safeVariantData]);

  // Memoized breadcrumbs - lazy loaded
  const breadcrumbs = useMemo(() => {
    const crumbs = [
      { name: 'Home', url: 'https://www.alltagsgold.ch/', position: 1 },
      { name: 'Shop', url: 'https://www.alltagsgold.ch/collections', position: 2 }
    ];

    // Add collection breadcrumb if product has collections
    const collectionEdges = safeProductData.collections?.edges || [];
    if (collectionEdges.length > 0) {
      const collection = collectionEdges[0]?.node;
      if (collection) {
        crumbs.push({
          name: collection.title,
          url: `https://www.alltagsgold.ch/collections/${collection.handle}`,
          position: 3
        });
        crumbs.push({
          name: safeProductData.title,
          url: `https://www.alltagsgold.ch/products/${safeProductData.handle}`,
          position: 4
        });
      }
    } else {
      crumbs.push({
        name: safeProductData.title,
        url: `https://www.alltagsgold.ch/products/${safeProductData.handle}`,
        position: 3
      });
    }
    
    return crumbs;
  }, [safeProductData]);

  // Hydration fix
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Navigation Handler für saubere Product-Page-Navigation
  useProductNavigationCleanup();

  // Set page title with safe access
  usePageTitle(safeProductData.title !== 'Produkt wird geladen...' ? formatPageTitle(safeProductData.title) : 'Produkt wird geladen...');

  // Set default variant and check mobile when product loads
  useEffect(() => {
    if (product && !selectedVariant) {
      const firstVariant = product.variants?.edges?.[0]?.node;
      if (firstVariant) {
        setSelectedVariant(firstVariant);
      }
    }
    
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [product, selectedVariant]);

  // Track ViewContent when product loads - ONLY access product within useEffect
  useEffect(() => {
    if (product) {
      const primaryVariant = product.variants?.edges?.[0]?.node;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Tracking ViewContent for product:', product.title);
      }
      
      trackViewContent({
        content_id: product.id || '',
        content_name: product.title || 'Unknown Product',
        content_type: 'product',
        value: getPriceAmountSafe(primaryVariant?.price),
        currency: primaryVariant?.price?.currencyCode || 'CHF'
      });
    }
  }, [product]);

  // Early return checks AFTER all hooks to comply with Rules of Hooks
  // Loading state
  if (isLoading || !product) {
    return (
      <div className="min-h-screen bg-white pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Produkt wird geladen...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white pt-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Fehler beim Laden</h1>
          <p className="text-gray-600 mb-8">Das Produkt konnte nicht geladen werden. Bitte versuchen Sie es später erneut.</p>
          <Link href="/products" className="bg-black text-white px-6 py-2 hover:bg-gray-800 inline-block">
            Alle Produkte ansehen
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = async () => {
    if (safeVariantData.current && safeProductData.id) {
      const productData = {
        title: safeProductData.title,
        image: safeImageData.current?.url,
        price: safeVariantData.current.price,
        selectedOptions: safeVariantData.current.selectedOptions || [],
        handle: safeProductData.handle
      };
      
      // Track AddToCart event
      trackAddToCart({
        content_id: safeProductData.id,
        content_name: safeProductData.title,
        content_type: 'product',
        value: safePricing.amount * quantity,
        currency: safePricing.currency,
        contents: [{
          id: safeVariantData.current.id || '',
          quantity: quantity,
          item_price: safePricing.amount
        }]
      });
      
      await addItemToCart(safeVariantData.current.id || '', quantity, productData);
    }
  };

  const handleVariantChange = (variantIndex: number) => {
    const variant = safeVariantData.all[variantIndex];
    if (variant) {
      setSelectedVariant(variant);
      // Update image if variant has specific image
      if (variant.image) {
        const imageIndex = safeImageData.all.findIndex((img: any) => img.url === variant.image?.url);
        if (imageIndex !== -1) {
          setSelectedImageIndex(imageIndex);
        }
      }
    }
  };

  const adjustQuantity = (delta: number) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  // Prevent hydration mismatch by waiting for client-side hydration
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600 font-light">Wird geladen...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600 font-light">Produkt wird geladen...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-white pt-16">
      <NextSEOHead 
        seo={seoData || { 
          title: safeProductData.title, 
          description: (optimizedContent.type === 'legacy' ? optimizedContent.introText : optimizedContent.plainText) || safeProductData.title,
          keywords: '',
          openGraph: {
            title: safeProductData.title,
            description: (optimizedContent.type === 'legacy' ? optimizedContent.introText : optimizedContent.plainText) || safeProductData.title,
            image: safeImageData.primary?.url,
            url: `/products/${safeProductData.handle}`
          },
          twitter: {
            card: 'summary',
            title: safeProductData.title,
            description: (optimizedContent.type === 'legacy' ? optimizedContent.introText : optimizedContent.plainText) || safeProductData.title
          }
        }}
        canonicalUrl={`products/${safeProductData.handle}`}
        structuredData={structuredData}
      />
      
      {/* Enhanced Breadcrumb Navigation with Collection */}
      <div className="py-4 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-black transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/collections" className="hover:text-black transition-colors">
              Shop
            </Link>
            {safeProductData.collections?.edges && safeProductData.collections.edges.length > 0 && (
              <>
                <span>/</span>
                <Link 
                  href={`/collections/${safeProductData.collections.edges[0]?.node?.handle || ''}`}
                  className="hover:text-black transition-colors"
                >
                  {safeProductData.collections.edges[0]?.node?.title || 'Kollektion'}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-gray-900 font-medium">{safeProductData.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Links: Produktbild / Galerie */}
          <div className="space-y-6">
            {/* Main Image */}
            <div className="aspect-square overflow-hidden bg-gray-50 rounded-lg">
              <PremiumImage
                src={safeImageData.current?.url || safeImageData.primary?.url || ''}
                alt={safeImageData.current?.altText || safeProductData.title}
                className="w-full h-full object-cover"
                productTitle={safeProductData.title}
                productId={safeProductData.id ? safeProductData.id.replace('gid://shopify/Product/', '') : undefined}
                imageIndex={selectedImageIndex}
                context="detail"
              />
            </div>
            
            {/* Thumbnail Images */}
            {safeImageData.hasMultiple && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {safeImageData.all.map((image: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index ? 'border-black' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    aria-label={`Produktbild ${index + 1} von ${safeImageData.all.length} anzeigen`}
                  >
                    <PremiumImage
                      src={image.url}
                      alt={image.altText || safeProductData.title}
                      className="w-full h-full object-cover"
                      productTitle={safeProductData.title}
                      productId={safeProductData.id ? safeProductData.id.replace('gid://shopify/Product/', '') : undefined}
                      imageIndex={index}
                      context="thumbnail"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Varianten-Auswahl - Unter der Thumbnail-Galerie */}
            {safeVariantData.hasMultiple && (
              <div className="mt-8 space-y-4">
                <h3 className="product-section-heading text-gray-900">Varianten</h3>
                <div className="grid grid-cols-2 gap-3">
                  {safeVariantData.all.map((variant: any, index: number) => (
                    <button
                      key={variant.id}
                      onClick={() => handleVariantChange(index)}
                      className={`p-3 text-sm border rounded-lg transition-colors ${
                        safeVariantData.current?.id === variant.id
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {variant.selectedOptions?.map((option: any) => option.value).join(' / ') || variant.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Produktbeschreibung - Unter der Galerie (und Varianten) - Nur reine Beschreibung */}
            <div className="mt-12 space-y-6">
              <h2 className="product-section-heading text-gray-900 mb-4">Produktbeschreibung</h2>
              
              {/* Native HTML Content Rendering - Nur Beschreibung ohne Produktvorteile */}
              {optimizedContent.type === 'native' ? (
                <div className="space-y-4">
                  <div 
                    className="prose prose-lg max-w-none text-gray-800 leading-relaxed"
                    dangerouslySetInnerHTML={{ 
                      __html: optimizedContent.html
                        .replace(/<h[1-6][^>]*>.*?Produktvorteile.*?<\/h[1-6]>[\s\S]*?(?=<h[1-6]|$)/gi, '')
                        .replace(/<h[1-6][^>]*>.*?Technische Details.*?<\/h[1-6]>[\s\S]*$/gi, '')
                        .trim()
                    }}
                  />
                </div>
              ) : (
                // Legacy Content Rendering
                <div className="space-y-6">
                  {/* Intro Text */}
                  {optimizedContent.introText && (
                    <div className="space-y-4">
                      <p className="product-text text-gray-700 leading-relaxed">
                        {optimizedContent.introText}
                      </p>
                    </div>
                  )}

                  {/* Strukturierte Sections - Nur Beschreibung, keine Produktvorteile */}
                  {optimizedContent.sections && optimizedContent.sections.length > 0 && (
                    <div className="space-y-4">
                      {optimizedContent.sections
                        .filter((section: any) => 
                          !section.title.toLowerCase().includes('produktvorteile') &&
                          !section.title.toLowerCase().includes('technische details')
                        )
                        .map((section: any, index: number) => (
                        <div key={index} className="space-y-2">
                          <h4 className="font-semibold text-gray-900">{section.title}</h4>
                          {Array.isArray(section.content) ? (
                            <ul className="space-y-1">
                              {section.content.map((item: string, itemIndex: number) => (
                                <li key={itemIndex} className="text-sm text-gray-700 flex items-start space-x-2">
                                  <span className="text-gray-400 mt-1">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div 
                              className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                              dangerouslySetInnerHTML={{ __html: section.content }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Rechts: Product Info nach Wireframe */}
          <div className="product-detail space-y-6">
            {/* 1. Name & Preis - Oberer Block */}
            <div className="space-y-4">
              <h1 className="product-title">{safeProductData.title}</h1>
              
              {/* Produktbewertungen - wird später mit echten Daten gefüllt */}
              <ProductReviewStars 
                rating={0} // Wird später durch echte Bewertungsdaten ersetzt
                reviewCount={0}
                size="md"
              />
              
              <div className="product-price">{safePricing.formatted}</div>
            </div>

            {/* 2. Versand & Service - Direkt unter Preis - CHF 60 korrigiert */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-3 text-sm text-gray-700">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Kostenloser Versand ab CHF 60</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-700">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>30 Tage Rückgaberecht</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-700">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span>2 Jahre Garantie</span>
              </div>
            </div>

            {/* 3. Produktvorteile (nur Bullet Points) */}
            {optimizedContent.type === 'native' ? (
              <div className="space-y-4">
                <h3 className="product-section-heading">Produktvorteile</h3>
                <div 
                  className="prose prose-lg max-w-none text-gray-800"
                  dangerouslySetInnerHTML={{ 
                    __html: optimizedContent.html
                      .match(/<h[1-6][^>]*>.*?Produktvorteile.*?<\/h[1-6]>([\s\S]*?)(?=<h[1-6]|$)/gi)?.[0]
                      ?.replace(/<h[1-6][^>]*>.*?Produktvorteile.*?<\/h[1-6]>/gi, '') || ''
                  }}
                />
              </div>
            ) : (
              optimizedContent.benefits && optimizedContent.benefits.length > 0 && (
                <div className="space-y-4">
                  <h3 className="product-section-heading">Produktvorteile</h3>
                  <ul className="space-y-3">
                    {optimizedContent.benefits.map((benefit: string, index: number) => (
                      <li key={index} className="flex items-start space-x-3">
                        <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                        <span className="product-bullet-text">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            )}

            {/* 4. Technische Details - FUNKTIONIERT FÜR BEIDE CONTENT-TYPES */}
            {optimizedContent.type === 'native' ? (
              // Native Content: Technische Details aus HTML extrahieren
              optimizedContent.html.includes('Technische Details') && (
                <div className="space-y-4">
                  <h3 className="product-section-heading">Technische Details</h3>
                  <div 
                    className="prose prose-lg max-w-none text-gray-800"
                    dangerouslySetInnerHTML={{ 
                      __html: optimizedContent.html
                        .match(/<h[1-6][^>]*>.*?Technische Details.*?<\/h[1-6]>([\s\S]*?)(?=<h[1-6]|$)/gi)?.[0]
                        ?.replace(/<h[1-6][^>]*>.*?Technische Details.*?<\/h[1-6]>/gi, '') || ''
                    }}
                  />
                </div>
              )
            ) : (
              // Legacy Content: Strukturierte Sections
              optimizedContent.sections && optimizedContent.sections.length > 0 && (
                <div className="space-y-4">
                  <h3 className="product-section-heading">Technische Details</h3>
                  <ul className="space-y-3">
                    {optimizedContent.sections[0].content && Array.isArray(optimizedContent.sections[0].content) &&
                      optimizedContent.sections[0].content.map((detail: string, index: number) => (
                        <li key={index} className="flex items-start space-x-3">
                          <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                          <span className="product-bullet-text">{detail}</span>
                        </li>
                      ))
                    }
                  </ul>
                </div>
              )
            )}

            {/* 5. In den Warenkorb (CTA) - Unterer Block */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              {/* Quantity Selector */}
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-900">Menge:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => adjustQuantity(-1)}
                    className="p-2 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    disabled={quantity <= 1}
                    aria-label="Menge verringern"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 min-w-[3rem] text-center">{quantity}</span>
                  <button
                    onClick={() => adjustQuantity(1)}
                    className="p-2 hover:bg-gray-50 transition-colors"
                    aria-label="Menge erhöhen"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Add to Cart Button - Exakt nach Spezifikation */}
              <Button 
                onClick={handleAddToCart}
                disabled={!safeVariantData.current?.availableForSale || isAddingToCart}
                className="w-full bg-black hover:bg-gray-800 text-white py-4 cta-button transition-all duration-200"
                aria-label={safeProductData.title ? `${safeProductData.title} in den Warenkorb legen` : 'Produkt in den Warenkorb legen'}
              >
                {isAddingToCart ? (
                  'Wird hinzugefügt...'
                ) : !safeVariantData.current?.availableForSale ? (
                  'Nicht verfügbar'
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    In den Warenkorb
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Verwandte Produkte für bessere interne Verlinkung */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <RelatedProducts currentProduct={product!} />
      </div>
    </div>
  );
}

export default ProductDetail;