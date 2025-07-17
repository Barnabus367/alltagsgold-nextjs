import { GetStaticProps } from 'next';
import { useState } from 'react';
import { Home } from './Home';
import { Layout } from '../components/layout/Layout';
import { ShopifyProduct, ShopifyCollection } from '../types/shopify';
import { getProducts, getCollections } from '../lib/shopify';

interface HomePageProps {
  featuredProducts: ShopifyProduct[];
  collections: ShopifyCollection[];
}

export default function HomePage({ featuredProducts, collections }: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Layout onSearch={setSearchQuery}>
      <Home searchQuery={searchQuery} preloadedProducts={featuredProducts} preloadedCollections={collections} />
    </Layout>
  );
}

export const getStaticProps: GetStaticProps<HomePageProps> = async () => {
  try {
    const [{ products }, collections] = await Promise.all([
      getProducts(12), // Featured products for homepage
      getCollections(10) // Collections for homepage
    ]);

    return {
      props: {
        featuredProducts: products,
        collections,
      },
      revalidate: 60 * 60 * 4, // Revalidate every 4 hours (homepage changes frequently)
    };
  } catch (error) {
    console.error('Error in getStaticProps for homepage:', error);
    return {
      props: {
        featuredProducts: [],
        collections: [],
      },
      revalidate: 60, // Retry every minute on error
    };
  }
};