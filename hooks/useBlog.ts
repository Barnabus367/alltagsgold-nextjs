import { useQuery } from '@tanstack/react-query';
import { getBlogPosts, getBlogPostByHandle, getBlogs } from '@/lib/shopify';
import { ShopifyBlogPost, ShopifyBlog } from '@/types/shopify';

export function useBlogPosts(first: number = 50) {
  return useQuery<ShopifyBlogPost[], Error>({
    queryKey: ['blog-posts', first],
    queryFn: () => getBlogPosts(first),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useBlogPost(handle: string) {
  return useQuery<ShopifyBlogPost | null, Error>({
    queryKey: ['blog-post', handle],
    queryFn: () => getBlogPostByHandle(handle),
    enabled: !!handle,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useBlogs() {
  return useQuery<ShopifyBlog[], Error>({
    queryKey: ['blogs'],
    queryFn: () => getBlogs(),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function formatBlogDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('de-CH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function getReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}