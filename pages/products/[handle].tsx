import { GetStaticProps, GetStaticPaths } from 'next';
import { useRouter } from 'next/router';
import { ProductDetail } from '../ProductDetail';
import { Layout } from '../../components/layout/Layout';
import { SEOHead } from '../../components/seo/SEOHead';
import { useState } from 'react';
import { ShopifyProduct } from '../../types/shopify';
import { getAllProductHandles, getProductByHandle } from '../../lib/shopify';
import { generateProductSEO } from '../../lib/seo';

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

  return (
    <>
      <SEOHead seo={seoData} canonicalUrl={`/products/${handle}`} />
      <Layout onSearch={setSearchQuery}>
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
      revalidate: 60 * 60, // Revalidate every 1 hour for faster content updates
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return {
      notFound: true,
    };
  }
};