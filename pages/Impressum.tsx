import { SEOHelmet } from '@/components/SEOHelmet';

export function Impressum() {
  return (
    <div className="min-h-screen bg-white pt-16">
      <SEOHelmet 
        title="Impressum - Rechtliche Angaben"
        description="Impressum und rechtliche Angaben zu AlltagsGold. Kontaktdaten, Verantwortliche und gesetzlich vorgeschriebene Informationen zum Unternehmen."
        canonicalUrl="/impressum"
        type="article"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-gray max-w-none">
          <h1 className="text-4xl font-light text-black mb-8">Impressum</h1>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-light text-black mb-4">Angaben zum Unternehmen</h2>
              <div className="space-y-2 text-gray-700">
                <p><strong>Firmenname:</strong> Alltagsgold</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-black mb-4">Kontakt</h2>
              <div className="space-y-2 text-gray-700">
                <p><strong>E-Mail:</strong> <a href="mailto:hallo@alltagsgold.ch" className="text-blue-600 hover:underline">hallo@alltagsgold.ch</a></p>
                <p><strong>Website:</strong> <a href="http://www.alltagsgold.ch" className="text-blue-600 hover:underline">www.alltagsgold.ch</a></p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-black mb-4">Verantwortlich für den Inhalt gemäss Art. 322 StGB und Art. 28 ZGB</h2>
              <div className="text-gray-700">
                <p>Alltagsgold</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-black mb-4">Haftungsausschluss</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Die Inhalte dieser Website wurden mit höchstmöglicher Sorgfalt erstellt. Gleichwohl übernimmt Alltagsgold keinerlei Gewähr für die Aktualität, Korrektheit, Vollständigkeit oder Qualität der bereitgestellten Informationen. Haftungsansprüche gegen Alltagsgold, die sich auf Schäden materieller oder immaterieller Art beziehen, welche durch Nutzung oder Nichtnutzung der dargebotenen Informationen bzw. durch Nutzung fehlerhafter oder unvollständiger Informationen verursacht wurden, sind grundsätzlich ausgeschlossen, sofern seitens Alltagsgold kein nachweislich vorsätzliches oder grob fahrlässiges Verschulden vorliegt.
                </p>
                <p>
                  Alltagsgold behält sich ausdrücklich vor, Teile der Seiten oder das gesamte Angebot ohne gesonderte Ankündigung zu verändern, zu ergänzen, zu löschen oder die Veröffentlichung zeitweise oder endgültig einzustellen.
                </p>
                <p>
                  Alltagsgold haftet insbesondere nicht für Inhalte fremder Websites, auf die mittels Links direkt oder indirekt verwiesen wird ("Hyperlinks"). Für illegale, fehlerhafte oder unvollständige Inhalte und insbesondere für Schäden, die aus der Nutzung oder Nichtnutzung solcherart dargebotener Informationen entstehen, haftet allein der Anbieter der Seite, auf welche verwiesen wurde, nicht derjenige, der über Links auf die jeweilige Veröffentlichung lediglich verweist.
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
                  Downloads und Kopien der Inhalte dieser Website sind ausschliesslich für den privaten, nicht kommerziellen Gebrauch gestattet. Die kommerzielle Nutzung jeglicher Art bedarf ausdrücklich der vorherigen schriftlichen Zustimmung.
                </p>
                <p>
                  Soweit Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-black mb-4">Online-Streitbeilegung</h2>
              <div className="text-gray-700">
                <p>
                  Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit, welche unter folgendem Link erreichbar ist: <a href="https://ec.europa.eu/consumers/odr/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr/</a>. Unsere E-Mail-Adresse finden Sie oben im Impressum.
                </p>
                <p className="mt-4">
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