import Link from 'next/link';
import Image from 'next/image';
import { useBlogPosts, formatBlogDate, getReadingTime } from '@/hooks/useBlog';
import { usePageTitle } from '@/hooks/usePageTitle';
import { getCloudinaryUrl } from '@/lib/cloudinary';
import { trackPageView } from '@/lib/analytics';
import { SEOHelmet } from '@/components/SEOHelmet';
import { useEffect } from 'react';

export default function Blog() {
  const { data: posts, isLoading, error } = useBlogPosts();
  
  usePageTitle('Blog');

  useEffect(() => {
    trackPageView('/blog', 'AlltagsGold Blog');
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <SEOHelmet
          title="Blog - AlltagsGold"
          description="Entdecken Sie hilfreiche Tipps, Produktneuheiten und Lifestyle-Inspiration im AlltagsGold Blog."
          type="website"
        />
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="h-48 bg-gray-200 rounded"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <SEOHelmet
          title="Blog - AlltagsGold"
          description="Entdecken Sie hilfreiche Tipps, Produktneuheiten und Lifestyle-Inspiration im AlltagsGold Blog."
          canonicalUrl="/blog"
          type="website"
        />
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-light mb-4 text-gray-900">Blog</h1>
            <p className="text-gray-600">
              Die Blogposts können momentan nicht geladen werden. Bitte versuchen Sie es später erneut.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SEOHelmet
        title="Blog - AlltagsGold"
        description="Entdecken Sie hilfreiche Tipps, Produktneuheiten und Lifestyle-Inspiration im AlltagsGold Blog."
        canonicalUrl="/blog"
        type="website"
      />
      
      {/* Header Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-light mb-6 text-gray-900">
            Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Entdecken Sie hilfreiche Tipps, Produktneuheiten und Inspiration für einen besseren Alltag.
          </p>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          {!posts || posts.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-light mb-4 text-gray-900">
                Noch keine Blogposts verfügbar
              </h2>
              <p className="text-gray-600">
                Schauen Sie bald wieder vorbei für neue Inhalte und Inspiration.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article key={post.id} className="group">
                  <Link href={`/blog/${post.handle}`}>
                    <div className="bg-white rounded-sm shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                      {/* Featured Image */}
                      {post.image && (
                        <div className="aspect-video overflow-hidden">
                          <Image
                            src={post.image.url}
                            alt={post.image.altText || post.title}
                            width={800}
                            height={450}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        </div>
                      )}
                      
                      {/* Content */}
                      <div className="p-6">
                        <div className="flex items-center text-sm text-gray-500 mb-3">
                          <time dateTime={post.publishedAt}>
                            {formatBlogDate(post.publishedAt)}
                          </time>
                          <span className="mx-2">•</span>
                          <span>{getReadingTime(post.content)} Min. Lesezeit</span>
                        </div>
                        
                        <h2 className="text-xl font-medium mb-3 text-gray-900 group-hover:text-gray-700 transition-colors">
                          {post.title}
                        </h2>
                        
                        {post.excerpt && (
                          <p className="text-gray-600 line-clamp-3 leading-relaxed">
                            {post.excerpt}
                          </p>
                        )}
                        
                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            {post.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}