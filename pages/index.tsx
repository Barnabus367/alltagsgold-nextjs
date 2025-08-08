import { GetStaticProps } from 'next';
import { useState } from 'react';
import { Home } from './Home';
import { Layout } from '../components/layout/Layout';
import { NextSEOHead } from '../components/seo/NextSEOHead';
import { ShopifyProduct, ShopifyCollection } from '../types/shopify';
import { getProducts, getCollections } from '../lib/shopify';
import { generateStaticPageSEO } from '../lib/seo';
import { generateLocalBusinessStructuredData } from '../lib/structured-data';
import { getAllBlogPosts } from '../data/blog-posts';
import type { BlogPost } from '../data/blog-types';

interface HomePageProps {
  featuredProducts: ShopifyProduct[];
  collections: ShopifyCollection[];
  recentPosts: BlogPost[];
}

export default function HomePage({ featuredProducts, collections, recentPosts }: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Generate SEO metadata for homepage
  const seoData = generateStaticPageSEO('home');
  
  // Add LocalBusiness schema for better local SEO
  const localBusinessSchema = generateLocalBusinessStructuredData();

  return (
    <>
      <NextSEOHead 
        seo={seoData} 
        canonicalUrl="" 
        structuredData={localBusinessSchema}
        includeOrganization={true}
        includeWebSite={true}
      />
      <Layout onSearch={setSearchQuery}>
        <Home 
          searchQuery={searchQuery} 
          preloadedProducts={featuredProducts} 
          preloadedCollections={collections}
          recentPosts={recentPosts}
        />
      </Layout>
    </>
  );
}

export const getStaticProps: GetStaticProps<HomePageProps> = async () => {
  try {
    const [{ products }, collections] = await Promise.all([
      getProducts(12), // Featured products for homepage
      getCollections(10) // Collections für Homepage 
    ]);
    
    // Get recent blog posts
    const allPosts = getAllBlogPosts();
    const recentPosts = allPosts.slice(0, 3);

    return {
      props: {
        featuredProducts: products,
        collections,
        recentPosts,
      },
      revalidate: 60 * 60 * 4, // Revalidate every 4 hours (homepage changes frequently)
    };
  } catch (error) {
    console.error('Error in getStaticProps for homepage:', error);
    return {
      props: {
        featuredProducts: [],
        collections: [],
        recentPosts: [],
      },
      revalidate: 60, // Retry every minute on error
    };
  }
};