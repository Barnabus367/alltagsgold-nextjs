import Blog from '../BlogList';
import { Layout } from '../../components/layout/Layout';
import { SEOHead } from '../../components/seo/SEOHead';
import { useState } from 'react';
import { generateStaticPageSEO } from '../../lib/seo';

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Generate SEO metadata for blog page
  const seoData = generateStaticPageSEO('blog');

  return (
    <>
      <SEOHead seo={seoData} canonicalUrl="/blog" />
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