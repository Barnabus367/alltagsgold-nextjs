import { useEffect } from 'react';

export function usePageTitle(title: string) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;
    
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
}

export function formatPageTitle(pageTitle: string): string {
  if (pageTitle === 'Home') {
    return 'alltagsgold';
  }
  return `${pageTitle} - alltagsgold`;
}