import { GetStaticProps, GetStaticPaths } from 'next';
import { useRouter } from 'next/router';
// import { ProductDetail } from '../ProductDetail';
// import { ProductDetail } from '../../components/product/ProductDetailEnhanced';
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
}

export default function ProductDetailPage({ product, handle }: ProductDetailPageProps) {
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
        canonicalUrl={`/products/${handle}`}
        structuredData={structuredData}
        includeOrganization={false} // Nicht bei Produkten, da wir Product Schema haben
      />
      <Layout key={handle} onSearch={setSearchQuery}>
        <SSRSafe>
          <div data-page-type="product" data-handle={handle} data-source={product ? 'ssg' : 'client'}>
            <ProductDetail preloadedProduct={product} />
          </div>
        </SSRSafe>
      </Layout>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const productHandles = await getAllProductHandles();
    
    // Generate paths for ALL products (E-Commerce Best Practice)
    const paths = productHandles.map((handle) => ({
      params: { handle },
    }));

    // SSG: Generating product pages statically

    // Generate all products at build time, only fallback for new products
    return {
      paths,
      fallback: 'blocking', // Only for new products added after build
    };
  } catch (error) {
    console.error('Error in getStaticPaths:', error);
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

    return {
      props: {
        product,
        handle,
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