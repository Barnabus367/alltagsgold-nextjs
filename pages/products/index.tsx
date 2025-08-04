import { GetStaticProps } from 'next';
import { Products } from '../ProductsList';
import { Layout } from '../../components/layout/Layout';
import { NextSEOHead } from '@/components/seo/NextSEOHead';
import { useState } from 'react';
import { ShopifyProduct } from '../../types/shopify'; 
import { getProductsOptimized } from '../../lib/shopify';
import { generateStaticPageSEO } from '../../lib/seo';

interface ProductsPageProps {
  products: ShopifyProduct[];
}

export default function ProductsPage({ products }: ProductsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      <NextSEOHead 
        seo={{
          title: 'Alle Produkte - Premium Lifestyle | AlltagsGold',
          description: 'Entdecken Sie innovative Produkte für den Alltag. Premium Qualität und schweizerische Standards für besondere Momente.',
          keywords: 'Produkte, Premium, Lifestyle, Schweiz, AlltagsGold'
        }}
        canonicalUrl="products" 
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
