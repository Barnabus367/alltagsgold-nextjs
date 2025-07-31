import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SearchBar } from '@/components/common/SearchBar';
import { CartButton } from '@/components/cart/CartButton';
import { Menu, Search } from 'lucide-react';
import { useCollections } from '@/hooks/useShopify';
import { useMobileUX } from '@/hooks/useMobileUX';
import { FocusManager, announceToScreenReader } from '@/lib/accessibility';

interface HeaderProps {
  onSearch: (query: string) => void;
}

export function Header({ onSearch }: HeaderProps) {
  const router = useRouter();
  const { data: collections = [] } = useCollections();
  const { capabilities, getTouchClasses } = useMobileUX();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const focusManager = useRef(new FocusManager());
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // HULL-style adaptive header behavior
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Focus Management für Mobile Menu
  useEffect(() => {
    if (mobileMenuOpen && mobileMenuRef.current) {
      const cleanup = focusManager.current.trapFocus(mobileMenuRef.current);
      announceToScreenReader('Navigation geöffnet');
      
      return cleanup;
    }
  }, [mobileMenuOpen]);

  const mainCollections = collections.slice(0, 4);

  const navItems = [
    { title: 'SHOP', href: '/collections', ariaLabel: 'Zu allen Produktkategorien' },
    { title: 'ÜBER UNS', href: '/ueber-uns', ariaLabel: 'Über Alltagsgold erfahren' },
    { title: 'BLOG', href: '/blog', ariaLabel: 'Zum Blog' },
    { title: 'KONTAKT', href: '/contact', ariaLabel: 'Zur Kontaktseite' },
  ];

  // Determine header style based on page and scroll
  const isHomePage = router.pathname === '/';
  const isLightBackground = !isHomePage || isScrolled;
  
  const headerClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
    isLightBackground 
      ? 'bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm' 
      : 'bg-transparent'
  } ${getTouchClasses()}`;
  
  const textClasses = `transition-colors duration-300 ${
    isLightBackground ? 'text-black hover:text-gray-600' : 'text-white hover:text-gray-300'
  }`;
  
  const logoClasses = `transition-colors duration-300 ${
    isLightBackground ? 'text-black' : 'text-white'
  }`;

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    announceToScreenReader(mobileMenuOpen ? 'Navigation geschlossen' : 'Navigation geöffnet');
  };

  const handleSearchToggle = () => {
    setMobileSearchOpen(!mobileSearchOpen);
    announceToScreenReader(mobileSearchOpen ? 'Suche geschlossen' : 'Suche geöffnet');
  };

  return (
    <header className={headerClasses} role="banner">
      {/* Skip Links für Accessibility */}
      <div className="sr-only">
        <a href="#main-content" className="skip-link">
          Zum Hauptinhalt springen
        </a>
        <a href="#navigation" className="skip-link">
          Zur Navigation springen
        </a>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Header */}
        <div className="flex items-center justify-between h-16">
          {/* Left Navigation */}
          <nav 
            className="hidden md:flex items-center space-x-8" 
            role="navigation" 
            aria-label="Hauptnavigation"
            id="navigation"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-normal tracking-wide ${textClasses} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded px-2 py-1`}
                aria-label={item.ariaLabel}
              >
                {item.title}
              </Link>
            ))}
          </nav>

          {/* Center Logo */}
          <Link 
            href="/" 
            className="absolute left-1/2 transform -translate-x-1/2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded"
            aria-label="AlltagsGold Startseite"
          >
            <Image
              src={"/alltagsgold-logo.png"}
              alt="AlltagsGold Logo"
              width={200}
              height={60}
              className="h-12 w-auto object-contain"
              priority
            />
          </Link>

          {/* Right Actions */}
          <div className="flex items-center space-x-6">
            
            <CartButton textClasses={textClasses} />

            {/* Mobile Menu - Touch-optimiert */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  className={`md:hidden ${capabilities.isMobile ? 'min-h-[48px] min-w-[48px]' : 'min-h-[44px] min-w-[44px]'} p-3 touch-manipulation focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  onClick={handleMobileMenuToggle}
                  aria-label="Hauptnavigation öffnen"
                  aria-expanded={mobileMenuOpen}
                  aria-controls="mobile-navigation"
                >
                  <Menu className="h-6 w-6" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent 
                side="right" 
                className={`${capabilities.isMobile ? 'w-full' : 'w-80'} bg-white`}
                ref={mobileMenuRef}
                id="mobile-navigation"
                aria-label="Mobile Navigation"
              >
                <div className="flex flex-col space-y-6 mt-8">
                  <div className="pb-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Navigation</h2>
                    <nav className="space-y-3" role="navigation" aria-label="Mobile Navigation">
                      {navItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="block text-gray-600 hover:text-gray-900 transition-colors py-2 px-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-blue-50"
                          onClick={() => setMobileMenuOpen(false)}
                          aria-label={item.ariaLabel}
                        >
                          {item.title}
                        </Link>
                      ))}
                    </nav>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Kundenservice</h3>
                    <div className="space-y-3 text-sm">
                      <Link 
                        href="/contact" 
                        className="block text-gray-600 hover:text-gray-900 py-2 px-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-blue-50"
                        onClick={() => setMobileMenuOpen(false)}
                        aria-label="Zur Kontaktseite"
                      >
                        Kontakt
                      </Link>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {mobileSearchOpen && (
          <div 
            className="sm:hidden py-3 border-t border-gray-200 animate-slide-up"
            role="search"
            aria-label="Mobile Produktsuche"
          >
            <SearchBar 
              onSearch={(query) => {
                onSearch(query);
                setMobileSearchOpen(false);
              }}
              placeholder="Produkte suchen..."
              className="w-full"
            />
          </div>
        )}
      </div>
    </header>
  );
}