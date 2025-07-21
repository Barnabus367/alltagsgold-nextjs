import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SearchBar } from '@/components/common/SearchBar';
import { CartButton } from '@/components/cart/CartButton';
import { Menu, Heart, Search } from 'lucide-react';
import { useCollections } from '@/hooks/useShopify';

interface HeaderProps {
  onSearch: (query: string) => void;
}

export function Header({ onSearch }: HeaderProps) {
  const router = useRouter();
  const { data: collections = [] } = useCollections();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // HULL-style adaptive header behavior
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const mainCollections = collections.slice(0, 4);

  const navItems = [
    { title: 'SHOP', href: '/collections' },
    { title: 'BLOG', href: '/blog' },
    { title: 'KONTAKT', href: '/contact' },
  ];

  // Determine header style based on page and scroll
  const isHomePage = router.pathname === '/';
  const isLightBackground = !isHomePage || isScrolled;
  
  const headerClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
    isLightBackground 
      ? 'bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm' 
      : 'bg-transparent'
  }`;
  
  const textClasses = `transition-colors duration-300 ${
    isLightBackground ? 'text-black hover:text-gray-600' : 'text-white hover:text-gray-300'
  }`;
  
  const logoClasses = `transition-colors duration-300 ${
    isLightBackground ? 'text-black' : 'text-white'
  }`;

  return (
    <header className={headerClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Header */}
        <div className="flex items-center justify-between h-16">
          {/* Left Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-normal tracking-wide ${textClasses}`}
              >
                {item.title}
              </Link>
            ))}
          </nav>

          {/* Center Logo */}
          <Link href="/" className="absolute left-1/2 transform -translate-x-1/2">
            <Image
      src={"/alltagsgold-logo.png"}
      alt="AlltagsGold"
      width={200}
      height={60}
      className="h-12 w-auto object-contain"
      priority
    />
          </Link>

          {/* Right Actions */}
          <div className="flex items-center space-x-6">
            
            <CartButton textClasses={textClasses} />

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden p-2 text-gray-600">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-white">
                <div className="flex flex-col space-y-6 mt-8">
                  <div className="pb-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Navigation</h2>
                    <nav className="space-y-3">
                      {navItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="block text-gray-600 hover:text-gray-900 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {item.title}
                        </Link>
                      ))}
                    </nav>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Kundenservice</h3>
                    <div className="space-y-3 text-sm">
                      <Link href="/contact" className="block text-gray-600 hover:text-gray-900">
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
          <div className="sm:hidden py-3 border-t border-gray-200 animate-slide-up">
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