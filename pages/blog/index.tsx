import Blog from '../BlogList';
import { Layout } from '../../components/layout/Layout';
import { NextSEOHead } from '@/components/seo/NextSEOHead';
import { generateBlogListSEO } from '@/lib/seo';
import { useState } from 'react';

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      <NextSEOHead 
        seo={generateBlogListSEO()}
        canonicalUrl="blog" 
      />
      <Layout onSearch={setSearchQuery}>
        <Blog />
      </Layout>
    </>
  );
}

// Static props for SEO and static generation
export async function getStaticProps() {
  return {
    props: {},
    revalidate: 3600, // Revalidate every hour for blog content
  };
}