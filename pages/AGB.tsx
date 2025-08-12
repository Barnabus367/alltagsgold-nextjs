import { NextSEOHead } from '@/components/seo/NextSEOHead';
import { generateStaticPageSEO } from '@/lib/seo';
import { Layout } from '@/components/layout/Layout';

function AGB() {
  const seoData = generateStaticPageSEO('agb');
 
  return (
    <div className="min-h-screen bg-white pt-16">
      <NextSEOHead 
        seo={seoData}
        canonicalUrl="/agb" 
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px:8 py-16">
        <div className="prose prose-gray max-w-none">
          <h1 className="text-4xl font-light text-black mb-8">Allgemeine Geschäftsbedingungen (AGB)</h1>

          <div className="space-y-8">
            <section> 
              <h2 className="text-2xl font-light text-black mb-4">§ 1 Geltungsbereich</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  (1) Diese AGB gelten für alle Verträge über Warenlieferungen, die ein Verbraucher oder Unternehmer (nachfolgend "Kunde") mit <strong>Alltagsgold</strong> (nachfolgend "Verkäufer") im Online‑Shop abschliesst.
                </p>
                <p>
                  (2) Abweichende oder ergänzende Bedingungen des Kunden werden nicht anerkannt, es sei denn, Alltagsgold stimmt ausdrücklich schriftlich zu.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-black mb-4">§ 2 Vertragsschluss</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  (1) Die Produktdarstellungen im Shop sind unverbindlich und stellen keine rechtlich bindenden Angebote dar.
                </p>
                <p>
                  (2) Der Kunde gibt durch Klick auf den Bestellbutton ein verbindliches Angebot ab.
                </p>
                <p>
                  (3) Alltagsgold nimmt das Angebot innerhalb von fünf Tagen durch Versand einer Bestätigung oder Lieferung der Ware an.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-black mb-4">§ 3 Preise &amp; Zahlung</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  (1) Alle Preise verstehen sich in CHF, inkl. gesetzlicher Mehrwertsteuer und exkl. Versandkosten.
                </p>
                <p>
                  (2) Akzeptierte Zahlungsarten: Vorkasse, Kreditkarte, PayPal, TWINT.
                </p>
                <p>
                  (3) Zahlungen sind sofort fällig, sofern nichts anderes angegeben.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-black mb-4">§ 4 Lieferung &amp; Versand</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  (1) Lieferung erfolgt an die vom Kunden angegebene Adresse. Angaben zu Verfügbarkeit und Lieferzeiten sind unverbindlich, sofern sie nicht ausdrücklich zugesichert werden.
                </p>
                <p>
                  (2) Scheitert die Lieferung aus Gründen, welche der Kunde zu vertreten hat, trägt er die entstehenden Kosten (z. B. erneuter Versand).
                </p>
                <p>
                  (3) Alltagsgold kann vom Vertrag zurücktreten, wenn die eigene Beschaffung fehlgeschlagen ist und dies nicht zu vertreten ist; bereits geleistete Zahlungen werden erstattet.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-black mb-4">§ 5 Widerrufsrecht</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  (1) Verbraucher haben ein Widerrufsrecht von 14 Tagen ab Empfang der Ware.
                </p>
                <p>
                  (2) Zur Ausübung genügt eine eindeutige Erklärung (z. B. E‑Mail).
                </p>
                <p>
                  (3) Verbraucher senden die Ware auf eigene Kosten zurück, sofern nicht anders vereinbart.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-black mb-4">§ 6 Gewährleistung</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  (1) Es gelten die gesetzlichen Schweizer Gewährleistungsrechte.
                </p>
                <p>
                  (2) Bei gebrauchten Waren kann die Gewährleistungsfrist auf ein Jahr beschränkt werden, soweit gesetzlich zulässig.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-black mb-4">§ 7 Haftung</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  (1) Alltagsgold haftet unbeschränkt bei Schaden aus Verletzung von Leben, Körper oder Gesundheit und bei grobem Verschulden.
                </p>
                <p>
                  (2) Für sonstige Schäden ist die Haftung auf den vertragstypisch vorhersehbaren Schaden begrenzt.
                </p>
                <p>
                  (3) Haftung für mittelbare Schäden oder entgangenen Gewinn ist ausgeschlossen, ausser bei Vorsatz oder grober Fahrlässigkeit.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-black mb-4">§ 8 Online‑Streitbeilegung</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  (1) Die EU‑Kommission stellt unter <a href="https://ec.europa.eu/consumers/odr/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr/</a> eine Plattform zur Online‑Streitbeilegung bereit.
                </p>
                <p>
                  (2) Alltagsgold ist weder bereit noch verpflichtet, an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-black mb-4">§ 9 Schlussbestimmungen</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  (1) Schweizer Recht findet Anwendung, unter Ausschluss des UN‑Kaufrechts (CISG), sofern der Kunde in der Schweiz wohnhaft ist oder dort ein Unternehmen betreibt.
                </p>
                <p>
                  (2) Für Kaufleute und juristische Personen ist ausschliesslicher Gerichtsstand der Sitz von Alltagsgold.
                </p>
                <p>
                  (3) Sollten einzelne Bestimmungen dieses Vertrags unwirksam sein, bleibt die Wirksamkeit der übrigen unberührt. Ungültige Bestimmungen werden durch gesetzlich zulässige, möglichst äquivalente Regelungen ersetzt.
                </p>
                <p>
                  (4) Diese AGB können jederzeit geändert werden. Es gilt jeweils die zum Zeitpunkt der Bestellung aktuelle Fassung.
                </p>
              </div>
            </section>

            <section className="mt-12 bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-light text-black mb-4">Kontakt</h2>
              <div className="text-gray-700">
                <p>
                  <strong>Alltagsgold</strong><br/>
                  Zürich, Schweiz<br/>
                  E‑Mail: <a href="mailto:hallo@alltagsgold.ch" className="text-blue-600 hover:underline">hallo@alltagsgold.ch</a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AGBPage() {
  return (
    <Layout>
      <AGB />
    </Layout>
  );
}

