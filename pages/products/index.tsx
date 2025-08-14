import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Products from '@/components/pages/ProductsList';
import { Layout } from '../../components/layout/Layout';
import { NextSEOHead } from '@/components/seo/NextSEOHead';
import { SITE_URL } from '@/lib/canonical';
import { useState } from 'react';
import { ShopifyProduct } from '../../types/shopify'; 
import { getProductsOptimized } from '../../lib/shopify';
import { generateStaticPageSEO } from '../../lib/seo';
import Link from 'next/link';
import { SEOEnhancer } from '@/components/seo/SEOEnhancer';

interface ProductsPageProps {
  products: ShopifyProduct[];
  page: number;
  totalPages: number;
}

export default function ProductsPage({ products, page, totalPages }: ProductsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const seoData = generateStaticPageSEO('products');
  // Align og:url with canonical for paginated pages
  const seoWithPageOg = {
    ...seoData,
    openGraph: {
      title: seoData.openGraph?.title || seoData.title,
      description: seoData.openGraph?.description || seoData.description,
      image: seoData.openGraph?.image,
      url: page > 1 ? `/products?page=${page}` : (seoData.openGraph?.url || '/products'),
      type: seoData.openGraph?.type || 'website'
    },
    twitter: {
      card: seoData.twitter?.card || 'summary',
      title: seoData.twitter?.title || seoData.title,
      description: seoData.twitter?.description || seoData.description,
      image: seoData.twitter?.image
    }
  };
  const itemListStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: (page - 1) * PAGE_SIZE + i + 1,
  // Use plain URL string to avoid any Product object misinterpretation
  item: `${SITE_URL}/products/${p.handle}`,
    })),
  } as const;

  return (
    <>
      <Head>
        {totalPages > 1 && page > 1 && (
          <link
            rel="prev"
            href={page === 2 ? `${SITE_URL}/products` : `${SITE_URL}/products?page=${page - 1}`}
          />
        )}
        {totalPages > 1 && page < totalPages && (
          <link
            rel="next"
            href={`${SITE_URL}/products?page=${page + 1}`}
          />
        )}
      </Head>
      <NextSEOHead 
        seo={seoWithPageOg}
        structuredData={itemListStructuredData}
      />
      <SEOEnhancer totalPages={totalPages} />
      <Layout onSearch={setSearchQuery}>
        <Products preloadedProducts={products} />
        {totalPages > 1 && (
          <div className="max-w-7xl mx-auto px-6 py-12 flex items-center justify-between">
            {page > 1 ? (
              <Link href={page === 2 ? '/products' : `/products?page=${page - 1}`} className="text-gray-900 underline">
                ← Zurück
              </Link>
            ) : <span />}
            <span className="text-sm text-gray-600">Seite {page} von {totalPages}</span>
            {page < totalPages ? (
              <Link href={`/products?page=${page + 1}`} className="text-gray-900 underline">
                Weiter →
              </Link>
            ) : <span />}
          </div>
        )}
      </Layout>
    </>
  );
}

const PAGE_SIZE = 24;
export const getServerSideProps: GetServerSideProps<ProductsPageProps> = async (ctx) => {
  try {
    const raw = Array.isArray(ctx.query.page) ? ctx.query.page[0] : ctx.query.page;
    const page = Math.max(1, parseInt(raw || '1', 10) || 1);

    let { products: all } = await getProductsOptimized(250);
    // Minimale Resilienz: Bei leeren Ergebnissen einmal kurz retryen (ohne Strukturwechsel)
    if (!all || all.length === 0) {
      await new Promise((r) => setTimeout(r, 200));
      const retry = await getProductsOptimized(250);
      if (retry.products?.length) {
        all = retry.products;
      }
    }
    const total = all.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    if (page > totalPages) {
      return {
        redirect: {
          destination: '/products',
          permanent: false,
        },
      };
    }

    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const products = all.slice(start, end);

    return {
      props: {
        products,
        page,
        totalPages,
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps for products:', error);
    return {
      props: {
        products: [],
        page: 1,
        totalPages: 1,
      },
    };
  }
};
