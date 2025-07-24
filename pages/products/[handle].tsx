import { GetStaticProps, GetStaticPaths } from 'next';
import { useRouter } from 'next/router';
import { ProductDetail } from '../ProductDetail';
import { Layout } from '../../components/layout/Layout';
import { NextSEOHead } from '../../components/seo/NextSEOHead';
import { useState } from 'react';
import { ShopifyProduct } from '../../types/shopify';
import { getAllProductHandles, getProductByHandle } from '../../lib/shopify';
import { generateProductSEO } from '../../lib/seo';
import { 
  generateProductStructuredData, 
  generateBreadcrumbStructuredData 
} from '../../lib/structured-data';

interface ProductDetailPageProps {
  product: ShopifyProduct | null;
  handle: string;
}

export default function ProductDetailPage({ product, handle }: ProductDetailPageProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

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
        <ProductDetail preloadedProduct={product} />
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

    console.log(`SSG: Generating ${paths.length} product pages statically`);

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