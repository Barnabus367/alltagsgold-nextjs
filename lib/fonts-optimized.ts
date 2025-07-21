/**
 * Font Loading Optimization für AlltagsGold
 * Reduziert Layout Shift und verbessert Performance
 */

import { Inter, Roboto_Slab } from 'next/font/google';

// Optimierte Font-Konfigurationen
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Verhindert Layout Shift
  variable: '--font-inter',
  preload: true,
  // Nur benötigte Weights laden
  weight: ['400', '500', '600', '700'],
  // Fallback für bessere Performance
  fallback: ['system-ui', 'arial'],
});

export const robotoSlab = Roboto_Slab({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-slab',
  preload: false, // Nur bei Bedarf laden
  weight: ['400', '700'],
  fallback: ['georgia', 'serif'],
});

// Font-Face Preloading für kritische Fonts
export const fontPreloadLinks = [
  {
    rel: 'preload',
    href: inter.style.fontFamily,
    as: 'font',
    type: 'font/woff2',
    crossOrigin: 'anonymous',
  }
];

// CSS Variables für bessere Performance
export const fontVariables = `
  :root {
    --font-inter: ${inter.style.fontFamily};
    --font-roboto-slab: ${robotoSlab.style.fontFamily};
  }
  
  /* Font Loading Optimization */
  .font-loading {
    font-display: swap;
    font-synthesis: none;
  }
  
  /* Prevent Layout Shift */
  body {
    font-family: var(--font-inter), system-ui, -apple-system, sans-serif;
    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;

// Performance-optimierte Font-Loading Strategy
export function optimizeFontLoading() {
  if (typeof window !== 'undefined') {
    // Font Loading API für bessere Kontrolle
    if ('fonts' in document) {
      // Preload kritische Fonts
      const fontLoadPromises = [
        new FontFace('Inter', 'url(/fonts/inter-regular.woff2)', {
          weight: '400',
          display: 'swap'
        }).load(),
        new FontFace('Inter', 'url(/fonts/inter-medium.woff2)', {
          weight: '500', 
          display: 'swap'
        }).load()
      ];

      Promise.all(fontLoadPromises).then(fonts => {
        fonts.forEach(font => {
          document.fonts.add(font);
        });
        
        // Trigger repaint für bessere Performance
        document.body.classList.add('fonts-loaded');
      });
    }

    // Resource Hints für bessere Loading
    const linkElements = [
      // DNS Prefetch für Google Fonts
      { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' },
      { rel: 'dns-prefetch', href: 'https://fonts.gstatic.com' },
      
      // Preconnect für kritische Font-Services
      { rel: 'preconnect', href: 'https://fonts.googleapis.com', crossOrigin: true },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: true },
    ];

    linkElements.forEach(({ rel, href, crossOrigin }) => {
      if (!document.querySelector(`link[rel="${rel}"][href="${href}"]`)) {
        const link = document.createElement('link');
        link.rel = rel;
        link.href = href;
        if (crossOrigin) link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      }
    });
  }
}

// Font-Loading Performance Metrics
export function trackFontPerformance() {
  if (typeof window !== 'undefined' && 'fonts' in document) {
    document.fonts.ready.then(() => {
      const fontLoadTime = performance.now();
      
      // Analytics Event
      if (window.gtag) {
        window.gtag('event', 'font_load_complete', {
          event_category: 'Performance',
          value: Math.round(fontLoadTime),
          non_interaction: true
        });
      }
      
      console.log(`📝 Fonts loaded in ${Math.round(fontLoadTime)}ms`);
    });
  }
}
