import { useState } from 'react';
import dynamic from 'next/dynamic';
import { NextSEOHead } from '@/components/seo/NextSEOHead';
import { generateContactSEO } from '@/lib/seo';
import { Layout } from '@/components/layout/Layout';

// Dynamically load the animated contact content on the client to keep framer-motion out of the SSR bundle
const Contact = dynamic(() => import('../components/contact/ContactAnimated'), { ssr: false });

export default function ContactPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Generate SEO metadata for contact page
  // Keep SEO rendered on the server for proper indexing

  return (
    <>
      <NextSEOHead 
        seo={generateContactSEO()}
        canonicalUrl="contact"
      />
      <Layout onSearch={setSearchQuery}>
        <Contact />
      </Layout>
    </>
  );
}
 
