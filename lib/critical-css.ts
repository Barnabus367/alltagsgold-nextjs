/**
 * Critical CSS Extraction für AlltagsGold
 * Lädt nur das absolut notwendige CSS für Above-the-Fold Content
 */

// Critical CSS für Homepage Above-the-Fold
export const criticalCSS = `
/* Reset & Base Styles */
*,::before,::after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}
::before,::after{--tw-content:''}
html{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal}
body{margin:0;line-height:inherit}

/* Header Styles */
.header{position:fixed;top:0;left:0;right:0;z-index:50;background:rgba(255,255,255,0.95);backdrop-filter:blur(10px);border-bottom:1px solid #e5e7eb}
.header-container{max-width:1200px;margin:0 auto;padding:0 1rem;display:flex;align-items:center;justify-content:space-between;height:64px}
.logo{height:40px;width:auto}
.nav{display:flex;gap:2rem;align-items:center}
.nav-link{color:#374151;text-decoration:none;font-weight:500;transition:color 0.2s}
.nav-link:hover{color:#059669}
.cart-button{background:#059669;color:white;padding:0.5rem 1rem;border-radius:0.5rem;border:none;font-weight:600;cursor:pointer;transition:background 0.2s}
.cart-button:hover{background:#047857}

/* Hero Section */
.hero{min-height:100vh;display:flex;align-items:center;background:linear-gradient(135deg,#f0f9ff 0%,#e0f2fe 100%);position:relative;overflow:hidden}
.hero-container{max-width:1200px;margin:0 auto;padding:0 1rem;display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:center}
.hero-content{z-index:10}
.hero-title{font-size:3rem;font-weight:700;color:#1f2937;line-height:1.1;margin-bottom:1.5rem}
.hero-subtitle{font-size:1.25rem;color:#6b7280;margin-bottom:2rem;line-height:1.6}
.hero-cta{background:#059669;color:white;padding:1rem 2rem;border-radius:0.5rem;text-decoration:none;font-weight:600;display:inline-block;transition:all 0.3s;box-shadow:0 4px 14px 0 rgba(5,150,105,0.39)}
.hero-cta:hover{background:#047857;transform:translateY(-2px);box-shadow:0 6px 20px 0 rgba(5,150,105,0.5)}
.hero-image{position:relative;z-index:5}
.hero-video{width:100%;height:auto;border-radius:1rem;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25)}

/* Mobile Responsive */
@media (max-width: 768px) {
  .header-container{padding:0 1rem;height:56px}
  .nav{display:none}
  .hero-container{grid-template-columns:1fr;gap:2rem;text-align:center}
  .hero-title{font-size:2rem}
  .hero-subtitle{font-size:1rem}
  .hero-cta{padding:0.75rem 1.5rem}
}

/* Loading States */
.skeleton{background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);background-size:200% 100%;animation:loading 1.5s infinite}
@keyframes loading{0%{background-position:200% 0}100%{background-position:-200% 0}}

/* Performance Optimizations */
.will-change-transform{will-change:transform}
.contain-layout{contain:layout}
.contain-strict{contain:strict}
.gpu-accelerated{transform:translateZ(0);backface-visibility:hidden}
`;

// Critical CSS für Produktlisten
export const productListCriticalCSS = `
/* Product Grid */
.product-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.5rem;padding:2rem 0}
.product-card{background:white;border-radius:0.75rem;overflow:hidden;box-shadow:0 1px 3px 0 rgba(0,0,0,0.1);transition:all 0.3s;cursor:pointer}
.product-card:hover{transform:translateY(-4px);box-shadow:0 10px 25px 0 rgba(0,0,0,0.15)}
.product-image{width:100%;height:200px;object-fit:cover;background:#f3f4f6}
.product-info{padding:1rem}
.product-title{font-size:1.125rem;font-weight:600;color:#1f2937;margin-bottom:0.5rem;line-height:1.4}
.product-price{font-size:1.25rem;font-weight:700;color:#059669}
.product-price-old{font-size:1rem;color:#9ca3af;text-decoration:line-through;margin-left:0.5rem}

/* Filter Bar */
.filter-bar{background:white;padding:1rem;border-radius:0.5rem;margin-bottom:2rem;box-shadow:0 1px 3px 0 rgba(0,0,0,0.1)}
.filter-group{display:flex;gap:1rem;align-items:center;flex-wrap:wrap}
.filter-button{padding:0.5rem 1rem;border:1px solid #d1d5db;border-radius:0.375rem;background:white;color:#374151;cursor:pointer;transition:all 0.2s}
.filter-button.active{background:#059669;color:white;border-color:#059669}
`;

