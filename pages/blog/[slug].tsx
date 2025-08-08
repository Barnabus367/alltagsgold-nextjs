import { GetStaticProps, GetStaticPaths } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ReactMarkdown from 'react-markdown';
import { Calendar, Clock, User, Tag, ArrowLeft, Share2 } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { NextSEOHead } from '@/components/seo/NextSEOHead';
import { generateBlogPostSEO } from '@/lib/seo';
import { generateBreadcrumbStructuredData } from '@/lib/structured-data';
import { getBlogPostBySlug, getAllBlogPosts } from '@/data/blog-posts';
import type { BlogPost } from '@/data/blog-types';
import { trackPageView } from '@/lib/analytics';
import { useEffect } from 'react';
import { RelatedProducts as BlogRelatedProducts } from '@/components/blog/RelatedProducts';
import { useProducts } from '@/hooks/useShopify';

interface BlogPostPageProps {
  post: BlogPost;
  relatedPosts: BlogPost[];
}

export default function BlogPostPage({ post, relatedPosts }: BlogPostPageProps) {
  const router = useRouter();
  const { data: productsData } = useProducts();
  const products = Array.isArray(productsData) ? productsData : [];

  useEffect(() => {
    if (post) {
      trackPageView(`/blog/${post.slug}`, post.title);
    }
  }, [post]);

  if (router.isFallback) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Artikel wird geladen...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-medium mb-4">Artikel nicht gefunden</h1>
            <Link href="/blog">
              <Button>Zurück zum Blog</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    }
  };

  // Generate Breadcrumb structured data
  const breadcrumbs = [
    { name: 'Home', url: 'https://www.alltagsgold.ch/' },
    { name: 'Blog', url: 'https://www.alltagsgold.ch/blog' },
    { name: post.title, url: `https://www.alltagsgold.ch/blog/${post.slug}` }
  ];
  const breadcrumbSchema = generateBreadcrumbStructuredData(breadcrumbs);

  return (
    <>
      <NextSEOHead 
        seo={generateBlogPostSEO(post)}
        canonicalUrl={`blog/${post.slug}`} // Statische Canonical für Blog
        structuredData={breadcrumbSchema}
        useRouterPath={false} // Keine dynamischen Parameter bei Blog-Posts
      />
      <Layout>
        <article className="min-h-screen bg-white">
          {/* Hero Section with Image */}
          <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden">
            <Image
              src={post.featuredImage}
              alt={post.featuredImageAlt}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            
            {/* Breadcrumb */}
            <div className="absolute top-6 left-6 z-10">
              <Link href="/blog" className="flex items-center gap-2 text-white/90 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Zurück zum Blog</span>
              </Link>
            </div>
          </div>
          
          {/* Content Container */}
          <div className="max-w-4xl mx-auto px-6 -mt-20 relative z-10">
            <div className="bg-white rounded-lg shadow-xl p-8 md:p-12">
              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(post.date).toLocaleDateString('de-CH', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
                
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {post.readTime} Min. Lesezeit
                </span>
                
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {post.author}
                </span>
                
                <span className="flex items-center gap-1">
                  <Tag className="w-4 h-4" />
                  {post.category}
                </span>
              </div>
              
              {/* Updated Date */}
              {post.updatedDate && (
                <div className="mb-6 p-3 bg-amber-50 rounded-lg text-sm text-amber-800">
                  Aktualisiert am {new Date(post.updatedDate).toLocaleDateString('de-CH', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
              )}
              
              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-6 leading-tight">
                {post.title}
              </h1>
              
              {/* Excerpt */}
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {post.excerpt}
              </p>
              
              {/* Share Button */}
              <div className="flex justify-end mb-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Artikel teilen
                </Button>
              </div>
              
              {/* Main Content */}
              <div className="prose prose-lg max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({children}) => <h1 className="text-3xl font-light text-gray-900 mb-6 mt-12">{children}</h1>,
                    h2: ({children}) => <h2 className="text-2xl font-light text-gray-900 mb-4 mt-10">{children}</h2>,
                    h3: ({children}) => <h3 className="text-xl font-medium text-gray-900 mb-3 mt-8">{children}</h3>,
                    p: ({children}) => <p className="text-gray-700 leading-relaxed mb-6">{children}</p>,
                    ul: ({children}) => <ul className="list-disc list-inside mb-6 space-y-2">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal list-inside mb-6 space-y-2">{children}</ol>,
                    li: ({children}) => <li className="text-gray-700">{children}</li>,
                    blockquote: ({children}) => (
                      <blockquote className="border-l-4 border-amber-400 pl-6 py-2 mb-6 italic text-gray-600">
                        {children}
                      </blockquote>
                    ),
                    code: ({inline, children}: any) => 
                      inline ? (
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">{children}</code>
                      ) : (
                        <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-6">
                          <code>{children}</code>
                        </pre>
                      ),
                    strong: ({children}: any) => <strong className="font-semibold text-gray-900">{children}</strong>,
                    em: ({children}: any) => <em className="italic">{children}</em>,
                    a: ({href, children}: any) => (
                      <Link href={href || '#'} className="text-amber-600 hover:text-amber-700 underline">
                        {children}
                      </Link>
                    ),
                    table: ({children}) => (
                      <div className="overflow-x-auto mb-6">
                        <table className="min-w-full divide-y divide-gray-200">{children}</table>
                      </div>
                    ),
                    thead: ({children}) => <thead className="bg-gray-50">{children}</thead>,
                    tbody: ({children}) => <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>,
                    tr: ({children}) => <tr>{children}</tr>,
                    th: ({children}) => (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {children}
                      </th>
                    ),
                    td: ({children}) => (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{children}</td>
                    ),
                  }}
                >
                  {post.content}
                </ReactMarkdown>
              </div>
              
              {/* Tags */}
              <div className="mt-12 pt-8 border-t">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Tags:</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/blog?tag=${encodeURIComponent(tag)}`}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
              
              {/* Related Products */}
              <BlogRelatedProducts 
                category={post.category}
                products={products}
                maxProducts={4}
              />
              
              {/* CTA Section */}
              <div className="mt-12 p-8 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg text-center">
                <h3 className="text-2xl font-light text-gray-900 mb-4">
                  Entdecken Sie passende Produkte
                </h3>
                <p className="text-gray-600 mb-6">
                  Finden Sie die im Artikel erwähnten Produkte in unserem Shop
                </p>
                <Link href="/collections">
                  <Button className="bg-black hover:bg-gray-800 text-white">
                    Zum Shop
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section className="max-w-7xl mx-auto px-6 py-16">
              <h2 className="text-3xl font-light text-gray-900 mb-8 text-center">
                Weitere interessante Artikel
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost) => (
                  <article key={relatedPost.id} className="group">
                    <Link href={`/blog/${relatedPost.slug}`}>
                      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                        <div className="aspect-video overflow-hidden bg-gray-100">
                          <Image
                            src={relatedPost.featuredImage}
                            alt={relatedPost.featuredImageAlt}
                            width={400}
                            height={225}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        </div>
                        <div className="p-6">
                          <h3 className="text-lg font-medium mb-2 text-gray-900 group-hover:text-amber-600 transition-colors line-clamp-2">
                            {relatedPost.title}
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {relatedPost.excerpt}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          )}
        </article>
      </Layout>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = getAllBlogPosts();
  console.log(`[Blog Build] Found ${posts.length} blog posts`);
  
  const paths = posts.map((post) => ({
    params: { slug: post.slug },
  }));
  
  // Log some slugs for debugging
  console.log('[Blog Build] First 5 slugs:', paths.slice(0, 5).map(p => p.params.slug));

  return {
    paths,
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps<BlogPostPageProps> = async ({ params }) => {
  const slug = params?.slug as string;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      notFound: true,
    };
  }

  // Get related posts from the same category
  const allPosts = getAllBlogPosts();
  const relatedPosts = allPosts
    .filter(p => p.id !== post.id && p.category === post.category)
    .slice(0, 3);

  return {
    props: {
      post,
      relatedPosts,
    },
  };
};