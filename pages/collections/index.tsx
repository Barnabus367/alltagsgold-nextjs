import { GetStaticProps } from 'next';
import { Collections } from '../../components/collections/CollectionsList';
import { Layout } from '../../components/layout/Layout';
import { NextSEOHead } from '@/components/seo/NextSEOHead';
import { useState } from 'react';
import { ShopifyCollection } from '../../types/shopify';
import { getCollections } from '../../lib/shopify';
import { generateStaticPageSEO } from '../../lib/seo';

interface CollectionsPageProps {
  collections: ShopifyCollection[];
}

export default function CollectionsPage({ collections }: CollectionsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Generate SEO metadata for collections page
  const seoData = generateStaticPageSEO('collections');

  return (
    <>
      <NextSEOHead 
        seo={{
          title: 'Kollektionen - Premium Produktkategorien | AlltagsGold',
          description: 'Entdecken Sie unsere kuratierten Produktkategorien: Küche, Lifestyle, Design und mehr.',
          keywords: 'Kollektionen, Kategorien, Premium, AlltagsGold'
        }}
        canonicalUrl="collections" 
      />
      <Layout onSearch={setSearchQuery}>
        <Collections preloadedCollections={collections} />
      </Layout>
    </>
  );
}

export const getStaticProps: GetStaticProps<CollectionsPageProps> = async () => {
  try {
    // Lade Collections aus der lokalen Cache-Datei (garantiert aktuell und vollständig)
    const collectionsData = await import('../../data/collections-cache.json');
    const cacheCollections = collectionsData.default;
    
    // Konvertiere zu ShopifyCollection Format
    const collections: ShopifyCollection[] = cacheCollections.map((col: any) => ({
      id: col.id,
      title: col.title,
      description: col.description,
      descriptionHtml: `<p>${col.description}</p>`,
      handle: col.handle,
      image: col.image ? {
        url: col.image.url,
        altText: col.image.altText || col.title,
        width: 800,
        height: 600
      } : undefined,
      seo: col.seo,
      updatedAt: col.updatedAt || '2024-01-01T00:00:00Z', // Fixed date to avoid hydration mismatch
      products: { edges: [] } // Leer, da wir nur Collection-Info brauchen
    }));


    return {
      props: {
        collections,
      },
      revalidate: 60 * 60 * 12, // Revalidate every 12 hours (collection list changes rarely)
    };
  } catch (error) {
    console.error('Error loading collections from cache:', error);
    
    // Fallback: Versuche Shopify API
    try {
      const collections = await getCollections(20);
      return {
        props: {
          collections,
        },
        revalidate: 60,
      };
    } catch (apiError) {
      console.error('Error in getStaticProps for collections:', apiError);
      return {
        props: {
          collections: [],
        },
        revalidate: 60,
      };
    }
  }
};