// Critical CSS für Produktdetails
export const productDetailCriticalCSS = `
/* Product Detail Layout */
.product-detail{display:grid;grid-template-columns:1fr 1fr;gap:3rem;max-width:1200px;margin:0 auto;padding:2rem 1rem}
.product-gallery{position:sticky;top:100px}
.product-main-image{width:100%;height:500px;object-fit:cover;border-radius:0.75rem;margin-bottom:1rem}
.product-thumbnails{display:flex;gap:0.5rem;overflow-x:auto}
.product-thumbnail{width:80px;height:80px;object-fit:cover;border-radius:0.375rem;cursor:pointer;opacity:0.7;transition:opacity 0.2s}
.product-thumbnail.active{opacity:1;border:2px solid #059669}
.product-info{padding:1rem 0}
.product-title{font-size:2rem;font-weight:700;color:#1f2937;margin-bottom:1rem;line-height:1.2}
.product-price{font-size:2rem;font-weight:700;color:#059669;margin-bottom:1.5rem}
.product-description{color:#6b7280;line-height:1.6;margin-bottom:2rem}
.add-to-cart{width:100%;background:#059669;color:white;padding:1rem;border:none;border-radius:0.5rem;font-size:1.125rem;font-weight:600;cursor:pointer;transition:background 0.2s}
.add-to-cart:hover{background:#047857}
.add-to-cart:disabled{background:#9ca3af;cursor:not-allowed}

@media (max-width: 768px) {
  .product-detail{grid-template-columns:1fr;gap:2rem}
  .product-gallery{position:static}
  .product-main-image{height:300px}
}
`;

// CSS Loading Strategy
export function loadCriticalCSS(page: string = 'home') {
  if (typeof window === 'undefined') return;
  
  // Check if critical CSS is already loaded for this page
  const existingStyle = document.querySelector(`style[data-critical="${page}"]`);
  if (existingStyle) return;

  const criticalStyles = {
    home: criticalCSS,
    products: criticalCSS + productListCriticalCSS,
    product: criticalCSS + productDetailCriticalCSS,
  };

  const css = criticalStyles[page as keyof typeof criticalStyles] || criticalCSS;
  
  // Inject Critical CSS only if not already present
  const styleElement = document.createElement('style');
  styleElement.textContent = css;
  styleElement.setAttribute('data-critical', page);
  document.head.insertBefore(styleElement, document.head.firstChild);

  // Preload non-critical CSS only once
  if (!document.querySelector('link[href="/styles/non-critical.css"]')) {
    setTimeout(() => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/styles/non-critical.css';
      link.media = 'all';
      document.head.appendChild(link);
    }, 100);
  }
}

// CSS Performance Monitoring
export function trackCSSPerformance() {
  if (typeof window !== 'undefined') {
    // Measure CSS Load Time
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.name.includes('.css')) {
          console.log(`📊 CSS loaded: ${entry.name} in ${Math.round(entry.duration)}ms`);
          
          if (window.gtag) {
            window.gtag('event', 'css_load_time', {
              event_category: 'Performance',
              value: Math.round(entry.duration),
              custom_parameter_1: entry.name,
              non_interaction: true
            });
          }
        }
      });
    });
    
    observer.observe({ entryTypes: ['resource'] });
  }
}

// Lazy Load Non-Critical CSS
export function loadNonCriticalCSS() {
  if (typeof window === 'undefined') return;

  const nonCriticalCSS = [
    '/styles/components.css',
    '/styles/animations.css', 
    '/styles/utils.css'
  ];

  // Load after critical rendering
  requestIdleCallback(() => {
    nonCriticalCSS.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.media = 'all';
      document.head.appendChild(link);
    });
  });
}
