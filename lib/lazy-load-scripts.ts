/**
 * Lazy Loading for Third-Party Scripts
 * Improves initial page load performance by deferring non-critical scripts
 */

interface ScriptConfig {
  src?: string;
  innerHTML?: string;
  id: string;
  async?: boolean;
  defer?: boolean;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

class LazyScriptLoader {
  private loadedScripts = new Set<string>();
  private loadingScripts = new Map<string, Promise<void>>();

  /**
   * Load a script lazily when needed
   */
  public loadScript(config: ScriptConfig): Promise<void> {
    const { id } = config;

    // Return existing promise if script is already loading
    if (this.loadingScripts.has(id)) {
      return this.loadingScripts.get(id)!;
    }

    // Skip if already loaded
    if (this.loadedScripts.has(id)) {
      return Promise.resolve();
    }

    const loadPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.id = id;
      
      if (config.src) {
        script.src = config.src;
      }
      
      if (config.innerHTML) {
        script.innerHTML = config.innerHTML;
      }
      
      if (config.async) {
        script.async = true;
      }
      
      if (config.defer) {
        script.defer = true;
      }

      script.onload = () => {
        this.loadedScripts.add(id);
        this.loadingScripts.delete(id);
        config.onLoad?.();
        resolve();
      };

      script.onerror = () => {
        this.loadingScripts.delete(id);
        const error = new Error(`Failed to load script: ${id}`);
        config.onError?.(error);
        reject(error);
      };

      document.head.appendChild(script);
    });

    this.loadingScripts.set(id, loadPromise);
    return loadPromise;
  }

  /**
   * Load script on user interaction
   */
  public loadOnInteraction(config: ScriptConfig): void {
    const events = ['mouseenter', 'touchstart', 'scroll', 'keydown'];
    
    const loadHandler = () => {
      this.loadScript(config);
      // Remove listeners after loading
      events.forEach(event => {
        document.removeEventListener(event, loadHandler);
      });
    };

    events.forEach(event => {
      document.addEventListener(event, loadHandler, { once: true, passive: true });
    });
  }

  /**
   * Load script when idle
   */
  public loadWhenIdle(config: ScriptConfig): void {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.loadScript(config);
      }, { timeout: 2000 });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        this.loadScript(config);
      }, 2000);
    }
  }

  /**
   * Load script when element is visible
   */
  public loadWhenVisible(config: ScriptConfig, elementSelector: string): void {
    const element = document.querySelector(elementSelector);
    if (!element) {
      console.warn(`Element not found: ${elementSelector}`);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadScript(config);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(element);
  }
}

// Singleton instance
const scriptLoader = new LazyScriptLoader();

/**
 * Meta Pixel Lazy Loading
 */
export function initializeMetaPixel(): void {
  if (process.env.NODE_ENV !== 'production') return;

  scriptLoader.loadWhenIdle({
    id: 'facebook-pixel',
    innerHTML: `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      try {
        fbq('init', '1408203506889853');
        fbq('track', 'PageView');
      } catch(e) {
        console.warn('Facebook Pixel failed to initialize:', e);
      }
    `,
    onLoad: () => {
      console.log('Meta Pixel loaded successfully');
    },
    onError: (error) => {
      console.error('Failed to load Meta Pixel:', error);
    }
  });
}

/**
 * Vercel Analytics Lazy Loading
 */
export function initializeVercelAnalytics(): void {
  // Vercel Analytics should load quickly for accurate data
  // But we can still defer it slightly
  requestAnimationFrame(() => {
    import('@vercel/analytics').then(({ inject }) => {
      inject();
    });
  });
}

/**
 * Google Tag Manager Lazy Loading
 */
export function initializeGTM(gtmId: string): void {
  scriptLoader.loadWhenIdle({
    id: 'google-tag-manager',
    innerHTML: `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${gtmId}');
    `,
    onLoad: () => {
      console.log('GTM loaded successfully');
    }
  });
}

/**
 * Load chat widget when user scrolls to bottom
 */
export function initializeChatWidget(): void {
  scriptLoader.loadWhenVisible(
    {
      id: 'chat-widget',
      src: 'https://widget.intercom.io/widget/YOUR_APP_ID',
      async: true,
      onLoad: () => {
        // Initialize chat widget
        if (window.Intercom) {
          window.Intercom('boot', {
            app_id: 'YOUR_APP_ID'
          });
        }
      }
    },
    'footer' // Load when footer is visible
  );
}

/**
 * Initialize all lazy-loaded scripts
 */
export function initializeLazyScripts(): void {
  // Meta Pixel - Load when idle
  initializeMetaPixel();
  
  // Vercel Analytics - Load immediately but async
  initializeVercelAnalytics();
  
  // Add other scripts as needed
  // initializeGTM('GTM-XXXXXX');
  // initializeChatWidget();
}

// Type declarations
declare global {
  interface Window {
    fbq: any;
    Intercom: any;
    dataLayer: any[];
  }
}

export { scriptLoader };