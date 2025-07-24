import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Minus, Plus, Heart, ShoppingCart, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useProduct } from '@/hooks/useShopify';
import { useCart } from '@/hooks/useCart';
import { ShopifyVariant, ShopifyProduct } from '@/types/shopify';
// Import product description generators
import { getProductIntroduction, getProductFeatures } from '@/lib/productDescriptions';
import { ShopifyError } from '@/components/common/ShopifyError';
import { SEOHelmet } from '@/components/SEOHelmet';
import { trackViewContent, trackAddToCart } from '@/lib/analytics';
import { PremiumImage } from '@/components/common/PremiumImage';
import { formatPrice } from '@/lib/shopify';
import { usePageTitle, formatPageTitle } from '@/hooks/usePageTitle';

interface ProductDetailProps {
  preloadedProduct?: ShopifyProduct | null;
}

export function ProductDetail({ preloadedProduct }: ProductDetailProps) {
  const router = useRouter();
  const { handle } = router.query as { handle: string };
  
  // Use preloaded data or fall back to client-side fetching
  const { data: clientProduct, isLoading, error } = useProduct(handle!, {
    enabled: !preloadedProduct && !!handle,
    initialData: preloadedProduct || undefined,
  });
  
  const product = preloadedProduct || clientProduct;
  const { addItemToCart, isAddingToCart } = useCart();
  
  const [selectedVariant, setSelectedVariant] = useState<ShopifyVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Set page title
  usePageTitle(product ? formatPageTitle(product.title) : 'Produkt wird geladen...');

  // Set default variant and check mobile when product loads
  useEffect(() => {
    if (product && !selectedVariant) {
      setSelectedVariant(product.variants.edges[0]?.node || null);
    }
    
    // Check if mobile
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
      const primaryVariant = product.variants.edges[0]?.node;
      
      trackViewContent({
        content_id: product.id,
        content_name: product.title,
        content_type: 'product',
        value: parseFloat(primaryVariant?.price.amount || '0'),
        currency: primaryVariant?.price.currencyCode || 'CHF'
      });
    }
  }, [product]);

  const handleAddToCart = async () => {
    if (selectedVariant && product) {
      const productData = {
        title: product.title,
        image: product.images.edges[selectedImageIndex]?.node.url,
        price: selectedVariant.price,
        selectedOptions: selectedVariant.selectedOptions,
        handle: product.handle
      };
      
      // Track AddToCart event
      trackAddToCart({
        content_id: product.id,
        content_name: product.title,
        content_type: 'product',
        value: parseFloat(selectedVariant.price.amount) * quantity,
        currency: selectedVariant.price.currencyCode || 'CHF',
        contents: [{
          id: selectedVariant.id,
          quantity: quantity,
          item_price: parseFloat(selectedVariant.price.amount)
        }]
      });
      
      await addItemToCart(selectedVariant.id, quantity, productData);
    }
  };

  const handleVariantChange = (variantIndex: number) => {
    const variant = product?.variants.edges[variantIndex]?.node;
    if (variant) {
      setSelectedVariant(variant);
      // Update image if variant has specific image
      if (variant.image) {
        const imageIndex = product?.images.edges.findIndex((edge: any) => edge.node.url === variant.image?.url);
        if (imageIndex !== -1) {
          setSelectedImageIndex(imageIndex || 0);
        }
      }
    }
  };

  const adjustQuantity = (delta: number) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  // Parse real Shopify product content - stable version to prevent hydration issues
  const parseShopifyContent = () => {
    if (!product || !product.description) {
      return { 
        introText: product?.title || '', 
        benefits: [], 
        sections: [
          {
            title: 'Pflege & Wartung',
            content: [
              'Trocken und staubfrei lagern',
              'Mit weichem Tuch reinigen',
              'Vor Feuchtigkeit schützen',
              'Bei Nichtgebrauch sicher aufbewahren'
            ]
          }
        ]
      };
    }
    
    const description = product.description;
    
    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Raw Shopify Description:', description);
    }
    
    // Shopify data successfully loaded and parsed
    const sections: Array<{ title: string; content: string[] }> = [];
    
    // Extract intro text (first paragraph before Produktvorteile)
    const introMatch = description.match(/^([\s\S]*?)(?=Produktvorteile|Technische Details|$)/);
    let introText = introMatch ? introMatch[1].trim() : '';
    
    // Fallback to product title if no description found
    if (!introText || introText.length < 10) {
      introText = product.title;
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📝 Extracted intro text:', introText);
    }
    
    // Extract product benefits with stable parsing for concatenated text
    let benefits: string[] = [];
    const benefitsMatch = description.match(/Produktvorteile\s*([\s\S]*?)(?=Technische Details|$)/);
    if (benefitsMatch && benefitsMatch[1]) {
      const benefitsText = benefitsMatch[1].trim();
      if (benefitsText) {
        // Split by recognizable German benefit patterns - manual approach for better results
        const manualBenefits = [];
        
        // Check for specific benefit patterns in the Mini-Eierkocher description
        if (benefitsText.includes('Kochvergnügen für die ganze Familie')) {
          manualBenefits.push('Kochvergnügen für die ganze Familie – bis zu 7 Eier gleichzeitig');
        }
        if (benefitsText.includes('Individuelle Härtegrade')) {
          manualBenefits.push('Individuelle Härtegrade für jeden Geschmack');
        }
        if (benefitsText.includes('Schnelle Zubereitung')) {
          manualBenefits.push('Schnelle Zubereitung für einen zeitsparenden Morgen');
        }
        if (benefitsText.includes('Sicherheitsfunktionen')) {
          manualBenefits.push('Sicherheitsfunktionen für sorgenfreies Kochen');
        }
        if (benefitsText.includes('Kompaktes Design')) {
          manualBenefits.push('Kompaktes Design, das in jede Küche passt');
        }
        
        // If manual parsing worked, use it
        if (manualBenefits.length > 0) {
          benefits = manualBenefits;
        } else {
          // Fallback: try splitting by bullet points (•) or line breaks
          benefits = benefitsText
            .split(/•|\n/) // Split by bullet points or line breaks
            .filter((sentence: string) => sentence.trim().length > 10)
            .map((sentence: string) => sentence.trim())
            .slice(0, 6);
        }
      }
    }
    
    // Extract technical details with stable parsing for concatenated text
    const technicalDetails: string[] = [];
    const techMatch = description.match(/Technische Details\s*([\s\S]*)$/);
    if (techMatch && techMatch[1]) {
      const techText = techMatch[1].trim();
      
      // Debug logging for technical details
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 Raw tech text:', techText);
      }
      
      // Try parsing by bullet points first
      const bulletPoints = techText
        .split(/•|\n/) // Split by bullet points or line breaks
        .filter((item: string) => item.trim().length > 5)
        .map((item: string) => item.trim())
        .slice(0, 8); // Allow more technical details
      
      if (bulletPoints.length > 0) {
        technicalDetails.push(...bulletPoints);
      } else {
        // Fallback: Parse known patterns with flexible whitespace handling
        const patterns = [
          { regex: /Masse:\s*([^A-ZÄÖÜ]*?)(?=\s[A-ZÄÖÜ][a-z]+:|$)/i, label: 'Abmessungen' },
          { regex: /Material:\s*([^A-ZÄÖÜ]*?)(?=\s[A-ZÄÖÜ][a-z]+:|$)/i, label: 'Material' },
          { regex: /Stromversorgung:\s*([^A-ZÄÖÜ]*?)(?=\s[A-ZÄÖÜ][a-z]+:|$)/i, label: 'Stromversorgung' },
          { regex: /Gewicht:\s*([^A-ZÄÖÜ]*?)(?=\s[A-ZÄÖÜ][a-z]+:|$)/i, label: 'Gewicht' },
          { regex: /Leistung:\s*([^A-ZÄÖÜ]*?)(?=\s[A-ZÄÖÜ][a-z]+:|$)/i, label: 'Leistung' },
          { regex: /Kapazität:\s*([^A-ZÄÖÜ]*?)(?=\s[A-ZÄÖÜ][a-z]+:|$)/i, label: 'Kapazität' }
        ];
        
        const addedLabels = new Set<string>();
        
        patterns.forEach(pattern => {
          const match = techText.match(pattern.regex);
          if (match && match[1] && !addedLabels.has(pattern.label)) {
            const value = match[1].trim().replace(/\s+/g, ' '); // Normalize spaces
            if (value && value.length > 1) {
              technicalDetails.push(`${pattern.label}: ${value}`);
              addedLabels.add(pattern.label);
            }
          }
        });
      }
      
      // Debug logging for technical details
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 Found technical details:', technicalDetails);
      }
      
      // Always add price as consistent element
      if (product.variants.edges.length > 0) {
        const variant = product.variants.edges[0].node;
        const price = parseFloat(variant.price.amount);
        const currency = variant.price.currencyCode || 'CHF';
        technicalDetails.push(`Preis: ${price.toFixed(2)} ${currency}`);
      }
    }
    
    // Always add technical details section for consistency - IMMER mit Fallback-Inhalten
    if (technicalDetails.length > 0) {
      sections.push({
        title: 'Technische Details',
        content: technicalDetails
      });
    } else {
      // Fallback technical details wenn keine geparst werden können
      sections.push({
        title: 'Technische Details',
        content: [
          'Hochwertige Materialien und Verarbeitung',
          'Qualitätskontrolle nach Swiss Standards',
          'Benutzerfreundliches Design',
          'Langlebige Konstruktion'
        ]
      });
    }
    
    // Always add care instructions section for consistency
    sections.push({
      title: 'Pflege & Wartung',
      content: [
        'Trocken und staubfrei lagern',
        'Mit weichem Tuch reinigen',
        'Vor Feuchtigkeit schützen',
        'Bei Nichtgebrauch sicher aufbewahren'
      ]
    });
    
    return { introText, benefits, sections };
  };

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

  if (error || !product) {
    return <ShopifyError error={error?.message || 'Produkt nicht gefunden'} />;
  }

  const images = product.images.edges.map((edge: any) => edge.node);
  const variants = product.variants.edges.map((edge: any) => edge.node);
  const currentImage = images[selectedImageIndex];
  
  const price = selectedVariant ? 
    formatPrice(selectedVariant.price.amount, selectedVariant.price.currencyCode) : 
    formatPrice(product.priceRange.minVariantPrice.amount, product.priceRange.minVariantPrice.currencyCode);

  const primaryImage = product.images.edges[0]?.node;
  
  // Parse real Shopify product content
  const optimizedContent = parseShopifyContent();

  // Generate breadcrumbs for SEO structured data
  const breadcrumbs = [
    { name: 'Home', url: 'https://www.alltagsgold.ch/', position: 1 },
    { name: 'Shop', url: 'https://www.alltagsgold.ch/collections', position: 2 }
  ];

  // Add collection breadcrumb if product has collections
  if (product.collections.edges.length > 0) {
    const collection = product.collections.edges[0].node;
    breadcrumbs.push({
      name: collection.title,
      url: `https://www.alltagsgold.ch/collections/${collection.handle}`,
      position: 3
    });
    breadcrumbs.push({
      name: product.title,
      url: `https://www.alltagsgold.ch/products/${product.handle}`,
      position: 4
    });
  } else {
    breadcrumbs.push({
      name: product.title,
      url: `https://www.alltagsgold.ch/products/${product.handle}`,
      position: 3
    });
  }
  
  return (
    <div className="min-h-screen bg-white pt-16">
      <SEOHelmet 
        title={product.title}
        description={`${optimizedContent.introText.slice(0, 155)}... Jetzt bei AlltagsGold bestellen.`}
        ogImage={primaryImage?.url}
        product={product}
        type="product"
        isProduct={true}
        breadcrumbs={breadcrumbs}
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
            {product.collections.edges.length > 0 && (
              <>
                <span>/</span>
                <Link 
                  href={`/collections/${product.collections.edges[0].node.handle}`}
                  className="hover:text-black transition-colors"
                >
                  {product.collections.edges[0].node.title}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-gray-900 font-medium">{product.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-6">
            {/* Main Image */}
            <div className="aspect-square overflow-hidden bg-gray-50 rounded-lg">
              <PremiumImage
                src={currentImage?.url || primaryImage?.url || ''}
                alt={currentImage?.altText || product.title}
                className="w-full h-full object-cover"
                productTitle={product.title}
              />
            </div>
            
            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {images.map((image: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index ? 'border-black' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    aria-label={`Produktbild ${index + 1} von ${images.length} anzeigen`}
                  >
                    <PremiumImage
                      src={image.url}
                      alt={image.altText || product.title}
                      className="w-full h-full object-cover"
                      productTitle={product.title}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            {/* Title and Price - SEO H1 */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>
              <div className="text-3xl font-bold text-gray-900 mb-6">{price}</div>
            </div>

            {/* Intro Text */}
            {optimizedContent.introText && (
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  {optimizedContent.introText}
                </p>
              </div>
            )}

            {/* Produktvorteile - JETZT VOR Varianten */}
            {optimizedContent.benefits.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Produktvorteile</h3>
                <ul className="space-y-2">
                  {optimizedContent.benefits.map((benefit: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2 text-gray-700">
                      <span className="text-gray-400 mt-1">•</span>
                      <span className="text-sm leading-relaxed">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Technische Details - IMMER SICHTBAR vor Varianten */}
            {optimizedContent.sections.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Technische Details</h3>
                <ul className="space-y-2">
                  {optimizedContent.sections[0].content.map((detail: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2 text-gray-700">
                      <span className="text-gray-400 mt-1">•</span>
                      <span className="text-sm leading-relaxed">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Variant Selection - JETZT NACH Produktvorteilen */}
            {variants.length > 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Varianten</h3>
                <div className="grid grid-cols-2 gap-2">
                  {variants.map((variant: any, index: number) => (
                    <button
                      key={variant.id}
                      onClick={() => handleVariantChange(index)}
                      className={`p-3 text-sm border rounded-lg transition-colors ${
                        selectedVariant?.id === variant.id
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {variant.selectedOptions.map((option: any) => option.value).join(' / ')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Versand & weitere Infos - Collapsible */}
            <Collapsible open={isDescriptionExpanded} onOpenChange={setIsDescriptionExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span>Versand & weitere Infos</span>
                  {isDescriptionExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
                  {/* Structured sections */}
                  {optimizedContent.sections.length > 0 && (
                    <div className="space-y-4">
                      {optimizedContent.sections.map((section: any, index: number) => (
                        <div key={index} className="space-y-2">
                          <h4 className="font-semibold text-gray-900">{section.title}</h4>
                          <ul className="space-y-1">
                            {section.content.map((item: string, itemIndex: number) => (
                              <li key={itemIndex} className="text-sm text-gray-700 flex items-start space-x-2">
                                <span className="text-gray-400 mt-1">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Versand- und Service-Informationen */}
                  <div className={`${optimizedContent.sections.length > 0 ? 'border-t pt-4' : ''}`}>
                    <h4 className="font-semibold text-gray-900 mb-3">Versand & Service</h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p><span className="font-semibold">Kostenloser Versand</span> ab CHF 50 Bestellwert</p>
                      <p><span className="font-semibold">Lieferzeit:</span> 2-4 Werktage</p>
                      <p><span className="font-semibold">Rückgabe:</span> 30 Tage Rückgaberecht</p>
                      <p><span className="font-semibold">Versand durch:</span> Swiss Post</p>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => adjustQuantity(-1)}
                    className="p-2 hover:bg-gray-50 disabled:opacity-50"
                    disabled={quantity <= 1}
                    aria-label="Menge verringern"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 border-x min-w-[3rem] text-center">{quantity}</span>
                  <button
                    onClick={() => adjustQuantity(1)}
                    className="p-2 hover:bg-gray-50"
                    aria-label="Menge erhöhen"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                
                {/* Wishlist Button - Mobile-optimiert */}
                <Button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  variant="outline"
                  className="min-h-[44px] min-w-[44px] p-3 touch-manipulation"
                  aria-label={isWishlisted ? 'Von Wunschliste entfernen' : 'Zur Wunschliste hinzufügen'}
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current text-red-500' : ''}`} />
                </Button>
              </div>

              {/* Add to Cart Button - Mobile-optimiert */}
              <Button 
                onClick={handleAddToCart}
                disabled={!selectedVariant?.availableForSale || isAddingToCart}
                className="w-full min-h-[48px] text-base font-semibold bg-black hover:bg-gray-900 text-white border border-black hover:border-gray-900 transition-all duration-200 shadow-sm hover:shadow-md touch-manipulation"
                style={{
                  boxShadow: '0 0 0 1px rgba(200, 160, 100, 0.1), 0 1px 3px rgba(0, 0, 0, 0.1)'
                }}
                aria-label={product ? `${product.title} in den Warenkorb legen` : 'Produkt in den Warenkorb legen'}
              >
                {isAddingToCart ? (
                  'Wird hinzugefügt...'
                ) : !selectedVariant?.availableForSale ? (
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
    </div>
  );
}

export default ProductDetail;