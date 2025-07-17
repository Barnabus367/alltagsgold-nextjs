import { GetStaticProps, GetStaticPaths } from 'next';
import { useRouter } from 'next/router';
import { CollectionDetail } from '../CollectionDetail';
import { Layout } from '../../components/layout/Layout';
import { useState } from 'react';
import { ShopifyCollection } from '../../types/shopify';
import { getAllCollectionHandles, getCollectionByHandle } from '../../lib/shopify';

interface CollectionDetailPageProps {
  collection: ShopifyCollection | null;
  handle: string;
}

export default function CollectionDetailPage({ collection, handle }: CollectionDetailPageProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // If the page is not yet generated, this will be displayed
  // until getStaticProps() finishes running
  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  return (
    <Layout onSearch={setSearchQuery}>
      <CollectionDetail preloadedCollection={collection} />
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const collectionHandles = await getAllCollectionHandles();
    
    // Generate paths for all collections
    const paths = collectionHandles.map((handle) => ({
      params: { handle },
    }));

    return {
      paths,
      fallback: 'blocking', // Enable ISR for new collections
    };
  } catch (error) {
    console.error('Error in getStaticPaths:', error);
    return {
      paths: [],
      fallback: 'blocking',
    };
  }
};

export const getStaticProps: GetStaticProps<CollectionDetailPageProps> = async ({ params }) => {
  const handle = params?.handle as string;

  if (!handle) {
    return {
      notFound: true,
    };
  }

  try {
    const collection = await getCollectionByHandle(handle);

    if (!collection) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        collection,
        handle,
      },
      revalidate: 60 * 60 * 12, // Revalidate every 12 hours (collections change moderately)
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return {
      notFound: true,
    };
  }
};