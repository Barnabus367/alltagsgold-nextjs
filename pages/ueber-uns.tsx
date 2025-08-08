import { NextSEOHead } from '@/components/seo/NextSEOHead';
import { Layout } from '@/components/layout/Layout';
import Link from 'next/link';
import { Package, Truck, RotateCcw, CheckCircle, Mail, Phone, MapPin, ArrowRight, Shield, Recycle, Heart, ChevronDown, ChevronUp, Clock, Award } from '@/lib/icons';
import { useState } from 'react';
import dynamic from 'next/dynamic';

const RevealWrapper = dynamic(() => import('@/components/product/RevealWrapper').then(mod => mod.RevealWrapper), {
  ssr: true,
  loading: () => <div />
});
import { usePageTitle, formatPageTitle } from '@/hooks/usePageTitle';
import { generateStaticPageSEO } from '@/lib/seo';
import Script from 'next/script';
import { generateLocalBusinessStructuredData, generateBreadcrumbStructuredData } from '@/lib/structured-data';

export default function UeberUns() {
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  usePageTitle(formatPageTitle('Über uns'));

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  const seoData = generateStaticPageSEO('ueber-uns',
    'Über uns | Schweizer Qualität direkt geliefert | Alltagsgold',
    'Erfahre mehr über Alltagsgold: Kuratierte Produkte, Schweizer Lager, Blitzversand. Kein Dropshipping, nur echte Qualität direkt aus der Schweiz.'
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
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
          {/* Hero Section */}
          <RevealWrapper animation="fade-up">
            <section className="relative py-20 px-4 sm:px-6 lg:px-8 text-center">
              <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                  Schweizer Qualität. Direkt geliefert. Ohne Umwege.
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                  Bei alltagsgold findest du nur Produkte, die wir selbst getestet, gelagert und sofort aus der Schweiz versenden.
                </p>
                <Link href="/collections" className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-lg hover:bg-gray-800 transition-colors">
                  Jetzt Sortiment entdecken
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </section>
          </RevealWrapper>

          {/* 4-Säulen Grid - Was uns unterscheidet */}
          <RevealWrapper animation="fade-up" delay={0.1}>
            <section className="py-16 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Was uns unterscheidet</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-amber-700" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Kuratiertes Sortiment</h3>
                    <p className="text-gray-600 text-sm">Wir wählen jede Neuheit nach Nutzen, Langlebigkeit und Design aus.</p>
                  </div>
                  
                  <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="h-8 w-8 text-amber-700" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">CH-Lager</h3>
                    <p className="text-gray-600 text-sm">Alle Artikel liegen in unserem Lager bei Zürich – kein Drop-Shipping.</p>
                  </div>
                  
                  <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Truck className="h-8 w-8 text-amber-700" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Blitzversand</h3>
                    <p className="text-gray-600 text-sm">Bestellungen bis 14 Uhr gehen noch am selben Tag raus, CO₂-kompensiert mit der Post.</p>
                  </div>
                  
                  <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <RotateCcw className="h-8 w-8 text-amber-700" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">30 Tage Rückgabe</h3>
                    <p className="text-gray-600 text-sm">Ohne Wenn & Aber. Unbenutzt zurück – Geld zurück.</p>
                  </div>
                </div>
              </div>
            </section>
          </RevealWrapper>

          {/* Unsere Mission */}
          <RevealWrapper animation="fade-up" delay={0.2}>
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-amber-50">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Unsere Mission</h2>
                <blockquote className="text-2xl text-gray-700 italic mb-6">
                  „Wir machen alltägliche Dinge zu kleinen Goldstücken, die deinen Tag einfacher oder schöner machen."
                </blockquote>
                <p className="text-lg text-gray-600">
                  Dafür setzen wir auf drei einfache Prinzipien: <strong>Qualität</strong> {'>'} <strong>Transparenz</strong> {'>'} <strong>lokaler Service</strong>.
                </p>
              </div>
            </section>
          </RevealWrapper>

          {/* So arbeiten wir - Timeline */}
          <RevealWrapper animation="fade-up" delay={0.3}>
            <section className="py-16 px-4 sm:px-6 lg:px-8">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">So arbeiten wir</h2>
                <div className="relative">
                  {/* Timeline Line - nur auf Desktop */}
                  <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gray-300 -translate-y-1/2"></div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative">
                    {/* Step 1 */}
                    <div className="bg-white p-6 rounded-lg shadow-md relative">
                      <div className="w-12 h-12 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold mb-4 mx-auto lg:mx-0">1</div>
                      <h3 className="font-semibold text-xl mb-3">Idee & Auswahl</h3>
                      <ul className="space-y-2 text-gray-600 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-amber-600 mt-1">•</span>
                          <span>Markt- und Trend-Scans</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-600 mt-1">•</span>
                          <span>Prototyp-Tests im eigenen Alltag</span>
                        </li>
                      </ul>
                    </div>
                    
                    {/* Step 2 */}
                    <div className="bg-white p-6 rounded-lg shadow-md relative">
                      <div className="w-12 h-12 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold mb-4 mx-auto lg:mx-0">2</div>
                      <h3 className="font-semibold text-xl mb-3">Qualitäts-Check</h3>
                      <ul className="space-y-2 text-gray-600 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-amber-600 mt-1">•</span>
                          <span>Prüfkatalog (Material, Verarbeitung, Sicherheit)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-600 mt-1">•</span>
                          <span>Nur 1 von 5 Kandidaten schafft es ins Sortiment</span>
                        </li>
                      </ul>
                    </div>
                    
                    {/* Step 3 */}
                    <div className="bg-white p-6 rounded-lg shadow-md relative">
                      <div className="w-12 h-12 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold mb-4 mx-auto lg:mx-0">3</div>
                      <h3 className="font-semibold text-xl mb-3">Lager & Fulfillment</h3>
                      <ul className="space-y-2 text-gray-600 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-amber-600 mt-1">•</span>
                          <span>1'200 m² Lagerfläche in der Schweiz</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-600 mt-1">•</span>
                          <span>Barcode-Kontrolle + plastikfreies Verpackungsmaterial</span>
                        </li>
                      </ul>
                    </div>
                    
                    {/* Step 4 */}
                    <div className="bg-white p-6 rounded-lg shadow-md relative">
                      <div className="w-12 h-12 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold mb-4 mx-auto lg:mx-0">4</div>
                      <h3 className="font-semibold text-xl mb-3">Kundensupport</h3>
                      <ul className="space-y-2 text-gray-600 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-amber-600 mt-1">•</span>
                          <span>E-Mail-Antworten {'<'} 24 h</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-600 mt-1">•</span>
                          <span>Reparatur- oder Ersatzservice direkt aus Zürich</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </RevealWrapper>

          {/* Zahlen & Fakten */}
          <RevealWrapper animation="fade-up" delay={0.4}>
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
              <div className="max-w-5xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-12">Zahlen & Fakten</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                  <div className="p-6">
                    <div className="text-5xl font-bold mb-2 text-amber-500">{'>'} 25'000</div>
                    <div className="text-gray-300">Bestellungen seit 2021</div>
                  </div>
                  <div className="p-6">
                    <div className="text-5xl font-bold mb-2 text-amber-500">98%</div>
                    <div className="text-gray-300">positive Bewertungen*</div>
                  </div>
                  <div className="p-6">
                    <div className="text-5xl font-bold mb-2 text-amber-500">{'<'} 1%</div>
                    <div className="text-gray-300">Retourenquote</div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 text-center mt-8">
                  *Quelle: interne Kundenzufriedenheits-Umfrage, 2023
                </p>
              </div>
            </section>
          </RevealWrapper>

          {/* Nachhaltigkeit in Kürze */}
          <RevealWrapper animation="fade-up" delay={0.5}>
            <section className="py-16 px-4 sm:px-6 lg:px-8">
              <div className="max-w-5xl mx-auto">
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Nachhaltigkeit in Kürze</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="flex items-start gap-4 p-6 bg-green-50 rounded-lg">
                    <Shield className="h-8 w-8 text-green-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-2">CO₂-kompensierter Versand</h3>
                      <p className="text-gray-600 text-sm">Swiss Climate Zertifikat</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-6 bg-green-50 rounded-lg">
                    <Recycle className="h-8 w-8 text-green-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-2">Recycling-Programm</h3>
                      <p className="text-gray-600 text-sm">Upcycling-Programm für Elektroartikel</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-6 bg-green-50 rounded-lg">
                    <Heart className="h-8 w-8 text-green-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-2">Soziale Partnerschaften</h3>
                      <p className="text-gray-600 text-sm">Mit Schweizer Sozialwerkstätten für Verpackung</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </RevealWrapper>

          {/* Servicegebiet & Kontakt - Accordion */}
          <RevealWrapper animation="fade-up" delay={0.6}>
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Servicegebiet & Kontakt</h2>
                <div className="space-y-4">
                  {/* Versandgebiet */}
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <button
                      onClick={() => toggleAccordion('versand')}
                      className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-amber-600" />
                        <span className="font-semibold">Versandgebiet</span>
                      </div>
                      <span className="text-gray-400">
                        {openAccordion === 'versand' ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </span>
                    </button>
                    {openAccordion === 'versand' && (
                      <div className="px-6 pb-4 text-gray-600">
                        <p className="font-medium mb-2">Ganze Schweiz + Liechtenstein</p>
                        <ul className="space-y-1 text-sm">
                          <li>• Zürich - Lieferung am nächsten Tag</li>
                          <li>• Basel, Bern, Luzern - 1-2 Werktage</li>
                          <li>• Restliche Schweiz - 2-3 Werktage</li>
                          <li>• Liechtenstein - 2-3 Werktage</li>
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Abholungen */}
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <button
                      onClick={() => toggleAccordion('abholung')}
                      className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-amber-600" />
                        <span className="font-semibold">Abholungen</span>
                      </div>
                      <span className="text-gray-400">
                        {openAccordion === 'abholung' ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </span>
                    </button>
                    {openAccordion === 'abholung' && (
                      <div className="px-6 pb-4 text-gray-600">
                        <p>Mo–Fr 08–18 Uhr (nach Absprache)</p>
                        <p className="text-sm mt-2">Direktabholung bei unserem Lager in der Region Zürich möglich</p>
                      </div>
                    )}
                  </div>

                  {/* Kontakt */}
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <button
                      onClick={() => toggleAccordion('kontakt')}
                      className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-amber-600" />
                        <span className="font-semibold">Kontakt</span>
                      </div>
                      <span className="text-gray-400">
                        {openAccordion === 'kontakt' ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </span>
                    </button>
                    {openAccordion === 'kontakt' && (
                      <div className="px-6 pb-4 text-gray-600 space-y-2">
                        <p className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          support@alltagsgold.ch
                        </p>
                        <p className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          +41 44 000 00 00
                        </p>
                        <p className="text-sm mt-3">Antwortzeit: Innerhalb von 24 Stunden (Mo-Fr)</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </RevealWrapper>

          {/* Schluss-CTA */}
          <RevealWrapper animation="fade-up" delay={0.7}>
            <section className="py-20 px-4 sm:px-6 lg:px-8 text-center bg-gradient-to-b from-gray-900 to-black text-white">
              <div className="max-w-3xl mx-auto">
                <Award className="w-16 h-16 text-amber-500 mx-auto mb-6" />
                <h2 className="text-3xl font-bold mb-4">Bereit, den Unterschied zu erleben?</h2>
                <p className="text-xl text-gray-300 mb-8">
                  Entdecke unsere aktuellen Favoriten – alle auf Lager und in 24-48 h bei dir.
                </p>
                <Link href="/collections" className="inline-flex items-center gap-2 bg-amber-600 text-white px-8 py-4 rounded-lg hover:bg-amber-700 transition-colors">
                  Zu den Produkten
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </section>
          </RevealWrapper>
        </div>
      </Layout>
    </>
  );
}