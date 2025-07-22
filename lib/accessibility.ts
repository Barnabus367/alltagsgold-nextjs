/**
 * Accessibility Utilities für AlltagsGold
 * WCAG 2.1 AA konforme Hilfsfunktionen
 */

// Fokus-Management für Modals und Overlays
export class FocusManager {
  private previousActiveElement: HTMLElement | null = null;
  private focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    '[role="button"]:not([disabled])',
  ].join(', ');

  trapFocus(container: HTMLElement) {
    this.previousActiveElement = document.activeElement as HTMLElement;
    
    const focusableElements = container.querySelectorAll(this.focusableSelectors) as NodeListOf<HTMLElement>;
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Fokus auf erstes Element setzen
    if (firstElement) {
      firstElement.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
      
      if (e.key === 'Escape') {
        this.releaseFocus();
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      this.releaseFocus();
    };
  }

  releaseFocus() {
    if (this.previousActiveElement) {
      this.previousActiveElement.focus();
      this.previousActiveElement = null;
    }
  }
}

// Screen Reader Ankündigungen
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcer = document.createElement('div');
  announcer.setAttribute('aria-live', priority);
  announcer.setAttribute('aria-atomic', 'true');
  announcer.className = 'sr-only';
  announcer.textContent = message;
  
  document.body.appendChild(announcer);
  
  setTimeout(() => {
    document.body.removeChild(announcer);
  }, 1000);
}

// Kontrast-Checker
export function checkColorContrast(foreground: string, background: string): { ratio: number; passes: boolean } {
  // Vereinfachte Kontrast-Berechnung
  const getLuminance = (color: string) => {
    // RGB-Werte extrahieren (vereinfacht für Hex-Farben)
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    
    const sRGB = [r, g, b].map(c => 
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );
    
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  
  return {
    ratio,
    passes: ratio >= 4.5 // WCAG AA Standard
  };
}

// Touch Target Größe prüfen
export function validateTouchTarget(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  const minSize = 44; // iOS/Android Richtlinie
  
  return rect.width >= minSize && rect.height >= minSize;
}

// Keyboard Navigation Helper
export function handleKeyboardNavigation(
  event: KeyboardEvent,
  items: HTMLElement[],
  currentIndex: number,
  onSelect?: (index: number) => void
): number {
  let newIndex = currentIndex;
  
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      newIndex = Math.min(currentIndex + 1, items.length - 1);
      break;
    case 'ArrowUp':
      event.preventDefault();
      newIndex = Math.max(currentIndex - 1, 0);
      break;
    case 'Home':
      event.preventDefault();
      newIndex = 0;
      break;
    case 'End':
      event.preventDefault();
      newIndex = items.length - 1;
      break;
    case 'Enter':
    case ' ':
      event.preventDefault();
      onSelect?.(currentIndex);
      return currentIndex;
  }
  
  if (newIndex !== currentIndex && items[newIndex]) {
    items[newIndex].focus();
  }
  
  return newIndex;
}

// ARIA Live Region Manager
export class LiveRegionManager {
  private politeRegion: HTMLElement;
  private assertiveRegion: HTMLElement;

  constructor() {
    this.politeRegion = this.createLiveRegion('polite');
    this.assertiveRegion = this.createLiveRegion('assertive');
  }

  private createLiveRegion(priority: 'polite' | 'assertive'): HTMLElement {
    const region = document.createElement('div');
    region.setAttribute('aria-live', priority);
    region.setAttribute('aria-atomic', 'true');
    region.className = 'sr-only';
    region.id = `live-region-${priority}`;
    document.body.appendChild(region);
    return region;
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    const region = priority === 'polite' ? this.politeRegion : this.assertiveRegion;
    region.textContent = message;
    
    // Clear nach kurzer Zeit für wiederholte Ankündigungen
    setTimeout(() => {
      region.textContent = '';
    }, 1000);
  }

  destroy() {
    this.politeRegion.remove();
    this.assertiveRegion.remove();
  }
}

// Alt-Text Generator für E-Commerce
export function generateProductAltText(product: {
  title: string;
  category?: string;
  brand?: string;
  color?: string;
  features?: string[];
}): string {
  const parts = [];
  
  if (product.brand) parts.push(product.brand);
  parts.push(product.title);
  if (product.color) parts.push(`in ${product.color}`);
  if (product.category) parts.push(`- ${product.category}`);
  
  return parts.join(' ');
}

// Skip Links Component für bessere Navigation
export function createSkipLinks(): HTMLElement {
  const skipNav = document.createElement('nav');
  skipNav.className = 'skip-links';
  skipNav.innerHTML = `
    <a href="#main-content" class="skip-link">Zum Hauptinhalt springen</a>
    <a href="#navigation" class="skip-link">Zur Navigation springen</a>
    <a href="#search" class="skip-link">Zur Suche springen</a>
  `;
  
  return skipNav;
}
