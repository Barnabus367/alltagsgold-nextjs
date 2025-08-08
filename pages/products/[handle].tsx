import { GetStaticProps, GetStaticPaths } from 'next';
import { useRouter } from 'next/router';
import { ProductDetailPremium as ProductDetail } from '../../components/product/ProductDetailPremium';
import { Layout } from '../../components/layout/Layout';
import { NextSEOHead } from '../../components/seo/NextSEOHead';
import { useState, useEffect } from 'react';
import { ShopifyProduct } from '../../types/shopify';
import { getAllProductHandles, getProductByHandle } from '../../lib/shopify';
import { generateProductSEO } from '../../lib/seo';
import { 
  generateProductStructuredData, 
  generateBreadcrumbStructuredData 
} from '../../lib/structured-data';
import { SSRSafe } from '../../hooks/useHydrationSafe';

interface ProductDetailPageProps {
  product: ShopifyProduct | null;
  handle: string;
  seoContent: {
    ourOpinion?: string;
    useCases?: Array<{
      title: string;
      description: string;
    }>;
    faqs?: Array<{
      question: string;
      answer: string;
    }>;
  } | null;
}

export default function ProductDetailPage({ product, handle, seoContent }: ProductDetailPageProps) {
  const router = useRouter();
  const [_searchQuery, setSearchQuery] = useState('');

  // Navigation Diagnostics - nur in Production
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      // Logging nur in Production für Debugging
      // console.log deaktiviert für Development
    }
  }, [handle, product, router.isReady]);

  // If the page is not yet generated, this will be displayed
  // until getStaticProps() finishes running
  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  // Generate SEO metadata
  const seoData = generateProductSEO(product);
  
  // Generate Rich Snippets für Produkt
  const structuredData = [];
  
  if (product) {
    // Product Schema
    structuredData.push(generateProductStructuredData(product));
    
    // Breadcrumb Schema
    const breadcrumbs = [
      { name: 'Home', url: '/' },
      { name: 'Produkte', url: '/products' },
      { name: product.title, url: `/products/${handle}` }
    ];
    structuredData.push(generateBreadcrumbStructuredData(breadcrumbs));
  }

  return (
    <>
      <NextSEOHead 
        seo={seoData} 
        canonicalUrl={`/products/${handle}`} // Statische Canonical ohne Varianten
        structuredData={structuredData}
        includeOrganization={false} // Nicht bei Produkten, da wir Product Schema haben
        useRouterPath={false} // Explizite Canonical verwenden, ignoriert ?variant=
      />
      <Layout key={handle} onSearch={setSearchQuery}>
        <SSRSafe>
          <div data-page-type="product" data-handle={handle} data-source={product ? 'ssg' : 'client'}>
            <ProductDetail preloadedProduct={product} seoContent={seoContent || undefined} />
          </div>
        </SSRSafe>
      </Layout>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const productHandles = await getAllProductHandles();
    
    // Validiere jeden Handle, um sicherzustellen dass das Produkt existiert
    const validPaths = [];
    const invalidHandles = [];
    
    // Prüfe Produkte parallel für bessere Performance (in Batches von 10)
    const batchSize = 10;
    for (let i = 0; i < productHandles.length; i += batchSize) {
      const batch = productHandles.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(
        batch.map(async (handle) => {
          const product = await getProductByHandle(handle);
          return { handle, product };
        })
      );
      
      for (const result of batchResults) {
        if (result.status === 'fulfilled' && result.value.product) {
          const { handle, product } = result.value;
          if (product.id && product.title && product.images?.edges?.length > 0) {
            validPaths.push({ params: { handle } });
          } else {
            invalidHandles.push(handle);
            console.warn(`⚠️ Überspringe Produkt ohne vollständige Daten: ${handle}`);
          }
        } else if (result.status === 'rejected' || !result.value?.product) {
          const handle = result.status === 'fulfilled' ? result.value.handle : 'unknown';
          invalidHandles.push(handle);
          console.warn(`⚠️ Fehler beim Validieren von Produkt: ${handle}`);
        }
      }
    }
    
    console.log(`✅ SSG Build Report: ${validPaths.length} valide Produkte, ${invalidHandles.length} übersprungen`);
    
    if (invalidHandles.length > 0) {
      console.log(`📋 Übersprungene Handles: ${invalidHandles.slice(0, 5).join(', ')}${invalidHandles.length > 5 ? '...' : ''}`);
    }

    // Generate all valid products at build time, only fallback for new products
    return {
      paths: validPaths,
      fallback: 'blocking', // Only for new products added after build
    };
  } catch (error) {
    console.error('❌ Kritischer Fehler beim Abrufen der Produkte:', error);
    return {
      paths: [],
      fallback: 'blocking',
    };
  }
};

export const getStaticProps: GetStaticProps<ProductDetailPageProps> = async ({ params }) => {
  const handle = params?.handle as string;

  if (!handle) {
    return {
      notFound: true,
    };
  }

  try {
    const product = await getProductByHandle(handle);

    if (!product) {
      return {
        notFound: true,
      };
    }

    // Load SEO content from JSON file
    let seoContent = undefined;
    try {
      const seoData = await import('../../data/product-seo-content.json');
      const seoDataTyped = seoData.default as Record<string, any>;
      if (seoDataTyped && seoDataTyped[handle]) {
        seoContent = seoDataTyped[handle];
      }
    } catch (seoError) {
      // SEO content is optional, continue without it
      console.log(`No SEO content found for ${handle}`);
    }

    return {
      props: {
        product,
        handle,
        seoContent: seoContent || null,
      },
      revalidate: 60 * 60 * 24, // Revalidate every 24 hours (products change less frequently)
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return {
      notFound: true,
    };
  }
};