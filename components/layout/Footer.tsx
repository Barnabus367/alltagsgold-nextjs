import { Instagram } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useState } from 'react';
import { useCollections } from '@/hooks/useShopify';
import { sendEmail, validateEmail } from '@/lib/email';
import { PaymentMethods } from '@/components/common/PaymentMethods';
import { InternalLinking } from '@/components/seo/InternalLinking';

export function Footer() {
  const { data: collections = [] } = useCollections();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get the first 4 collections for the footer
  const footerCollections = collections.slice(0, 4);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(newsletterEmail)) {
      alert('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await sendEmail('newsletter', {
        email: newsletterEmail,
        source: 'footer'
      });
      
      setNewsletterEmail('');
      alert('E-Mail-Programm wurde geöffnet. Bitte senden Sie die E-Mail ab, um sich für den Newsletter anzumelden.');
    } catch (error) {
      alert('Fehler beim Öffnen des E-Mail-Programms.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand & Newsletter */}
          <div className="md:col-span-1">
            <h3 className="text-2xl font-light mb-6 tracking-wide">
              <span className="text-white">alltags</span><span style={{ color: '#c9a74d' }}>gold</span>
            </h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Innovative Produkte, die den Alltag in kostbare Momente verwandeln.
            </p>
            
            <div className="space-y-4">
              <h4 className="text-sm font-medium tracking-wide">Newsletter</h4>
              <form onSubmit={handleNewsletterSubmit} className="flex">
                <Input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Ihre E-Mail-Adresse"
                  className="bg-transparent border-white text-white placeholder-gray-400 focus:border-gray-300 rounded-none flex-1"
                  required
                />
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-white text-black hover:bg-gray-100 rounded-none px-6 ml-2"
                >
                  {isSubmitting ? 'Wird gesendet...' : 'Anmelden'}
                </Button>
              </form>
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
                <Link href="/ueber-uns" className="text-gray-300 hover:text-white transition-colors">
                  Über uns
                </Link>
              </li>
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
                <Link href="/Datenschutz" className="text-gray-300 hover:text-white transition-colors">
                  Datenschutz
                </Link>
              </li>
              <li>
                <Link href="/AGB" className="text-gray-300 hover:text-white transition-colors">
                  AGB
                </Link>
              </li>
            </ul>
            
            <div>
              <h4 className="text-sm font-medium tracking-wide mb-4">Folgen Sie uns</h4>
              <div className="flex space-x-4">
                <a 
                  href="https://www.instagram.com/alltagsgold.ch/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="AlltagsGold auf Instagram folgen"
                >
                  <Button variant="ghost" size="sm" className="p-2 text-gray-300 hover:text-white hover:bg-white/10">
                    <Instagram className="h-5 w-5" />
                  </Button>
                </a>
                <a 
                  href="https://www.tiktok.com/@alltagsgold.ch?is_from_webapp=1&sender_device=pc"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="AlltagsGold auf TikTok folgen"
                >
                  <Button variant="ghost" size="sm" className="p-2 text-gray-300 hover:text-white hover:bg-white/10">
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 256 256"
                      aria-hidden="true"
                      focusable="false"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill="currentColor"
                        d="M168.7 32c8.7 17.3 23.7 31 41.9 37.7v33.4c-15.5-1.4-30.4-6.3-43.8-14.2v57.4c0 37.5-30.4 68-68 68s-68-30.5-68-68 30.5-68 68-68c3.8 0 7.5.3 11.1 1v35.3a32.9 32.9 0 0 0-11.1-2c-18.3 0-33.1 14.8-33.1 33.1s14.8 33.1 33.1 33.1 33.1-14.8 33.1-33.1V32h36.8z"
                      />
                    </svg>
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <PaymentMethods />
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-400">
            © 2024 <span className="text-white">alltags</span><span style={{ color: '#c9a74d' }}>gold</span> – Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </footer>
  );
}