import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ShopifyVariant, ShopifyProduct } from '@/types/shopify';
import { useProduct } from '@/hooks/useShopify';
import { useCart } from '@/hooks/useCart';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { NextSEOHead } from '@/components/seo/NextSEOHead';
import { generateProductSEO } from '@/lib/seo';
import { trackViewContent, trackAddToCart } from '@/lib/analytics';
import { formatPriceSafe, getPriceAmountSafe } from '@/lib/type-guards';
import { usePageTitle } from '@/hooks/usePageTitle';

// Import neue Premium-Komponenten
import { ProductHero } from './ProductHero';
import { ProductBenefits } from './ProductBenefits';
import { ProductStory } from './ProductStory';
import { ProductVariantSelector } from './ProductVariantSelector';
import { ProductTechnicalDetails } from './ProductTechnicalDetails';
import { ProductGuarantee } from './ProductGuarantee';
import { RelatedProducts } from './RelatedProducts';

// Content Processing Systems
import { getCachedNativeContent } from '@/lib/native-descriptions';
import { generateLegacyContent } from '@/lib/legacy-descriptions';
import { getFeatureFlag } from '@/lib/feature-flags';

interface ProductDetailPremiumProps {
  preloadedProduct?: ShopifyProduct | null;
}

export function ProductDetailPremium({ preloadedProduct }: ProductDetailPremiumProps) {
  const router = useRouter();
  const { handle } = router.query;
  const productQuery = useProduct(handle as string);
  const fetchedProduct = productQuery.data;
  const loading = productQuery.isLoading;
  const error = productQuery.error;
  const { addItemToCart, isAddingToCart } = useCart();
  
  const product = preloadedProduct || fetchedProduct;
  const [selectedVariant, setSelectedVariant] = useState<ShopifyVariant | null>(null);
  
  // Safe data extraction
  const safeProductData = useMemo(() => ({
    id: product?.id || '',
    title: product?.title || 'Produkt',
    handle: product?.handle || '',
    description: product?.description || '',
    productType: product?.productType,
    collections: product?.collections,
    tags: product?.tags || []
  }), [product]);
  
  const safeVariantData = useMemo(() => {
    const variants = product?.variants?.edges?.map((edge: any) => edge.node) || [];
    const current = selectedVariant || variants[0] || null;
    return { all: variants, current };
  }, [product, selectedVariant]);
  
  // Set initial variant
  useEffect(() => {
    if (safeVariantData.all.length > 0 && !selectedVariant) {
      setSelectedVariant(safeVariantData.all[0]);
    }
  }, [safeVariantData.all, selectedVariant]);
  
  // Track product view
  useEffect(() => {
    if (product && safeVariantData.current) {
      const eventData = {
        content_ids: [product.id],
        content_name: product.title,
        content_category: product.productType || 'uncategorized',
        value: getPriceAmountSafe(safeVariantData.current.price),
        currency: safeVariantData.current.price?.currencyCode || 'CHF'
      };
      trackViewContent(eventData);
    }
  }, [product, safeVariantData.current]);
  
  // SEO setup
  const seoData = useMemo(() => generateProductSEO(product), [product]);
  usePageTitle(product?.title || 'Produkt');
  
  // Handle add to cart
  const handleAddToCart = async () => {
    if (!safeVariantData.current || !product) return;
    
    const productData = {
      title: product.title,
      image: product.images.edges[0]?.node?.url,
      price: safeVariantData.current.price,
      selectedOptions: safeVariantData.current.selectedOptions || [],
      handle: product.handle
    };
    
    trackAddToCart({
      content_id: product.id,
      content_name: product.title,
      content_type: 'product',
      value: getPriceAmountSafe(safeVariantData.current.price),
      currency: safeVariantData.current.price?.currencyCode || 'CHF',
      contents: [{
        id: safeVariantData.current.id || '',
        quantity: 1,
        item_price: getPriceAmountSafe(safeVariantData.current.price)
      }]
    });
    
    await addItemToCart(safeVariantData.current.id || '', 1, productData);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Produkt nicht gefunden</h1>
          <Link href="/products" className="text-blue-600 hover:underline">
            Zurück zu allen Produkten
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <NextSEOHead 
        seo={seoData} 
        canonicalUrl={`/products/${product.handle}`}
      />
      <div className="min-h-screen bg-white">
      
      {/* Breadcrumbs */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs 
            items={[
              { name: 'Home', url: '/' },
              { name: 'Produkte', url: '/products' },
              ...(product.collections?.edges && product.collections.edges.length > 0
                ? [{
                    name: product.collections.edges[0].node.title,
                    url: `/collections/${product.collections.edges[0].node.handle}`
                  }]
                : []
              ),
              { name: product.title, url: `/products/${product.handle}` }
            ]}
          />
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <ProductHero
          product={product}
          selectedVariant={safeVariantData.current!}
          onAddToCart={handleAddToCart}
          isAddingToCart={isAddingToCart}
        />
        
        {/* Benefits Section */}
        <ProductBenefits product={product} />
        
        {/* Story Section */}
        <ProductStory product={product} />
        
        {/* Variant Selector */}
        <ProductVariantSelector
          product={product}
          variants={safeVariantData.all}
          selectedVariant={safeVariantData.current}
          onVariantChange={setSelectedVariant}
        />
        
        {/* Technical Details */}
        <ProductTechnicalDetails product={product} />
        
        {/* Guarantee Section */}
        <ProductGuarantee />
        
        {/* Related Products */}
        <RelatedProducts currentProduct={product} />
      </div>
    </div>
    </>
  );
}