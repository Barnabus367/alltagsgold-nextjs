/**
 * Navigation Diagnostics Test Page
 * Einfache Seite zum Testen der SSG/ISR Hydration-Analyse
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Layout } from '../components/layout/Layout';
import { NextSEOHead } from '../components/seo/NextSEOHead';
import { generateStaticPageSEO } from '../lib/seo';

export default function NavigationTestPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [diagnostics, setDiagnostics] = useState<any>(null);

  useEffect(() => {
    // Navigation Diagnostics laden
    if (typeof window !== 'undefined') {
      const interval = setInterval(() => {
        const diagnosticsInstance = (window as any).navigationDiagnostics;
        if (diagnosticsInstance) {
          setDiagnostics(diagnosticsInstance.getCurrentDiagnostics());
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, []);

  const seoData = generateStaticPageSEO('navigation-test', 'Navigation Test', 'Test-Seite für Navigation-Diagnostics');

  return (
    <>
      <NextSEOHead seo={seoData} canonicalUrl="/navigation-test" />
      <Layout onSearch={setSearchQuery}>
        <div className="min-h-screen bg-white pt-16">
          <div className="max-w-4xl mx-auto px-6 py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Navigation Diagnostics Test
            </h1>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-blue-900 mb-4">
                🔬 Test-Anleitung
              </h2>
              <ol className="list-decimal list-inside space-y-2 text-blue-800">
                <li>Öffne die Browser-Konsole (F12)</li>
                <li>Navigiere zu einer Collection-Seite</li>
                <li>Klicke auf ein Produkt</li>
                <li>Verwende den Browser-Zurück-Button</li>
                <li>Beobachte die Konsolen-Ausgaben</li>
              </ol>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Test Collection-Seiten
                </h3>
                <div className="space-y-2">
                  <Link href="/collections/technik-gadgets" className="block text-blue-600 hover:text-blue-800">
                    → Technik & Gadgets
                  </Link>
                  <Link href="/collections/kueche" className="block text-blue-600 hover:text-blue-800">
                    → Küche
                  </Link>
                  <Link href="/collections/haushaltsgerate" className="block text-blue-600 hover:text-blue-800">
                    → Haushaltsgeräte
                  </Link>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Erwartete Konsolen-Ausgaben
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>🏷️ Collection Page Mount</div>
                  <div>🛍️ Product Page Mount</div>
                  <div>⬅️ PopState Event (Back Button)</div>
                  <div>🔬 Product→Collection Diagnose</div>
                </div>
              </div>
            </div>

            {diagnostics && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  📊 Aktuelle Navigation-Diagnostics
                </h3>
                <pre className="text-xs text-gray-600 overflow-auto">
                  {JSON.stringify(diagnostics, null, 2)}
                </pre>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-900 mb-4">
                ⚠️ Bekannte Navigation-Probleme
              </h3>
              <ul className="list-disc list-inside space-y-2 text-yellow-800">
                <li>Back-Button ändert URL aber nicht Seiteninhalt</li>
                <li>SSG-Cache vs. Client-State Konflikte</li>
                <li>Component-State bleibt zwischen Routen bestehen</li>
                <li>Hydration-Mismatches bei Navigation</li>
              </ul>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
