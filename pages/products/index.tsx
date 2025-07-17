import { GetStaticProps } from 'next';
import { Products } from '../ProductsList';
import { Layout } from '../../components/layout/Layout';
import { useState } from 'react';
import { ShopifyProduct } from '../../types/shopify';
import { getProducts } from '../../lib/shopify';

interface ProductsPageProps {
  products: ShopifyProduct[];
}

export default function ProductsPage({ products }: ProductsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Layout onSearch={setSearchQuery}>
      <Products preloadedProducts={products} />
    </Layout>
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