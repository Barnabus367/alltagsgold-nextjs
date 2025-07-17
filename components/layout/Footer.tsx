import { Instagram } from 'lucide-react';
import { SiTiktok } from 'react-icons/si';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useCollections } from '@/hooks/useShopify';

export function Footer() {
  const { data: collections = [] } = useCollections();
  
  // Get the first 4 collections for the footer
  const footerCollections = collections.slice(0, 4);

  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand & Newsletter */}
          <div className="md:col-span-1">
            <h3 className="text-2xl font-light mb-6 tracking-wide">AlltagsGold</h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Innovative Produkte, die den Alltag in kostbare Momente verwandeln.
            </p>
            
            <div className="space-y-4">
              <h4 className="text-sm font-medium tracking-wide">Newsletter</h4>
              <div className="flex">
                <Input
                  type="email"
                  placeholder="Ihre E-Mail-Adresse"
                  className="bg-transparent border-white text-white placeholder-gray-400 focus:border-gray-300 rounded-none flex-1"
                />
                <Button className="bg-white text-black hover:bg-gray-100 rounded-none px-6 ml-2">
                  Anmelden
                </Button>
              </div>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="text-sm font-medium tracking-wide mb-6">Shop</h4>
            <ul className="space-y-4 text-sm">
              <li>
                <Link href="/collections" className="text-gray-300 hover:text-white transition-colors">
                  Alle Produkte
                </Link>
              </li>
              {footerCollections.map((collection: any) => (
                <li key={collection.id}>
                  <Link 
                    href={`/collections/${collection.handle}`} 
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {collection.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service & Social */}
          <div>
            <h4 className="text-sm font-medium tracking-wide mb-6">Service</h4>
            <ul className="space-y-3 text-sm mb-6">
              <li>
                <Link href="/blog" className="text-gray-300 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Kontakt
                </Link>
              </li>
              <li>
                <Link href="/impressum" className="text-gray-300 hover:text-white transition-colors">
                  Impressum
                </Link>
              </li>
              <li>
                <Link href="/datenschutz" className="text-gray-300 hover:text-white transition-colors">
                  Datenschutz
                </Link>
              </li>
              <li>
                <Link href="/agb" className="text-gray-300 hover:text-white transition-colors">
                  AGB
                </Link>
              </li>
            </ul>
            
            <div>
              <h4 className="text-sm font-medium tracking-wide mb-4">Folgen Sie uns</h4>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="p-2 text-gray-300 hover:text-white hover:bg-white/10">
                  <Instagram className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2 text-gray-300 hover:text-white hover:bg-white/10">
                  <SiTiktok className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-16 pt-8 text-center">
          <p className="text-sm text-gray-400">
            © 2024 AlltagsGold – Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </footer>
  );
}