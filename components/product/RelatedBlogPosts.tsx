import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, ArrowRight } from '@/lib/icons';
import { BlogPost } from '@/data/blog-types';

interface RelatedBlogPostsProps {
  productCategories: string[];
  allPosts: BlogPost[];
  maxPosts?: number;
}

export function RelatedBlogPosts({ productCategories, allPosts, maxPosts = 3 }: RelatedBlogPostsProps) {
  // Map product collections to blog categories
  const collectionToCategoryMap: Record<string, string[]> = {
    'kuchenhelfer-gadgets': ['Küche & Kochen', 'Ernährung & Gesundheit'],
    'haushaltsgerate': ['Haushalt & Reinigung', 'Organisation & Aufbewahrung'],
    'reinigungsgerate': ['Haushalt & Reinigung', 'Nachhaltigkeit & Umwelt'],
    'selfcare-beauty': ['Beauty & Wellness', 'Gesundheit & Wohlbefinden'],
    'wellness-entspannung': ['Lifestyle & Wellness', 'Gesundheit & Wohlbefinden'],
    'technik-gadgets': ['Technologie & Innovation', 'Trends & Innovation'],
    'led-produkte': ['Technologie & Innovation', 'Nachhaltigkeit & Umwelt'],
    'dekoration': ['Wohnen & Einrichten', 'Lifestyle & Trends'],
    'beleuchtung-lampen': ['Wohnen & Einrichten', 'Technologie & Innovation'],
    'aufbewahrung-organisation': ['Organisation & Aufbewahrung', 'Haushalt & Reinigung'],
    'bbq-grill': ['Outdoor & Garten', 'Küche & Kochen'],
  };

  // Get relevant blog categories based on product collections
  const relevantCategories = new Set<string>();
  productCategories.forEach(collection => {
    const categories = collectionToCategoryMap[collection] || [];
    categories.forEach(cat => relevantCategories.add(cat));
  });

  // Filter posts by relevant categories
  const relatedPosts = allPosts
    .filter(post => relevantCategories.has(post.category))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, maxPosts);

  if (relatedPosts.length === 0) return null;

  return (
    <section className="py-12 border-t">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Hilfreiche Artikel</h2>
          <Link 
            href="/blog"
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            Alle Artikel
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {relatedPosts.map(post => (
            <Link 
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="aspect-video relative overflow-hidden bg-gray-100">
                {post.featuredImage && (
                  <Image
                    src={post.featuredImage}
                    alt={post.featuredImageAlt || post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(post.date).toLocaleDateString('de-CH')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {post.readTime} Min
                  </span>
                </div>
                
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h3>
                
                <p className="text-gray-600 text-sm line-clamp-2">
                  {post.excerpt}
                </p>
                
                <div className="mt-4 text-primary text-sm font-medium group-hover:gap-3 flex items-center gap-2 transition-all">
                  Weiterlesen
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}