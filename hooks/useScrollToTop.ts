import { useEffect } from 'react';
import { useRouter } from 'next/router';

export function useScrollToTop() {
  const router = useRouter();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [router.asPath]);
}