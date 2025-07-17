import { useRouter } from 'next/router';
import BlogPost from '../BlogPost';
import { Layout } from '../../components/layout/Layout';
import { SEOHead } from '../../components/seo/SEOHead';
import { useState } from 'react';
import { generateStaticPageSEO } from '../../lib/seo';

export default function BlogPostPage() {
  const router = useRouter();
  const { handle } = router.query;
  const [searchQuery, setSearchQuery] = useState('');

  // Generate SEO metadata for blog post
  const seoData = generateStaticPageSEO('blog', `Blog Post - ${handle}`, `Lesen Sie unseren aktuellen Blog-Artikel bei AlltagsGold. Nützliche Tipps und Inspiration für einen modernen Alltag.`);

  return (
    <>
      <SEOHead seo={seoData} canonicalUrl={`/blog/${handle}`} />
      <Layout onSearch={setSearchQuery}>
        <BlogPost />
      </Layout>
    </>
  );
}