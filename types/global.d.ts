// Global TypeScript declarations for AlltagsGold Next.js App

declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'exception',
      targetId: string,
      config?: Record<string, any>
    ) => void;
    dataLayer?: any[];
    fbq?: (...args: any[]) => void;
    clarity?: (...args: any[]) => void;
    va?: (event: string, properties?: Record<string, any>) => void;
  }
}

// Module declarations for untyped packages
declare module 'web-vitals' {
  export interface Metric {
    name: string;
    value: number;
    id: string;
    delta: number;
    rating: 'good' | 'needs-improvement' | 'poor';
  }

  export function getCLS(onReport: (metric: Metric) => void, reportAllChanges?: boolean): void;
  export function getFID(onReport: (metric: Metric) => void): void;
  export function getFCP(onReport: (metric: Metric) => void): void;
  export function getLCP(onReport: (metric: Metric) => void, reportAllChanges?: boolean): void;
  export function getTTFB(onReport: (metric: Metric) => void): void;
}

// Cloudinary types
declare module '@/lib/cloudinary' {
  export function getCloudinaryUrl(url?: string, preset?: string): string;
  export function generateImageAlt(title?: string, index?: number): string;
}

// Next.js Image types enhancement
declare module 'next/image' {
  interface ImageProps {
    priority?: boolean;
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
  }
}

export {};
