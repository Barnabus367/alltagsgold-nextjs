import { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, User, Tag, ArrowLeft, Share2 } from '@/lib/icons';
import { Button } from '@/components/ui/button';

interface BlogArticleProps {
  title: string;
  date: string;
  readTime: number;
  author: string;
  category: string;
  tags: string[];
  featuredImage: string;
  featuredImageAlt: string;
  children: ReactNode;
  excerpt?: string;
  updatedDate?: string;
}

export function BlogArticle({
  title,
  date,
  readTime,
  author,
  category,
  tags,
  featuredImage,
  featuredImageAlt,
  children,
  excerpt,
  updatedDate
}: BlogArticleProps) {
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title,
        text: excerpt,
        url: window.location.href,
      });
    }
  };
  
  return (
    <article className="min-h-screen bg-white">
      {/* Hero Section mit Bild */}
      <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden">
        <Image
          src={featuredImage}
          alt={featuredImageAlt}
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
              {new Date(date).toLocaleDateString('de-CH', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </span>
            
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {readTime} Min. Lesezeit
            </span>
            
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {author}
            </span>
            
            <span className="flex items-center gap-1">
              <Tag className="w-4 h-4" />
              {category}
            </span>
          </div>
          
          {/* Updated Date */}
          {updatedDate && (
            <div className="mb-6 p-3 bg-amber-50 rounded-lg text-sm text-amber-800">
              Aktualisiert am {new Date(updatedDate).toLocaleDateString('de-CH', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </div>
          )}
          
          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-6 leading-tight">
            {title}
          </h1>
          
          {/* Excerpt */}
          {excerpt && (
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {excerpt}
            </p>
          )}
          
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
            {children}
          </div>
          
          {/* Tags */}
          <div className="mt-12 pt-8 border-t">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Tags:</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
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
    </article>
  );
}