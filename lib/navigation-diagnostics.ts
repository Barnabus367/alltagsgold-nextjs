/**
 * Navigation Diagnostics Tool
 * Identifiziert SSG/ISR Hydration-Probleme zwischen Collection- und Product-Pages
 */

interface NavigationState {
  route: string;
  timestamp: number;
  hydrationState: 'server' | 'client' | 'mismatch';
  componentState: Record<string, any>;
  scrollPosition: { x: number; y: number };
  cacheInfo: {
    isStaticGenerated: boolean;
    revalidateTime?: number;
    lastFetch?: number;
  };
}

class NavigationDiagnostics {
  private navigationHistory: NavigationState[] = [];
  private isClient = typeof window !== 'undefined';
  
  constructor() {
    if (this.isClient) {
      this.initializeLogging();
    }
  }

  private initializeLogging() {
    // Router Events lauschen für Diagnose - Next.js Router importieren
    import('next/router').then(({ default: Router }) => {
      Router.events.on('routeChangeStart', this.logRouteChangeStart.bind(this));
      Router.events.on('routeChangeComplete', this.logRouteChangeComplete.bind(this));
      Router.events.on('beforeHistoryChange', this.logBeforeHistoryChange.bind(this));
    }).catch(console.error);

    // Browser Back/Forward Events
    window.addEventListener('popstate', this.logPopStateEvent.bind(this));
    
    // Hydration Mismatch Detection
    this.detectHydrationMismatches();
  }

  private logRouteChangeStart(url: string) {
    console.log('🔄 Navigation Diagnostics - Route Change Start:', {
      from: window.location.pathname,
      to: url,
      timestamp: new Date().toISOString(),
      scrollPosition: { x: window.scrollX, y: window.scrollY }
    });
  }

  private logRouteChangeComplete(url: string) {
    const currentState: NavigationState = {
      route: url,
      timestamp: Date.now(),
      hydrationState: this.detectHydrationState(),
      componentState: this.captureComponentState(),
      scrollPosition: { x: window.scrollX, y: window.scrollY },
      cacheInfo: this.analyzeCacheInfo(url)
    };

    this.navigationHistory.push(currentState);
    
    console.log('✅ Navigation Diagnostics - Route Change Complete:', currentState);
    
    // Prüfe auf potentielle Probleme
    this.analyzeNavigationIssues(currentState);
  }

  private logBeforeHistoryChange(url: string) {
    console.log('📚 Navigation Diagnostics - Before History Change:', {
      url,
      currentScrollY: window.scrollY,
      documentTitle: document.title
    });
  }

  private logPopStateEvent(event: PopStateEvent) {
    console.log('⬅️ Navigation Diagnostics - PopState Event (Back/Forward):', {
      state: event.state,
      currentURL: window.location.href,
      scrollPosition: { x: window.scrollX, y: window.scrollY },
      timestamp: new Date().toISOString()
    });

    // Spezielle Diagnose für Back-Button-Navigation
    this.diagnoseBackButtonNavigation();
  }

  private detectHydrationState(): 'server' | 'client' | 'mismatch' {
    // Prüfe ob Server- und Client-State übereinstimmen
    const hasHydrationMarkers = document.querySelector('[data-reactroot]');
    const hasClientOnlyContent = document.querySelector('[data-client-only]');
    
    if (hasHydrationMarkers && !hasClientOnlyContent) {
      return 'server';
    } else if (!hasHydrationMarkers && hasClientOnlyContent) {
      return 'client';
    } else {
      return 'mismatch';
    }
  }

  private captureComponentState(): Record<string, any> {
    const state: Record<string, any> = {};
    
    // Collection-specific State
    const collectionFilters = document.querySelector('[data-collection-filters]');
    if (collectionFilters) {
      state.collectionFilters = {
        visible: !collectionFilters.classList.contains('hidden'),
        activeFilters: Array.from(collectionFilters.querySelectorAll('.active')).length
      };
    }

    // Product-specific State
    const productImages = document.querySelector('[data-product-images]');
    if (productImages) {
      state.productImages = {
        currentIndex: productImages.getAttribute('data-current-index') || '0'
      };
    }

    // Search State
    const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
    if (searchInput) {
      state.searchQuery = searchInput.value;
    }

    return state;
  }

  private analyzeCacheInfo(url: string): NavigationState['cacheInfo'] {
    const isCollectionPage = url.includes('/collections/');
    const isProductPage = url.includes('/products/');
    
    return {
      isStaticGenerated: isCollectionPage || isProductPage,
      revalidateTime: isCollectionPage ? 12 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000, // 12h vs 24h
      lastFetch: this.getLastFetchTime(url)
    };
  }

