import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Minus, Plus, ShoppingCart, Package, Truck, Shield, Clock, Ruler, Palette, Zap, Settings } from '@/lib/icons';
import { useProduct } from '@/hooks/useShopify';
import { useCart } from '@/hooks/useCart';
import { ShopifyVariant, ShopifyProduct } from '@/types/shopify';

// Feature Flag System
import { getFeatureFlag } from '@/lib/feature-flags';

// Content Processing Systems
import { getCachedNativeContent, NativeContentResult } from '@/lib/native-descriptions';
import { generateLegacyContent, LegacyContentResult } from '@/lib/legacy-descriptions';

import { NextSEOHead } from '@/components/seo/NextSEOHead';
import { generateProductSEO } from '@/lib/seo';
import { trackViewContent, trackAddToCart } from '@/lib/analytics';
import { PremiumImage } from '@/components/common/PremiumImage';
import { ProductReviewStars } from '@/components/common/ProductReviewStars';
import { RelatedProducts } from '@/components/product/RelatedProducts';
import { formatPriceSafe, getPriceAmountSafe } from '@/lib/type-guards';
import { usePageTitle, formatPageTitle } from '@/hooks/usePageTitle';
import { useProductNavigationCleanup } from '@/lib/navigation-handler';
import { useScrollProgress } from '@/hooks/useRevealAnimation';
import { RevealWrapper } from '@/components/product/RevealWrapper';
import { usePremiumScrollEffects } from '@/hooks/usePremiumScrollEffects';

interface ProductDetailProps {
  preloadedProduct?: ShopifyProduct | null;
}

