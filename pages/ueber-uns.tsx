import { Layout } from '@/components/layout/Layout';
import { NextSEOHead } from '@/components/seo/NextSEOHead';
import { generateStaticPageSEO } from '@/lib/seo';
import { generateLocalBusinessStructuredData, generateBreadcrumbStructuredData } from '@/lib/structured-data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState } from 'react';
import { usePageTitle, formatPageTitle } from '@/hooks/usePageTitle';
import { Package, Truck, Users, Heart, MapPin, Clock, CreditCard } from '@/lib/icons';
import Script from 'next/script';

export default function UeberUns() {
  const [searchQuery, setSearchQuery] = useState('');
  usePageTitle(formatPageTitle('Über uns'));
  
  const seoData = generateStaticPageSEO('ueber-uns', 
    'Über Alltagsgold | Haushaltshelfer Shop Zürich | Schweizer Qualität',
    'AlltagsGold Haushaltsware online shop Zürich, Basel, Bern. Premium Küchenhelfer & Lifestyle Produkte. ✓ CH-Lager ✓ Schneller Versand ✓ Lokaler Service'
  );
  
  // Strukturierte Daten für Local SEO
  const localBusinessData = generateLocalBusinessStructuredData();
  const breadcrumbData = generateBreadcrumbStructuredData([
    { name: 'Home', url: 'https://www.alltagsgold.ch' },
    { name: 'Über uns', url: 'https://www.alltagsgold.ch/ueber-uns' }
  ]);

  return (
    <>
      <NextSEOHead seo={seoData} canonicalUrl="/ueber-uns" />
      
      {/* Strukturierte Daten für Local SEO */}
      <Script
        id="local-business-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessData) }}
      />
      <Script
        id="breadcrumb-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      
      <Layout onSearch={setSearchQuery}>
        <div className="min-h-screen bg-white">
          {/* Hero Section */}
          <section className="bg-gradient-to-b from-gray-50 to-white py-20">
            <div className="max-w-4xl mx-auto px-6">
              <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-6 text-center">
                Unser Versprechen: Echte Schweizer Qualität
              </h1>
              <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto">
                Bei Alltagsgold erhalten Sie ausschließlich Produkte, die wir selbst auf Lager haben – 
                direkt aus der Schweiz versendet.
              </p>
            </div>
          </section>

          {/* Warum Alltagsgold */}
          <section className="py-16">
            <div className="max-w-4xl mx-auto px-6">
              <div className="flex items-center gap-3 mb-6">
                <Heart className="w-8 h-8 text-amber-600" />
                <h2 className="text-3xl font-light text-gray-900">Warum Alltagsgold?</h2>
              </div>
              
              <div className="prose prose-lg text-gray-600 space-y-4">
                <p>
                  In einer Zeit, in der Online-Shops oft nur als Vermittler fungieren und Produkte 
                  direkt vom Hersteller in Asien versenden, gehen wir einen anderen Weg. Alltagsgold 
                  wurde gegründet, um Ihnen eine ehrliche Alternative zu bieten.
                </p>
                <p>
                  Jedes Produkt in unserem Shop wurde von uns sorgfältig ausgewählt und geprüft. 
                  Wir lagern alle Artikel in unserem Schweizer Lager – das bedeutet für Sie: 
                  keine wochenlangen Lieferzeiten, keine Zollgebühren und vor allem die Gewissheit, 
                  dass Sie echte Qualität erhalten.
                </p>
                <p>
                  Unser Name ist unser Programm: Wir möchten, dass die Produkte, die Sie bei uns 
                  kaufen, Ihren Alltag bereichern und zu kleinen Goldstücken in Ihrem täglichen 
                  Leben werden.
                </p>
              </div>
            </div>
          </section>

          {/* Logistik aus der Schweiz */}
          <section className="py-16 bg-gray-50">
            <div className="max-w-4xl mx-auto px-6">
              <div className="flex items-center gap-3 mb-6">
                <Truck className="w-8 h-8 text-amber-600" />
                <h2 className="text-3xl font-light text-gray-900">Logistik aus dem Herzen der Schweiz</h2>
              </div>
              
              <div className="prose prose-lg text-gray-600 space-y-4">
                <p>
                  Unser Lager befindet sich im Herzen der Schweiz. Von hier aus versenden wir 
                  täglich Ihre Bestellungen mit der Schweizerischen Post. Das bedeutet für Sie:
                </p>
                
                <ul className="space-y-3 my-6">
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Schnelle Lieferung:</strong> Bestellungen bis 14 Uhr werden noch am gleichen Tag versendet</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Zuverlässiger Versand:</strong> Mit der Schweizer Post als unserem Versandpartner</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Transparente Kosten:</strong> Keine versteckten Gebühren oder Zollkosten</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Umweltbewusst:</strong> Kurze Transportwege innerhalb der Schweiz</span>
                  </li>
                </ul>
                
                <p>
                  Wir sind stolz darauf, dass wir Ihnen einen Service bieten können, der sich 
                  durch Schweizer Zuverlässigkeit und Qualität auszeichnet. Bei uns wissen Sie 
                  immer, woher Ihre Produkte kommen und wann sie bei Ihnen ankommen.
                </p>
              </div>
            </div>
          </section>

          {/* Team Section */}
          <section className="py-16">
            <div className="max-w-4xl mx-auto px-6">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-8 h-8 text-amber-600" />
                <h2 className="text-3xl font-light text-gray-900">Das Team hinter Alltagsgold</h2>
              </div>
              
              <div className="prose prose-lg text-gray-600 mb-8">
                <p>
                  Hinter Alltagsgold steht ein kleines, aber leidenschaftliches Team von 
                  E-Commerce-Enthusiasten. Wir alle teilen die gleiche Vision: Online-Shopping 
                  soll einfach, transparent und vertrauenswürdig sein.
                </p>
              </div>
              
              {/* Team Member Placeholders */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
                  <h3 className="font-medium text-lg text-gray-900">Geschäftsführung</h3>
                  <p className="text-gray-600 mt-1">Verantwortlich für Vision und Strategie</p>
                </div>
                
                <div className="text-center">
                  <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
                  <h3 className="font-medium text-lg text-gray-900">Produktmanagement</h3>
                  <p className="text-gray-600 mt-1">Kuratiert unsere Produktauswahl</p>
                </div>
                
                <div className="text-center">
                  <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
                  <h3 className="font-medium text-lg text-gray-900">Kundenservice</h3>
                  <p className="text-gray-600 mt-1">Immer für Sie da</p>
                </div>
              </div>
            </div>
          </section>

          {/* Local SEO Section - Servicegebiet */}
          <section className="py-16 bg-white">
            <div className="max-w-4xl mx-auto px-6">
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="w-8 h-8 text-amber-600" />
                <h2 className="text-3xl font-light text-gray-900">Unser Servicegebiet</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-medium text-lg text-gray-900 mb-4">Hauptstandort</h3>
                  <div className="space-y-3 text-gray-600">
                    <p>
                      <strong>Alltagsgold GmbH</strong><br />
                      Online Shop für Haushaltshelfer<br />
                      Zürich, Schweiz
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-amber-600" />
                      <span>Mo-Fr: 8:00 - 18:00 Uhr</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-amber-600" />
                      <span>Zahlungsmethoden: Kreditkarte, PayPal, Twint, Rechnung</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-lg text-gray-900 mb-4">Liefergebiete</h3>
                  <div className="space-y-2 text-gray-600">
                    <p className="font-medium">Schnellversand in die ganze Schweiz:</p>
                    <ul className="space-y-1 ml-4">
                      <li>• Zürich - Haushaltsware online shop</li>
                      <li>• Basel - Küchenhelfer Lieferung</li>
                      <li>• Bern - Lifestyle Produkte Versand</li>
                      <li>• Luzern - Alltagshelfer Shop</li>
                      <li>• St. Gallen - Premium Haushaltswaren</li>
                      <li>• Ganze Deutschschweiz</li>
                    </ul>
                    <p className="text-sm mt-3 text-amber-600">
                      ✓ Bestellungen bis 14 Uhr = Versand am gleichen Tag
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-6 bg-amber-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Warum lokal bei Alltagsgold kaufen?</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>✓ Schweizer Unternehmen mit lokalem Service</li>
                  <li>✓ Persönliche Beratung in deutscher Sprache</li>
                  <li>✓ Schneller Versand aus CH-Lager - keine Zollgebühren</li>
                  <li>✓ Support für Haushaltshelfer in Zürich, Basel, Bern</li>
                </ul>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 bg-gray-50">
            <div className="max-w-4xl mx-auto px-6 text-center">
              <Package className="w-16 h-16 text-amber-600 mx-auto mb-6" />
              <h2 className="text-3xl font-light text-gray-900 mb-4">
                Bereit, den Unterschied zu erleben?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Entdecken Sie unsere sorgfältig ausgewählten Produkte – 
                alle auf Lager und sofort versandbereit.
              </p>
              <Link href="/collections">
                <Button size="lg" className="bg-black hover:bg-gray-800 text-white px-8 py-3">
                  Zu den Produkten
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </Layout>
    </>
  );
}