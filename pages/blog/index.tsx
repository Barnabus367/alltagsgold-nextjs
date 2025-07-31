import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, Tag, Search, ChevronRight } from 'lucide-react';
import { getAllBlogPosts, getAllCategories, getAllTags } from '@/data/blog-posts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Layout } from '@/components/layout/Layout';
import { trackPageView } from '@/lib/analytics';
import { NextSEOHead } from '@/components/seo/NextSEOHead';
import { generateBlogListSEO } from '@/lib/seo';
import type { BlogPost } from '@/data/blog-posts';

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 9;

  const categories = getAllCategories();
  const tags = getAllTags();

  useEffect(() => {
    trackPageView('/blog', 'AlltagsGold Blog');
    const allPosts = getAllBlogPosts();
    setPosts(allPosts);
    setFilteredPosts(allPosts);
  }, []);

  useEffect(() => {
    let filtered = posts;

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    // Filter by tag
    if (selectedTag) {
      filtered = filtered.filter(post => post.tags.includes(selectedTag));
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPosts(filtered);
    setCurrentPage(1);
  }, [posts, selectedCategory, selectedTag, searchQuery]);

  // Pagination
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <>
      <NextSEOHead
        seo={generateBlogListSEO()}
        canonicalUrl="blog"
      />
      <Layout onSearch={setSearchQuery}>
        <div className="min-h-screen bg-gray-50">
          {/* Hero Section */}
          <section className="bg-gradient-to-br from-amber-50 to-orange-50 py-20">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center">
                <h1 className="text-5xl md:text-6xl font-light mb-6 text-gray-900">
                  AlltagsGold Blog
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
                  Entdecken Sie praktische Tipps, innovative Haushaltshelfer und inspirierende Ideen für einen goldenen Alltag.
                </p>
                
                {/* Search Bar */}
                <div className="max-w-md mx-auto relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="search"
                    placeholder="Artikel durchsuchen..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-3 w-full rounded-full border-gray-200 focus:border-amber-400 focus:ring-amber-400"
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex flex-col lg:flex-row gap-12">
              {/* Sidebar */}
              <aside className="lg:w-1/4">
                <div className="sticky top-24 space-y-8">
                  {/* Categories */}
                  <div>
                    <h3 className="text-lg font-medium mb-4 text-gray-900">Kategorien</h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => setSelectedCategory('')}
                        className={`block w-full text-left px-3 py-2 rounded transition-colors ${
                          !selectedCategory ? 'bg-amber-100 text-amber-900' : 'hover:bg-gray-100'
                        }`}
                      >
                        Alle Kategorien ({posts.length})
                      </button>
                      {categories.map((category) => {
                        const count = posts.filter(p => p.category === category).length;
                        return (
                          <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`block w-full text-left px-3 py-2 rounded transition-colors ${
                              selectedCategory === category ? 'bg-amber-100 text-amber-900' : 'hover:bg-gray-100'
                            }`}
                          >
                            {category} ({count})
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Popular Tags */}
                  <div>
                    <h3 className="text-lg font-medium mb-4 text-gray-900">Beliebte Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {tags.slice(0, 15).map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                          className={`px-3 py-1 text-sm rounded-full transition-colors ${
                            selectedTag === tag
                              ? 'bg-amber-500 text-white'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Newsletter CTA */}
                  <div className="bg-gradient-to-br from-amber-100 to-orange-100 p-6 rounded-lg">
                    <h3 className="text-lg font-medium mb-2 text-gray-900">Newsletter</h3>
                    <p className="text-sm text-gray-700 mb-4">
                      Erhalten Sie wöchentlich die besten Tipps direkt in Ihr Postfach.
                    </p>
                    <Button className="w-full bg-black hover:bg-gray-800 text-white">
                      Jetzt abonnieren
                    </Button>
                  </div>
                </div>
              </aside>

              {/* Main Content */}
              <main className="lg:w-3/4">
                {/* Active Filters */}
                {(selectedCategory || selectedTag || searchQuery) && (
                  <div className="mb-6 flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-gray-600">Aktive Filter:</span>
                    {selectedCategory && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-sm">
                        {selectedCategory}
                        <button
                          onClick={() => setSelectedCategory('')}
                          className="ml-1 hover:text-amber-700"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {selectedTag && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-sm">
                        #{selectedTag}
                        <button
                          onClick={() => setSelectedTag('')}
                          className="ml-1 hover:text-amber-700"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {searchQuery && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-sm">
                        "{searchQuery}"
                        <button
                          onClick={() => setSearchQuery('')}
                          className="ml-1 hover:text-amber-700"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    <button
                      onClick={() => {
                        setSelectedCategory('');
                        setSelectedTag('');
                        setSearchQuery('');
                      }}
                      className="text-sm text-amber-600 hover:text-amber-700 underline"
                    >
                      Alle Filter zurücksetzen
                    </button>
                  </div>
                )}

                {/* Results Count */}
                <p className="text-sm text-gray-600 mb-6">
                  {filteredPosts.length} {filteredPosts.length === 1 ? 'Artikel' : 'Artikel'} gefunden
                </p>

                {/* Blog Posts Grid */}
                {currentPosts.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600">
                      Keine Artikel gefunden. Versuchen Sie andere Suchbegriffe oder Filter.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {currentPosts.map((post) => (
                      <article key={post.id} className="group">
                        <Link href={`/blog/${post.slug}`}>
                          <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden h-full">
                            {/* Featured Image */}
                            <div className="aspect-video overflow-hidden bg-gray-100">
                              <Image
                                src={post.featuredImage}
                                alt={post.featuredImageAlt}
                                width={800}
                                height={450}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                              />
                            </div>

                            {/* Content */}
                            <div className="p-6">
                              {/* Meta */}
                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(post.date).toLocaleDateString('de-CH', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {post.readTime} Min.
                                </span>
                              </div>

                              {/* Title */}
                              <h2 className="text-xl font-medium mb-3 text-gray-900 group-hover:text-amber-600 transition-colors line-clamp-2">
                                {post.title}
                              </h2>

                              {/* Excerpt */}
                              <p className="text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                                {post.excerpt}
                              </p>

                              {/* Footer */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Tag className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-600">{post.category}</span>
                                </div>
                                <span className="text-amber-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 text-sm font-medium">
                                  Weiterlesen
                                  <ChevronRight className="w-4 h-4" />
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </article>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1"
                    >
                      Zurück
                    </Button>
                    
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      // Show first page, last page, current page, and one page before and after current
                      if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                      ) {
                        return (
                          <Button
                            key={pageNumber}
                            variant={currentPage === pageNumber ? 'default' : 'outline'}
                            onClick={() => paginate(pageNumber)}
                            className="px-3 py-1"
                          >
                            {pageNumber}
                          </Button>
                        );
                      } else if (
                        pageNumber === currentPage - 2 ||
                        pageNumber === currentPage + 2
                      ) {
                        return <span key={pageNumber} className="px-2">...</span>;
                      }
                      return null;
                    })}
                    
                    <Button
                      variant="outline"
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1"
                    >
                      Weiter
                    </Button>
                  </div>
                )}
              </main>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}

// Static props for SEO
export async function getStaticProps() {
  return {
    props: {},
  };
}