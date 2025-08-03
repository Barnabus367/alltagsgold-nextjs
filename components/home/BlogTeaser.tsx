import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, ArrowRight } from '@/lib/icons';
import { BlogPost } from '@/data/blog-types';

interface BlogTeaserProps {
  posts: BlogPost[];
}

export function BlogTeaser({ posts }: BlogTeaserProps) {
  // Get the 3 most recent posts
  const recentPosts = posts.slice(0, 3);
  
  if (recentPosts.length === 0) return null;
  
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-light mb-4 text-gray-900">
            Ratgeber & Inspiration
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Praktische Tipps und clevere Ideen für einen goldenen Alltag
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {recentPosts.map(post => (
            <Link 
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
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
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <Calendar className="w-4 h-4" />
                  {new Date(post.date).toLocaleDateString('de-CH', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                
                <h3 className="font-semibold text-lg mb-3 group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h3>
                
                <p className="text-gray-600 line-clamp-3 mb-4">
                  {post.excerpt}
                </p>
                
                <span className="text-primary font-medium group-hover:gap-3 flex items-center gap-2 transition-all">
                  Weiterlesen
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="text-center">
          <Link href="/blog">
            <button className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2">
              Alle Artikel entdecken
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}