  private getLastFetchTime(url: string): number | undefined {
    // Versuche aus Next.js Cache Info zu lesen
    if (window.__NEXT_DATA__?.props?.pageProps) {
      return Date.now(); // Fallback
    }
    return undefined;
  }

  private analyzeNavigationIssues(currentState: NavigationState) {
    const isBackNavigation = this.isBackNavigation();
    
    if (isBackNavigation) {
      console.warn('🚨 Potentielle Navigation-Issues erkannt:', {
        issue: 'Back-Button Navigation zu SSG-Seite',
        route: currentState.route,
        hydrationState: currentState.hydrationState,
        recommendations: [
          'Prüfe SSG/ISR Cache-Verhalten',
          'Validiere Component-State-Reset',
          'Teste Client-Side Navigation'
        ]
      });
    }

    if (currentState.hydrationState === 'mismatch') {
      console.error('💥 Hydration Mismatch erkannt:', currentState);
    }
  }

  private diagnoseBackButtonNavigation() {
    const currentPath = window.location.pathname;
    const isCollectionPage = currentPath.includes('/collections/');
    const isProductPage = currentPath.includes('/products/');
    
    if (isCollectionPage) {
      // Prüfe ob wir von einer Product-Page kommen
      const lastState = this.navigationHistory[this.navigationHistory.length - 1];
      if (lastState?.route.includes('/products/')) {
        console.log('🔍 Back-Navigation: Product → Collection erkannt', {
          from: lastState.route,
          to: currentPath,
          potentialIssue: 'SSG Cache vs. Client State Konflikt'
        });
        
        // Spezifische Diagnose
        this.diagnoseProductToCollectionBackNav();
      }
    }
  }

  private diagnoseProductToCollectionBackNav() {
    setTimeout(() => {
      const urlBar = window.location.pathname;
      const pageTitle = document.title;
      const mainContent = document.querySelector('main')?.textContent?.substring(0, 100);
      
      console.log('🔬 Product→Collection Back-Navigation Diagnose:', {
        urlInAddressBar: urlBar,
        documentTitle: pageTitle,
        mainContentPreview: mainContent,
        isURLCollectionPage: urlBar.includes('/collections/'),
        isTitleCollectionPage: pageTitle.includes('Kollektion') || pageTitle.includes('Collection'),
        isContentCollectionPage: mainContent?.includes('Kollektion') || mainContent?.includes('Collection'),
        diagnosis: {
          urlCorrect: urlBar.includes('/collections/'),
          titleCorrect: pageTitle.includes('Kollektion'),
          contentCorrect: mainContent?.includes('Kollektion'),
          overallStatus: 'Analyzing...'
        }
      });
    }, 100); // Kurze Verzögerung für DOM-Update
  }

  private isBackNavigation(): boolean {
    // Einfache Heuristik: Prüfe ob wir in der History zurückgehen
    return this.navigationHistory.length > 1;
  }

  // Public API für manuelle Diagnose
  public getCurrentDiagnostics() {
    return {
      navigationHistory: this.navigationHistory,
      currentRoute: window.location.pathname,
      currentState: this.captureComponentState(),
      cacheInfo: this.analyzeCacheInfo(window.location.pathname)
    };
  }

  public detectHydrationMismatches() {
    // React Hydration Error Listener
    const originalError = console.error;
    console.error = (...args) => {
      if (args[0]?.includes?.('Hydration') || args[0]?.includes?.('hydration')) {
        console.warn('🚨 Hydration Error erkannt:', args);
        this.logHydrationError(args);
      }
      originalError.apply(console, args);
    };
  }

  private logHydrationError(errorArgs: any[]) {
    console.log('💥 Hydration Error Details:', {
      error: errorArgs,
      currentRoute: window.location.pathname,
      timestamp: new Date().toISOString(),
      possibleCause: 'SSG/ISR Cache vs. Client State Mismatch'
    });
  }
}

// Singleton Instance
let diagnostics: NavigationDiagnostics | null = null;

export function initializeNavigationDiagnostics() {
  if (typeof window !== 'undefined' && !diagnostics) {
    diagnostics = new NavigationDiagnostics();
    
    // Globale Zugriff für Browser Console
    (window as any).navigationDiagnostics = diagnostics;
    
    console.log('🔧 Navigation Diagnostics initialisiert - Zugriff über window.navigationDiagnostics');
  }
  return diagnostics;
}

export function getNavigationDiagnostics() {
  return diagnostics;
}
