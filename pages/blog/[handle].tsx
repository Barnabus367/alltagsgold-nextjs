import { useRouter } from 'next/router';
import BlogPost from '../BlogPost';
import { Layout } from '../../components/layout/Layout';
import { useState } from 'react';

export default function BlogPostPage() {
  const router = useRouter();
  const { handle } = router.query;
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Layout onSearch={setSearchQuery}>
      <BlogPost />
    </Layout>
  );
}