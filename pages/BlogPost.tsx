import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { useBlogPost, formatBlogDate, getReadingTime } from '@/hooks/useBlog';
import { usePageTitle } from '@/hooks/usePageTitle';
import { getCloudinaryUrl } from '@/lib/cloudinary';
import { trackPageView, trackViewContent } from '@/lib/analytics';
import { NextSEOHead } from '@/components/seo/NextSEOHead';
import { generateBlogSEO } from '@/lib/seo';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { useEffect } from 'react';

export default function BlogPost() {
  const router = useRouter();
  const { handle } = router.query as { handle: string };
  const { data: post, isLoading, error } = useBlogPost(handle || '');

  usePageTitle(post?.title || 'Blogpost');

  useEffect(() => {
    if (post) {
      trackPageView(`/blog/${post.handle}`, post.title);
      trackViewContent({
        content_id: post.id,
        content_name: post.title,
        content_type: 'article',
      });
    }
  }, [post]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32 mb-8"></div>
            <div className="h-12 bg-gray-200 rounded w-3/4 mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white">
        <NextSEOHead
          seo={{
            title: 'Blogpost nicht gefunden - AlltagsGold',
            description: 'Der gesuchte Blogpost konnte nicht gefunden werden.',
            keywords: 'Blog, AlltagsGold'
          }}
        />
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-light mb-6 text-gray-900">
              Blogpost nicht gefunden
            </h1>
            <p className="text-gray-600 mb-8">
              Der gesuchte Blogpost konnte nicht gefunden werden oder ist nicht mehr verfügbar.
            </p>
            <Link href="/blog">
              <button className="inline-flex items-center px-6 py-3 border border-black text-black hover:bg-black hover:text-white transition-colors duration-300">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zurück zum Blog
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || post.seo?.description || '',
    image: post.image ? getCloudinaryUrl(post.image.url) : undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Organization',
      name: 'AlltagsGold'
    },
    publisher: {
      '@type': 'Organization',
      name: 'AlltagsGold',
      logo: {
        '@type': 'ImageObject',
        url: 'https://alltagsgold.ch/logo.png'
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <NextSEOHead
        seo={generateBlogSEO(post)}
        canonicalUrl={`blog/${post.handle}`}
        structuredData={structuredData}
      />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <article className="max-w-4xl mx-auto px-6 py-12">
        {/* Back to Blog Link */}
        <div className="mb-8">
          <Link href="/blog">
            <button className="inline-flex items-center text-gray-600 hover:text-black transition-colors duration-300">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück zum Blog
            </button>
          </Link>
        </div>

        {/* Article Header */}
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-light mb-6 text-gray-900 leading-tight">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              <time dateTime={post.publishedAt}>
                {formatBlogDate(post.publishedAt)}
              </time>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              <span>{getReadingTime(post.content)} Min. Lesezeit</span>
            </div>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Featured Image */}
        {post.image && (
          <div className="mb-12">
            <div className="aspect-video overflow-hidden rounded-sm">
              <Image
                src={post.image.url}
                alt={post.image.altText || post.title}
                width={1200}
                height={675}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Article Content */}
        <div 
          className="prose prose-lg max-w-none prose-gray prose-headings:font-light prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-black prose-a:no-underline hover:prose-a:underline prose-img:rounded-sm prose-img:shadow-sm"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />

        {/* Article Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-200">
          <div className="text-center">
            <p className="text-gray-600 mb-6">
              Hat Ihnen dieser Artikel gefallen? Entdecken Sie mehr Inspiration in unserem Blog.
            </p>
            <Link href="/blog">
              <button className="inline-flex items-center px-6 py-3 border border-black text-black hover:bg-black hover:text-white transition-colors duration-300">
                Weitere Artikel lesen
              </button>
            </Link>
          </div>
        </footer>
      </article>
    </div>
  );
}