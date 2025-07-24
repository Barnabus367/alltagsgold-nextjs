import { SEOHead } from '../components/seo/SEOHead';
import { generateStaticPageSEO } from '../lib/seo';

export function Impressum() {
  // Generate SEO metadata for Impressum page
  const seoData = generateStaticPageSEO('impressum');
 
  return (
    <div className="min-h-screen bg-white pt-16">
      <SEOHead seo={seoData} canonicalUrl="/impressum" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-gray max-w-none">
          <h1 className="text-4xl font-light text-black mb-8">Impressum</h1>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-light text-black mb-4">Angaben zum Unternehmen</h2>
              <div className="space-y-4 text-gray-700">
                <p><strong>Firmenname:</strong> alltagsgold</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-black mb-4">Kontakt</h2>
              <div className="space-y-4 text-gray-700">
                <p><strong>E-Mail:</strong> <a href="mailto:hallo@alltagsgold.ch" className="text-blue-600 hover:underline">hallo@alltagsgold.ch</a></p>
                <p><strong>Website:</strong> <a href="http://www.alltagsgold.ch" className="text-blue-600 hover:underline">www.alltagsgold.ch</a></p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-black mb-4">Haftungsausschluss</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Die Inhalte dieser Website wurden mit höchstmöglicher Sorgfalt erstellt. Gleichwohl übernimmt Alltagsgold keinerlei Gewähr für die Aktualität, Korrektheit, Vollständigkeit oder Qualität der bereitgestellten Informationen.
                </p>
                <p>
                  Haftungsansprüche gegen alltagsgold, welche sich auf Schäden materieller oder ideeller Art beziehen, die durch die Nutzung oder Nichtnutzung der dargebotenen Informationen bzw. durch die Nutzung fehlerhafter und unvollständiger Informationen verursacht wurden, sind grundsätzlich ausgeschlossen.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-black mb-4">Urheberrecht</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Alle durch die Seitenbetreiber erstellten Inhalte und Werke auf dieser Website unterliegen dem schweizerischen Urheberrecht. Jede Art der Vervielfältigung, Bearbeitung, Verbreitung und Verwertung ausserhalb der Grenzen des Urheberrechts bedarf der vorherigen schriftlichen Zustimmung des jeweiligen Urhebers bzw. Erstellers.
                </p>
                <p>
                  Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet. Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-black mb-4">Rechtswirksamkeit</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Dieser Haftungsausschluss ist als Teil des Internetangebotes zu betrachten, von dem aus auf diese Seite verwiesen wurde. Sofern Teile oder einzelne Formulierungen dieses Textes der geltenden Rechtslage nicht, nicht mehr oder nicht vollständig entsprechen sollten, bleiben die übrigen Teile des Dokumentes in ihrem Inhalt und ihrer Gültigkeit davon unberührt.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-black mb-4">Online-Streitbeilegung</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit, welche unter folgendem Link erreichbar ist: <a href="https://ec.europa.eu/consumers/odr/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr/</a>. Unsere E-Mail-Adresse finden Sie oben im Impressum.
                </p>
                <p>
                  Alltagsgold ist weder bereit noch verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Impressum;