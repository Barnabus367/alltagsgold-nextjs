/**
 * GLOBAL CLICK TRACKER
 * Trackt JEDEN Klick auf der Website für maximale User Behavior Intelligence
 */

import { track } from '@vercel/analytics';

export interface ClickEvent {
  element: string;
  text?: string;
  href?: string;
  className?: string;
  id?: string;
  position: { x: number; y: number };
  page: string;
  timestamp: number;
  userAgent: string;
  sessionId: string;
}

export interface ElementContext {
  tagName: string;
  text: string;
  href?: string;
  className?: string;
  id?: string;
  dataAttributes: Record<string, string>;
  parentContext?: string;
}

class GlobalClickTracker {
  private sessionId: string;
  private isTracking: boolean = false;
  private clickBuffer: ClickEvent[] = [];
  private bufferTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeTracking();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeTracking() {
    if (typeof window === 'undefined') return;

    // Start tracking nur nach Page Load
    window.addEventListener('load', () => {
      this.startTracking();
    });

    // Stop tracking bei Page Unload
    window.addEventListener('beforeunload', () => {
      this.flushBuffer();
    });
  }

  public startTracking() {
    if (this.isTracking) return;
    
    this.isTracking = true;
    document.addEventListener('click', this.handleClick.bind(this), true);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Global Click Tracking aktiviert');
    }
  }

  public stopTracking() {
    this.isTracking = false;
    document.removeEventListener('click', this.handleClick.bind(this), true);
    this.flushBuffer();
  }

  private handleClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target) return;

    const clickData = this.extractClickData(target, event);
    this.bufferClick(clickData);
  }

  private extractClickData(element: HTMLElement, event: MouseEvent): ClickEvent {
    const context = this.getElementContext(element);
    
    return {
      element: context.tagName,
      text: context.text.substring(0, 100), // Limit text length
      href: context.href,
      className: context.className,
      id: context.id,
      position: {
        x: event.clientX,
        y: event.clientY
      },
      page: window.location.pathname,
      timestamp: Date.now(),
      userAgent: navigator.userAgent.substring(0, 100),
      sessionId: this.sessionId
    };
  }

  private getElementContext(element: HTMLElement): ElementContext {
    const dataAttributes: Record<string, string> = {};
    
    // Extract all data-* attributes
    Array.from(element.attributes).forEach(attr => {
      if (attr.name.startsWith('data-')) {
        dataAttributes[attr.name] = attr.value;
      }
    });

    // Get meaningful text content
    let text = '';
    if (element.textContent) {
      text = element.textContent.trim();
    } else if (element.getAttribute('alt')) {
      text = element.getAttribute('alt') || '';
    } else if (element.getAttribute('title')) {
      text = element.getAttribute('title') || '';
    }

    // Get parent context for better understanding
    let parentContext = '';
    if (element.parentElement) {
      const parent = element.parentElement;
      parentContext = `${parent.tagName}${parent.className ? '.' + parent.className.split(' ')[0] : ''}`;
    }

    return {
      tagName: element.tagName.toLowerCase(),
      text,
      href: element.getAttribute('href') || undefined,
      className: element.className || undefined,
      id: element.id || undefined,
      dataAttributes,
      parentContext
    };
  }

  private bufferClick(clickData: ClickEvent) {
    this.clickBuffer.push(clickData);

    // Flush buffer after 5 seconds or when it reaches 10 clicks
    if (this.clickBuffer.length >= 10) {
      this.flushBuffer();
    } else if (!this.bufferTimeout) {
      this.bufferTimeout = setTimeout(() => {
        this.flushBuffer();
      }, 5000);
    }
  }

  private flushBuffer() {
    if (this.clickBuffer.length === 0) return;

    // Clear timeout
    if (this.bufferTimeout) {
      clearTimeout(this.bufferTimeout);
      this.bufferTimeout = null;
    }

    // Send clicks to analytics
    const clicks = [...this.clickBuffer];
    this.clickBuffer = [];

    this.sendToAnalytics(clicks);
  }

  private sendToAnalytics(clicks: ClickEvent[]) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('🖱️ Clicks tracked:', clicks);
      return;
    }

    // Send to Vercel Analytics
    clicks.forEach(click => {
      const eventName = this.getEventName(click);
      const properties = this.getEventProperties(click);
      
      track(eventName, properties);
    });

    // Send to Meta Pixel as Custom Event
    if (window.fbq) {
      window.fbq('trackCustom', 'Click_Batch', {
        click_count: clicks.length,
        session_id: this.sessionId,
        page: clicks[0]?.page
      });
    }

    // Send to internal analytics API
    clicks.forEach(click => {
      fetch('/api/analytics/clicks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(click)
      }).catch(() => {
        // Fail silently for analytics
      });
    });
  }

  private getEventName(click: ClickEvent): string {
    // Intelligent event naming based on element and context
    if (click.href) {
      if (click.href.includes('/products/')) return 'Product_Link_Click';
      if (click.href.includes('/collections/')) return 'Collection_Link_Click';
      if (click.href.includes('/cart')) return 'Cart_Link_Click';
      if (click.href.includes('mailto:')) return 'Email_Link_Click';
      if (click.href.includes('tel:')) return 'Phone_Link_Click';
      return 'External_Link_Click';
    }

    if (click.element === 'button') {
      if (click.text?.toLowerCase().includes('cart')) return 'Add_To_Cart_Button';
      if (click.text?.toLowerCase().includes('buy')) return 'Buy_Button_Click';
      if (click.text?.toLowerCase().includes('search')) return 'Search_Button_Click';
      if (click.text?.toLowerCase().includes('filter')) return 'Filter_Button_Click';
      return 'Button_Click';
    }

    if (click.element === 'img') {
      if (click.className?.includes('product')) return 'Product_Image_Click';
      return 'Image_Click';
    }

    if (click.element === 'input') {
      if (click.className?.includes('search')) return 'Search_Input_Focus';
      return 'Input_Focus';
    }

    // Default kategorisierung
    return 'Element_Click';
  }

  private getEventProperties(click: ClickEvent): Record<string, any> {
    return {
      element_type: click.element,
      element_text: click.text || 'no_text',
      element_class: click.className || 'no_class',
      element_id: click.id || 'no_id',
      page_path: click.page,
      click_position_x: click.position.x,
      click_position_y: click.position.y,
      session_id: click.sessionId,
      timestamp: click.timestamp,
      // Nur wichtige Browser-Info
      is_mobile: /Mobile|Android|iPhone|iPad/.test(click.userAgent)
    };
  }

  // Public Methods für spezielle Tracking-Needs
  public trackSpecialClick(elementSelector: string, eventName: string, properties?: Record<string, any>) {
    const element = document.querySelector(elementSelector);
    if (element) {
      element.addEventListener('click', () => {
        track(eventName, {
          ...properties,
          session_id: this.sessionId,
          timestamp: Date.now()
        });
      });
    }
  }

  public getSessionMetrics() {
    return {
      sessionId: this.sessionId,
      totalClicks: this.clickBuffer.length,
      isTracking: this.isTracking,
      currentPage: window.location.pathname
    };
  }
}

// Global Instance
let globalTracker: GlobalClickTracker | null = null;

export function initializeGlobalClickTracker(): GlobalClickTracker {
  if (typeof window === 'undefined') return {} as GlobalClickTracker;
  
  if (!globalTracker) {
    globalTracker = new GlobalClickTracker();
  }
  
  return globalTracker;
}

export function getGlobalClickTracker(): GlobalClickTracker | null {
  return globalTracker;
}

// Auto-initialize wenn Module geladen wird
if (typeof window !== 'undefined') {
  // Start tracking nach einem kurzen Delay
  setTimeout(() => {
    initializeGlobalClickTracker();
  }, 1000);
}
