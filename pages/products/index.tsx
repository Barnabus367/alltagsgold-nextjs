import { GetStaticProps } from 'next';
import Products from '@/components/pages/ProductsList';
import { Layout } from '../../components/layout/Layout';
import { NextSEOHead } from '@/components/seo/NextSEOHead';
import { SITE_URL } from '@/lib/canonical';
import { useState } from 'react';
import { ShopifyProduct } from '../../types/shopify'; 
import { getProductsOptimized } from '../../lib/shopify';
import { generateStaticPageSEO } from '../../lib/seo';

interface ProductsPageProps {
  products: ShopifyProduct[];
}

export default function ProductsPage({ products }: ProductsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const seoData = generateStaticPageSEO('products');
  const itemListStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@id': `${SITE_URL}/products/${p.handle}`,
        name: p.title
      },
    })),
  } as const;

  return (
    <>
      <NextSEOHead 
        seo={seoData}
        canonicalUrl="/products"
        structuredData={itemListStructuredData}
      />
      <Layout onSearch={setSearchQuery}>
        <Products preloadedProducts={products} />
      </Layout>
    </>
  );
}

export const getStaticProps: GetStaticProps<ProductsPageProps> = async () => {
  try {
    const { products } = await getProductsOptimized(250);

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
