/**
 * Mobile Navigation mit Touch-Gesten und Accessibility
 * Unterstützt Swipe-to-Open/Close, Keyboard-Navigation und Screen Reader
 */

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { X, Menu, ChevronRight, Home, Package, Heart, User, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMobileUX } from '@/hooks/useMobileUX';
import { FocusManager, announceToScreenReader } from '@/lib/accessibility';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  cartItemCount?: number;
}

interface MenuItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    href: '/',
    label: 'Startseite',
    icon: Home,
  },
  {
    href: '/collections',
    label: 'Kategorien',
    icon: Package,
    children: [
      { href: '/collections/schmuck', label: 'Schmuck', icon: Package },
      { href: '/collections/uhren', label: 'Uhren', icon: Package },
      { href: '/collections/accessoires', label: 'Accessoires', icon: Package },
    ],
  },
  {
    href: '/wishlist',
    label: 'Wunschliste',
    icon: Heart,
  },
  {
    href: '/account',
    label: 'Mein Konto',
    icon: User,
  },
];

export function MobileMenu({ isOpen, onClose, onOpen, cartItemCount = 0 }: MobileMenuProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const focusManagerRef = useRef<FocusManager | null>(null);
  
  const { capabilities, handleTouchGesture, getTouchClasses } = useMobileUX();

  // Focus management
  useEffect(() => {
    if (isOpen && menuRef.current) {
      focusManagerRef.current = new FocusManager();
      focusManagerRef.current.trapFocus(menuRef.current);
      announceToScreenReader('Mobile Navigation geöffnet');
    } else if (focusManagerRef.current) {
      focusManagerRef.current.releaseFocus();
      focusManagerRef.current = null;
    }

    return () => {
      if (focusManagerRef.current) {
        focusManagerRef.current.releaseFocus();
      }
    };
  }, [isOpen]);

  // Swipe gesture handling
  useEffect(() => {
    if (!menuRef.current || !capabilities.supportsTouch) return;
    
    const cleanup = handleTouchGesture(menuRef.current);
    return cleanup;
  }, [handleTouchGesture, capabilities.supportsTouch]);

  // Handle touch events for swipe-to-close
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!capabilities.supportsTouch) return;
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || !capabilities.supportsTouch) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    
    // Swipe left to close (minimum 50px movement)
    if (diff > 50) {
      onClose();
    }
    
    setTouchStart(null);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const toggleExpanded = (href: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(href)) {
      newExpanded.delete(href);
    } else {
      newExpanded.add(href);
    }
    setExpandedItems(newExpanded);
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.children) {
      toggleExpanded(item.href);
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  const menuContent = (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Menu Panel */}
      <nav
        ref={menuRef}
        className={cn(
          'fixed left-0 top-0 h-full w-80 max-w-[80vw] bg-white shadow-xl',
          'transform transition-transform duration-300 ease-out',
          'flex flex-col',
          getTouchClasses()
        )}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onKeyDown={handleKeyDown}
        role="navigation"
        aria-label="Mobile Navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Menü
          </h2>
          <button
            onClick={onClose}
            className={cn(
              'rounded-lg p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              'transition-colors duration-200',
              capabilities.supportsTouch ? 'min-h-[44px] min-w-[44px]' : 'h-8 w-8'
            )}
            aria-label="Menü schließen"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-4" role="list">
            {menuItems.map((item) => (
              <li key={item.href}>
                <div className="space-y-1">
                  {item.children ? (
                    // Expandable menu item
                    <button
                      onClick={() => handleItemClick(item)}
                      className={cn(
                        'flex items-center justify-between w-full px-3 py-3 text-left',
                        'text-gray-700 hover:text-gray-900 hover:bg-gray-50',
                        'rounded-lg transition-colors duration-200',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500',
                        capabilities.supportsTouch ? 'min-h-[44px] touch-manipulation' : 'min-h-[36px]'
                      )}
                      aria-expanded={expandedItems.has(item.href)}
                      aria-controls={`submenu-${item.href.replace('/', '')}`}
                    >
                      <div className="flex items-center">
                        <item.icon className="h-5 w-5 mr-3 text-gray-500" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <ChevronRight 
                        className={cn(
                          'h-4 w-4 text-gray-400 transition-transform duration-200',
                          expandedItems.has(item.href) && 'rotate-90'
                        )}
                      />
                    </button>
                  ) : (
                    // Regular menu item
                    <Link
                      href={item.href}
                      onClick={() => onClose()}
                      className={cn(
                        'flex items-center px-3 py-3',
                        'text-gray-700 hover:text-gray-900 hover:bg-gray-50',
                        'rounded-lg transition-colors duration-200',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500',
                        capabilities.supportsTouch ? 'min-h-[44px] touch-manipulation' : 'min-h-[36px]'
                      )}
                    >
                      <item.icon className="h-5 w-5 mr-3 text-gray-500" />
                      <span className="font-medium">{item.label}</span>
                      {item.badge && (
                        <span 
                          className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full"
                          aria-label={`${item.badge} items`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )}
                  
                  {/* Submenu */}
                  {item.children && expandedItems.has(item.href) && (
                    <ul 
                      id={`submenu-${item.href.replace('/', '')}`}
                      className="ml-8 space-y-1 mt-1"
                      role="list"
                    >
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            onClick={() => onClose()}
                            className={cn(
                              'block px-3 py-2 text-sm',
                              'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
                              'rounded-lg transition-colors duration-200',
                              'focus:outline-none focus:ring-2 focus:ring-blue-500',
                              capabilities.supportsTouch ? 'min-h-[44px] touch-manipulation' : 'min-h-[32px]'
                            )}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <Link
            href="/cart"
            onClick={() => onClose()}
            className={cn(
              'flex items-center justify-center w-full px-4 py-3',
              'bg-black text-white font-medium rounded-lg',
              'hover:bg-gray-800 transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              capabilities.supportsTouch ? 'min-h-[44px] touch-manipulation' : 'min-h-[40px]'
            )}
          >
            <ShoppingBag className="h-5 w-5 mr-2" />
            <span>Warenkorb</span>
            {cartItemCount > 0 && (
              <span 
                className="ml-2 bg-white text-black text-xs font-bold px-2 py-1 rounded-full"
                aria-label={`${cartItemCount} Artikel im Warenkorb`}
              >
                {cartItemCount}
              </span>
            )}
          </Link>
        </div>
        
        {/* Accessibility hint for swipe gesture */}
        {capabilities.supportsTouch && (
          <div className="sr-only" aria-live="polite">
            Wischen Sie nach links, um das Menü zu schließen
          </div>
        )}
      </nav>
    </div>
  );

  // Render in portal for proper z-index layering
  return typeof window !== 'undefined' 
    ? createPortal(menuContent, document.body)
    : menuContent;
}

// Mobile Menu Trigger Button
interface MobileMenuButtonProps {
  onClick: () => void;
  className?: string;
}

export function MobileMenuButton({ onClick, className }: MobileMenuButtonProps) {
  const { capabilities, getTouchClasses } = useMobileUX();
  
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-lg p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100',
        'focus:outline-none focus:ring-2 focus:ring-blue-500',
        'transition-colors duration-200',
        getTouchClasses(),
        capabilities.supportsTouch ? 'min-h-[44px] min-w-[44px]' : 'h-8 w-8',
        className
      )}
      aria-label="Menü öffnen"
      aria-expanded={false}
      aria-controls="mobile-menu"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}
