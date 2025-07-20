import { GetStaticProps } from 'next';
import { Products } from '../ProductsList';
import { Layout } from '../../components/layout/Layout';
import { SEOHead } from '../../components/seo/SEOHead';
import { useState } from 'react';
import { ShopifyProduct } from '../../types/shopify'; 
import { getProducts } from '../../lib/shopify';
import { generateStaticPageSEO } from '../../lib/seo';

interface ProductsPageProps {
  products: ShopifyProduct[];
}

export default function ProductsPage({ products }: ProductsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Generate SEO metadata for products page
  const seoData = generateStaticPageSEO('products');

  return (
    <>
      <SEOHead seo={seoData} canonicalUrl="/products" />
      <Layout onSearch={setSearchQuery}>
        <Products preloadedProducts={products} />
      </Layout>
    </>
  );
}

export const getStaticProps: GetStaticProps<ProductsPageProps> = async () => {
  try {
    const { products } = await getProducts(250);

    return {
      props: {
        products,
      },
      revalidate: 60 * 60 * 6, // Revalidate every 6 hours (product list changes moderately)
    };
  } catch (error) {
    console.error('Error in getStaticProps for products:', error);
    return {
      props: {
        products: [],
      },
      revalidate: 60, // Retry every minute on error
    };
  }
};
