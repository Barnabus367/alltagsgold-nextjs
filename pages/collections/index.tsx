import { GetStaticProps } from 'next';
import { Collections } from '../../components/collections/CollectionsList';
import { Layout } from '../../components/layout/Layout';
import { useState } from 'react';
import { ShopifyCollection } from '../../types/shopify';
import { getCollections } from '../../lib/shopify';

interface CollectionsPageProps {
  collections: ShopifyCollection[];
}

export default function CollectionsPage({ collections }: CollectionsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Layout onSearch={setSearchQuery}>
      <Collections preloadedCollections={collections} />
    </Layout>
  );
}

export const getStaticProps: GetStaticProps<CollectionsPageProps> = async () => {
  try {
    const collections = await getCollections(50);

    return {
      props: {
        collections,
      },
      revalidate: 60 * 60 * 12, // Revalidate every 12 hours (collection list changes rarely)
    };
  } catch (error) {
    console.error('Error in getStaticProps for collections:', error);
    return {
      props: {
        collections: [],
      },
      revalidate: 60, // Retry every minute on error
    };
  }
};