// Helper function to get color from variant name
function getColorFromVariant(variantName: string): string {
  const colorMap: { [key: string]: string } = {
    'schwarz': 'black',
    'black': 'black',
    'weiss': 'white', 
    'weiß': 'white',
    'white': 'white',
    'rot': 'red',
    'red': 'red',
    'blau': 'blue',
    'blue': 'blue',
    'grün': 'green',
    'gruen': 'green',
    'green': 'green',
    'gelb': 'yellow',
    'yellow': 'yellow',
    'pink': 'pink',
    'rosa': 'pink',
    'lila': 'purple',
    'violett': 'purple',
    'purple': 'purple',
    'orange': 'orange',
    'grau': 'gray',
    'gray': 'gray',
    'braun': 'brown',
    'brown': 'brown',
    'beige': 'beige',
    'navy': 'navy',
    'gold': 'gold',
    'silber': 'silver',
    'silver': 'silver',
    'holz': 'wood',
    'wood': 'wood'
  };

  const lowerName = variantName.toLowerCase();
  
  // Check exact matches first
  if (colorMap[lowerName]) {
    return colorMap[lowerName];
  }
  
  // Check if name contains color
  for (const [key, value] of Object.entries(colorMap)) {
    if (lowerName.includes(key)) {
      return value;
    }
  }
  
  return 'default';
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

// Tech specs icon mapping
function getTechSpecIcon(label: string) {
  const lowerLabel = label.toLowerCase();
  if (lowerLabel.includes('größe') || lowerLabel.includes('maße') || lowerLabel.includes('dimension')) {
    return <Ruler className="h-5 w-5" />;
  }
  if (lowerLabel.includes('material')) {
    return <Package className="h-5 w-5" />;
  }
  if (lowerLabel.includes('farbe') || lowerLabel.includes('color')) {
    return <Palette className="h-5 w-5" />;
  }
  if (lowerLabel.includes('strom') || lowerLabel.includes('power') || lowerLabel.includes('energie')) {
    return <Zap className="h-5 w-5" />;
  }
  return <Settings className="h-5 w-5" />;
}

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
      images: product.images || { edges: [] },
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
    
    return {
      all: images,
      current: images[selectedImageIndex] || null,
      primary: images[0] || null,
      hasMultiple: images.length > 1
    };
  }, [safeProductData.images, selectedImageIndex]);

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
      return { type: 'native' as const, data: null };
    } else {
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
      
      getCachedNativeContent(safeProductData.handle, safeProductData)
        .then(result => {
          setNativeContent(result);
          setContentLoading(false);
        })
        .catch(error => {
          console.error('❌ Native Content loading failed:', error);
          setContentLoading(false);
        });
    }
  }, [contentData.type, safeProductData.handle, safeProductData]);

  // Finales Content-Objekt für UI-Rendering
  const optimizedContent = useMemo(() => {
    if (contentData.type === 'native') {
      if (!nativeContent) {
        return {
          type: 'native' as const,
          loading: contentLoading,
          html: '',
          plainText: safeProductData.title || 'Laden...',
          sections: [],
          isEmpty: true
        };
      }
      
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

  // Memoized SEO data
  const seoData = useMemo(() => {
    if (!product) return null;
    
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
    
    const productForSEO = {
      ...product,
      description: seoDescription
    };
    
    return generateProductSEO(productForSEO);
  }, [product, optimizedContent, safeProductData.title]);

  // Memoized structured data
  const structuredData = useMemo(() => {
    if (!safeProductData.id || !safeImageData.primary) return null;
    
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

  // Extract tech details from content - MUST be before early returns
  const techDetails = useMemo(() => {
    if (optimizedContent.type === 'native' && optimizedContent.html.includes('Technische Details')) {
      const techMatch = optimizedContent.html.match(/<h[1-6][^>]*>.*?Technische Details.*?<\/h[1-6]>([\s\S]*?)(?=<h[1-6]|$)/gi);
      if (techMatch) {
        const techHtml = techMatch[0].replace(/<h[1-6][^>]*>.*?Technische Details.*?<\/h[1-6]>/gi, '');
        const listItems = techHtml.match(/<li[^>]*>(.*?)<\/li>/gi) || [];
        return listItems.map(item => {
          const text = item.replace(/<[^>]*>/g, '').trim();
          const [label, ...valueParts] = text.split(':');
          return {
            label: label?.trim() || text,
            value: valueParts.join(':').trim() || ''
          };
        });
      }
    } else if (optimizedContent.type === 'legacy' && optimizedContent.sections) {
      const techSection = optimizedContent.sections.find((s: any) => s.title.includes('Technische Details'));
      if (techSection && Array.isArray(techSection.content)) {
        return techSection.content.map((item: string) => {
          const [label, ...valueParts] = item.split(':');
          return {
            label: label?.trim() || item,
            value: valueParts.join(':').trim() || ''
          };
        });
      }
    }
    return [];
  }, [optimizedContent]);

  // Scroll Progress - MUST be before early returns
  const scrollProgress = useScrollProgress();
  
  // Premium Scroll Effects
  const premiumEffects = usePremiumScrollEffects();

  // Hydration fix
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Navigation Handler
  useProductNavigationCleanup();

  // Set page title
  usePageTitle(safeProductData.title !== 'Produkt wird geladen...' ? formatPageTitle(safeProductData.title) : 'Produkt wird geladen...');

  // Set default variant and check mobile when product loads
  useEffect(() => {
    if (product && !selectedVariant) {
      const firstVariant = product.variants?.edges?.[0]?.node;
      if (firstVariant) {
        setSelectedVariant(firstVariant);
      }
    }
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [product, selectedVariant]);

  // Track ViewContent when product loads
  useEffect(() => {
    if (product) {
      const primaryVariant = product.variants?.edges?.[0]?.node;
      
      trackViewContent({
        content_id: product.id || '',
        content_name: product.title || 'Unknown Product',
        content_type: 'product',
        value: getPriceAmountSafe(primaryVariant?.price),
        currency: primaryVariant?.price?.currencyCode || 'CHF'
      });
    }
  }, [product]);

  // Early return checks AFTER all hooks
  if (isLoading || !product || !isHydrated) {
    return (
      <div className="product-page-wrapper min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Produkt wird geladen...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-page-wrapper min-h-screen flex items-center justify-center">
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

  return (
    <div className="product-page-wrapper min-h-screen">
      {/* Scroll Progress Indicator */}
      <div 
        className="scroll-progress" 
        style={{ '--progress': `${scrollProgress}%` } as React.CSSProperties}
      />
      
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
      
      {/* Breadcrumb Navigation */}
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
            {/* Main Image with Premium Effects */}
            <div className="premium-image-container aspect-square bg-gray-50 rounded-lg">
              <div className="premium-glow active" />
              <div 
                className="premium-image-wrapper floating-product"
                style={{
                  transform: `
                    translateY(${premiumEffects.floatY}px) 
                    rotateY(${premiumEffects.floatRotation}deg)
                    scale(${premiumEffects.productScale})
                  `
                }}
              >
              <PremiumImage
                src={safeImageData.current?.url || safeImageData.primary?.url || ''}
                alt={safeImageData.current?.altText || safeProductData.title}
                className="w-full h-full object-cover"
                productTitle={safeProductData.title}
                productId={safeProductData.id ? safeProductData.id.replace('gid://shopify/Product/', '') : undefined}
                imageIndex={selectedImageIndex}
                context="detail"
              />
              <div 
                className="floating-shadow"
                style={{ 
                  opacity: premiumEffects.shadowIntensity,
                  transform: `translateX(-50%) scaleX(${1 + Math.abs(premiumEffects.floatY) / 30})`
                }}
              />
              </div>
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

            {/* Produktbeschreibung mit visuellem Design */}
            <div className="product-description-section">
              <h2 className="product-section-heading text-gray-900 mb-4">Produktbeschreibung</h2>
              
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
                <div className="space-y-6">
                  {optimizedContent.introText && (
                    <p className="product-text text-gray-700 leading-relaxed">
                      {optimizedContent.introText}
                    </p>
                  )}

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

          {/* Rechts: Product Info */}
          <div className="product-detail space-y-6">
            {/* Name & Preis - Außerhalb der Sticky Box */}
            <RevealWrapper animation="fade-left" className="space-y-4">
              <h1 className="text-3xl font-bold text-gray-900">{safeProductData.title}</h1>
              
              <ProductReviewStars 
                rating={0}
                reviewCount={0}
                size="md"
              />
              
              <div className="product-price-display">{safePricing.formatted}</div>
              <p className="product-price-info">inkl. MwSt. zzgl. Versandkosten</p>
            </RevealWrapper>

            {/* Versand & Service Info - Außerhalb der Sticky Box */}
            <RevealWrapper animation="fade-left" delay={0.1}>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3 hover-lift">
              <div className="flex items-center space-x-3 text-sm text-gray-700">
                <Truck className="h-5 w-5 text-green-600" />
                <span>Kostenloser Versand ab CHF 60</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-700">
                <Clock className="h-5 w-5 text-blue-600" />
                <span>30 Tage Rückgaberecht</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-700">
                <Shield className="h-5 w-5 text-purple-600" />
                <span>2 Jahre Garantie</span>
              </div>
              </div>
            </RevealWrapper>

            {/* CTA Section - Nur Varianten und Kaufbutton sticky */}
            <RevealWrapper animation="fade-up" delay={0.2}>
              <div className="product-cta-section">
              {/* Preis in der Sticky Box für Mobile */}
              {isMobile && (
                <div className="mb-4">
                  <div className="product-price-display">{safePricing.formatted}</div>
                </div>
              )}

              {/* Varianten-Auswahl mit visuellen Elementen */}
              {safeVariantData.hasMultiple && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Variante wählen</h3>
                  <div className="variant-selector">
                    {safeVariantData.all.map((variant: any, index: number) => {
                      const variantName = variant.selectedOptions?.map((option: any) => option.value).join(' / ') || variant.title;
                      const colorKey = getColorFromVariant(variantName);
                      
                      return (
                        <button
                          key={variant.id}
                          onClick={() => handleVariantChange(index)}
                          className={`variant-button hover-lift ${safeVariantData.current?.id === variant.id ? 'selected' : ''}`}
                        >
                          <div 
                            className={`variant-color-dot ${colorKey === 'wood' ? 'pattern' : ''}`}
                            data-color={colorKey}
                          />
                          <span className="variant-label">{variantName}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity & Add to Cart */}
              <div className="quantity-selector-wrapper">
                <div className="quantity-selector">
                  <span className="text-sm font-medium text-gray-900">Menge:</span>
                  <div className="quantity-controls">
                    <button
                      onClick={() => adjustQuantity(-1)}
                      className="quantity-button"
                      disabled={quantity <= 1}
                      aria-label="Menge verringern"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="quantity-display">{quantity}</span>
                    <button
                      onClick={() => adjustQuantity(1)}
                      className="quantity-button"
                      aria-label="Menge erhöhen"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleAddToCart}
                disabled={!safeVariantData.current?.availableForSale || isAddingToCart}
                className="add-to-cart-button premium-cta"
                aria-label={safeProductData.title ? `${safeProductData.title} in den Warenkorb legen` : 'Produkt in den Warenkorb legen'}
              >
                {isAddingToCart ? (
                  'Wird hinzugefügt...'
                ) : !safeVariantData.current?.availableForSale ? (
                  'Nicht verfügbar'
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" />
                    In den Warenkorb
                  </>
                )}
              </button>
              </div>
            </RevealWrapper>


            {/* Produktvorteile - Optimiert für bessere Lesbarkeit */}
            {optimizedContent.type === 'native' ? (
              optimizedContent.html.includes('Produktvorteile') && (
                <div className="product-benefits-container">
                  <h3>Produktvorteile</h3>
                  <div 
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: optimizedContent.html
                        .match(/<h[1-6][^>]*>.*?Produktvorteile.*?<\/h[1-6]>([\s\S]*?)(?=<h[1-6]|$)/gi)?.[0]
                        ?.replace(/<h[1-6][^>]*>.*?Produktvorteile.*?<\/h[1-6]>/gi, '') || ''
                    }}
                  />
                </div>
              )
            ) : (
              optimizedContent.benefits && optimizedContent.benefits.length > 0 && (
                <div className="product-benefits-container">
                  <h3>Produktvorteile</h3>
                  <div className="product-benefits-list">
                    {optimizedContent.benefits.map((benefit: string, index: number) => (
                      <div key={index} className="product-benefit-item">
                        <span className="product-benefit-bullet"></span>
                        <span className="product-benefit-text">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}

            {/* Technische Details als Info-Box */}
            {techDetails.length > 0 && (
              <div className="tech-details-box">
                <div className="tech-details-header">
                  <Settings className="h-5 w-5" />
                  <span>Technische Details</span>
                </div>
                <div className="tech-details-list">
                  {techDetails.map((detail, index) => (
                    <div key={index} className="tech-detail-item">
                      <div className="tech-detail-icon">
                        {getTechSpecIcon(detail.label)}
                      </div>
                      <div className="tech-detail-content">
                        <span className="tech-detail-label">{detail.label}</span>
                        <span className="tech-detail-value">{detail.value || detail.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Verwandte Produkte */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <RelatedProducts currentProduct={product!} />
      </div>
      
      {/* Mobile Sticky Add to Cart - Optional, kann aktiviert werden wenn gewünscht */}
      {isMobile && false && ( // Setze auf true um zu aktivieren
        <div className="mobile-sticky-cta">
          <div className="mobile-sticky-price">{safePricing.formatted}</div>
          <button 
            onClick={handleAddToCart}
            disabled={!safeVariantData.current?.availableForSale || isAddingToCart}
            className="add-to-cart-button"
          >
            {isAddingToCart ? (
              'Wird hinzugefügt...'
            ) : !safeVariantData.current?.availableForSale ? (
              'Nicht verfügbar'
            ) : (
              <>
                <ShoppingCart className="h-5 w-5" />
                In den Warenkorb
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default ProductDetail;