import Blog from '../BlogList';
import { Layout } from '../../components/layout/Layout';
import { useState } from 'react';

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Layout onSearch={setSearchQuery}>
      <Blog />
    </Layout>
  );
}