import { GetStaticProps, GetStaticPaths } from 'next';
import { useRouter } from 'next/router';
import { CollectionDetail } from '../CollectionDetail';
import { Layout } from '../../components/layout/Layout';
import { NextSEOHead } from '../../components/seo/NextSEOHead';
import { useState, useEffect } from 'react';
import { ShopifyCollection } from '../../types/shopify';
import { getAllCollectionHandles, getCollectionByHandle } from '../../lib/shopify';
import { generateCollectionSEO } from '../../lib/seo';
import { generateBreadcrumbStructuredData } from '../../lib/structured-data';

interface CollectionDetailPageProps {
  collection: ShopifyCollection | null;
  handle: string;
}

export default function CollectionDetailPage({ collection, handle }: CollectionDetailPageProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Navigation Diagnostics - Collection Page Mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('🏷️ Collection Page Mount:', {
        handle,
        collection: collection?.title,
        timestamp: new Date().toISOString(),
        fromSSG: !!collection, // Preloaded data indicates SSG
        routerReady: router.isReady
      });
    }
  }, [handle, collection?.title, collection, router.isReady]);

  // Scroll reset when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }, []);

  // If the page is not yet generated, this will be displayed
  // until getStaticProps() finishes running
  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  // Generate SEO metadata
  const seoData = generateCollectionSEO(collection);
  
  // Generate Breadcrumb Schema für Collection
  const structuredData = [];
  
  if (collection) {
    const breadcrumbs = [
      { name: 'Home', url: '/' },
      { name: 'Kategorien', url: '/collections' },
      { name: collection.title, url: `/collections/${handle}` }
    ];
    structuredData.push(generateBreadcrumbStructuredData(breadcrumbs));
  }

  return (
    <>
      <NextSEOHead 
        seo={seoData} 
        canonicalUrl={`/collections/${handle}`}
        structuredData={structuredData}
        includeOrganization={true}
      />
      <Layout key={handle} onSearch={setSearchQuery}>
        <div data-page-type="collection" data-handle={handle} data-source={collection ? 'ssg' : 'client'}>
          <CollectionDetail preloadedCollection={collection} />
        </div>
      </Layout>
    </>
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