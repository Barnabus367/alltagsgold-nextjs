import { GetStaticProps, GetStaticPaths } from 'next';
import { useRouter } from 'next/router';
import CollectionDetail from '../../components/pages/CollectionDetail';
import { Layout } from '../../components/layout/Layout';
import { NextSEOHead } from '../../components/seo/NextSEOHead';
import { useState, useEffect } from 'react';
import { devLog } from '../../lib/dev-utils';
import { ShopifyCollection } from '../../types/shopify';
import { getAllCollectionHandles, getCollectionByHandle } from '../../lib/shopify';
import { generateCollectionSEO } from '../../lib/seo';
import { generateBreadcrumbStructuredData, generateCollectionStructuredData, generateFAQStructuredData } from '../../lib/structured-data';

interface CollectionDetailPageProps {
  collection: ShopifyCollection | null;
  handle: string;
  seoContent: {
    metaTitle?: string;
    metaDescription?: string;
    faqs?: Array<{
      question: string;
      answer: string;
    }>;
  } | null;
}

export default function CollectionDetailPage({ collection, handle, seoContent }: CollectionDetailPageProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Navigation Diagnostics - Collection Page Mount (nur in Dev)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      devLog('🏷️ Collection Page Mount:', {
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

  // Generate SEO metadata with enhanced content
  let seoData = generateCollectionSEO(collection);
  
  // Override with custom SEO content if available
  if (seoContent) {
    if (seoContent.metaTitle) {
      seoData.title = `${seoContent.metaTitle} | Alltagsgold Schweiz`;
    }
    if (seoContent.metaDescription) {
      seoData.description = seoContent.metaDescription;
    }
  }
  
  // Generate structured data für Collection
  const structuredData = [];
  
  if (collection) {
    // Breadcrumb Schema
    const breadcrumbs = [
      { name: 'Home', url: '/' },
      { name: 'Kategorien', url: '/collections' },
      { name: collection.title, url: `/collections/${handle}` }
    ];
    structuredData.push(generateBreadcrumbStructuredData(breadcrumbs));
    
    // Collection Schema with ItemList
    structuredData.push(generateCollectionStructuredData(collection));
    
    // FAQ Schema - NEU: Füge FAQ Rich Snippets hinzu wenn SEO Content vorhanden
    if (seoContent?.faqs && seoContent.faqs.length > 0) {
      const faqSchema = generateFAQStructuredData(seoContent.faqs);
      if (faqSchema) {
        structuredData.push(faqSchema);
      }
    }
  }

  return (
    <>
      <NextSEOHead 
        seo={seoData} 
        structuredData={structuredData}
        includeOrganization={true}
        useRouterPath={true}
      />
      <Layout onSearch={setSearchQuery}>
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
      fallback: 'blocking', // Neue Collections werden on-demand generiert
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

    // Load SEO content from JSON file
    let seoContent = undefined;
    try {
      const seoData = await import('../../data/collection-seo-content.json');
      const seoDataTyped = seoData.default as Record<string, any>;
      if (seoDataTyped && seoDataTyped[handle]) {
        seoContent = seoDataTyped[handle];
      }
    } catch (seoError) {
      // SEO content is optional, continue without it
      console.log(`No SEO content found for collection ${handle}`);
    }

    return {
      props: {
        collection,
        handle,
        seoContent: seoContent || null,
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