import { NextSEOHead } from '@/components/seo/NextSEOHead';
<<<<<<< Updated upstream
import { generateStaticPageSEO } from '../lib/seo';
=======
>>>>>>> Stashed changes
import { Layout } from '@/components/layout/Layout';
import { generateStaticPageSEO } from '@/lib/seo';

function AGBContent() {
  const seo = generateStaticPageSEO('agb');

<<<<<<< Updated upstream
export function AGB() {
  // Generate SEO metadata for AGB page
  const seoData = generateStaticPageSEO('agb');
 
  return (
    <div className="min-h-screen bg-white pt-16">
      <NextSEOHead 
        seo={seoData}
        canonicalUrl="agb" 
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px:8 py-16">
        <div className="prose prose-gray max-w-none">
          <h1 className="text-4xl font-light text-black mb-8">Allgemeine Geschäftsbedingungen (AGB)</h1>

          <div className="space-y-8">
            <section> 
              <h2 className="text-2xl font-light text-black mb-4">§ 1 Geltungsbereich</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  (1) Diese AGB gelten für alle Verträge über Warenlieferungen, die ein Verbraucher oder Unternehmer (nachfolgend "Kunde") mit Alltagsgold (nachfolgend "Verkäufer") im Online-Shop abschliesst.
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
                  (1) Die Produktdarstellungen im Shop sind unverbindlich. Sie stellen keine Verkaufsangebote dar, sondern Aufforderungen zur Bestellung.
                </p>
                <p>
                  (2) Der Kunde gibt durch Klick auf den Bestellbutton ein verbindliches Angebot ab.
                </p>
                <p>
                  (3) Alltagsgold nimmt das Angebot innerhalb von fünf Tagen durch Versand einer Bestätigung oder Lieferung der Ware an.
                </p>
              </div>
            </section>
=======
  return (
    <div className="min-h-screen bg-white pt-16">
      <NextSEOHead seo={seo} canonicalUrl="/agb" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-gray max-w-none">
          <h1 className="text-4xl font-light text-black mb-8">Allgemeine Geschäftsbedingungen (AGB)</h1>

          <p className="text-sm text-gray-500 mb-8">
            Diese AGB regeln die Vertragsbeziehung zwischen <strong>Alltagsgold</strong>, 
            mit Sitz in Zürich, Schweiz, 
            E-Mail: <a href="mailto:hallo@alltagsgold.ch" className="text-blue-600 hover:underline">hallo@alltagsgold.ch</a> 
            (nachfolgend „Verkäufer") und ihren Kundinnen und Kunden (nachfolgend „Kunde").
          </p>

          <h2 className="text-2xl font-light text-black mt-8 mb-4">1. Geltungsbereich</h2>
          <p>Diese AGB gelten für alle Verträge über Warenlieferungen und Leistungen, die über unseren Online‑Shop abgeschlossen werden. Abweichende Bedingungen des Kunden werden nicht anerkannt, es sei denn, wir stimmen ihrer Geltung ausdrücklich schriftlich zu.</p>
>>>>>>> Stashed changes

          <h2 className="text-2xl font-light text-black mt-8 mb-4">2. Vertragsschluss</h2>
          <ol className="list-decimal pl-6">
            <li>Produktdarstellungen im Shop sind unverbindlich und stellen kein rechtlich bindendes Angebot dar.</li>
            <li>Mit Klick auf den „Kaufen"-Button gibt der Kunde ein verbindliches Angebot ab.</li>
            <li>Die Annahme erfolgt innerhalb von 5 Tagen durch Bestellbestätigung per E‑Mail oder durch Versand der Ware.</li>
          </ol>

<<<<<<< Updated upstream
            <section>
              <h2 className="text-2xl font-light text-black mb-4">§ 4 Lieferung &amp; Versand</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  (1) Lieferung erfolgt an die vom Kunden angegebene Adresse.
                </p>
                <p>
                  (2) Scheitert die Lieferung aus Gründen, welche der Kunde zu vertreten hat, trägt er die entstehenden Kosten.
                </p>
                <p>
                  (3) Alltagsgold kann vom Vertrag zurücktreten, wenn die eigene Beschaffung fehlgeschlagen ist.
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
                  (2) Zur Ausübung genügt eine eindeutige Erklärung (z. B. E-Mail).
                </p>
                <p>
                  (3) Verbraucher müssen die Ware auf eigene Kosten zurücksenden, wenn nicht anders vereinbart.
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
                  (2) Bei gebrauchten Waren kann die Gewährleistungsfrist auf ein Jahr beschränkt werden.
                </p>
              </div>
            </section>
=======
          <h2 className="text-2xl font-light text-black mt-8 mb-4">3. Preise, Versandkosten, Steuern/Zölle</h2>
          <ol className="list-decimal pl-6">
            <li>Alle Preise in CHF. Sofern angezeigt: inkl. gesetzlicher MwSt.; Versandkosten werden im Checkout ausgewiesen.</li>
            <li>Bei internationalen Lieferungen können Einfuhrabgaben/Zölle/Einfuhr-MwSt anfallen. 
                Soweit im Checkout nicht ausdrücklich als „verzollt/versteuert (DDP)" ausgewiesen, erfolgen Lieferungen in der Regel 
                „unverzollt/unversteuert (DDU)". Etwaige Einfuhrabgaben trägt der Kunde.</li>
          </ol>

          <h2 className="text-2xl font-light text-black mt-8 mb-4">4. Lieferung, Lieferzeit, Teillieferung</h2>
          <ol className="list-decimal pl-6">
            <li>Die Lieferung erfolgt an die vom Kunden angegebene Adresse.</li>
            <li>Lieferzeitfenster: Die angegebenen Lieferzeiten sind unverbindlich. Verzögerungen durch Zoll, Spitzenzeiten oder externe Umstände sind möglich.</li>
            <li>Teillieferungen sind zulässig, soweit zumutbar; zusätzliche Kosten entstehen dem Kunden dadurch nicht.</li>
            <li>Kann der Verkäufer trotz zumutbarer Eigenbemühungen nicht liefern (fehlende oder verspätete Selbstbelieferung), ist er zum Rücktritt berechtigt. Bereits geleistete Zahlungen werden erstattet.</li>
          </ol>

          <h2 className="text-2xl font-light text-black mt-8 mb-4">5. Gefahrübergang, Transportschäden</h2>
          <ol className="list-decimal pl-6">
            <li>Bei Verbrauchern geht die Gefahr mit Übergabe an den Kunden über.</li>
            <li>Offensichtliche Transportschäden sind dem Zusteller und dem Support unverzüglich (innerhalb 48h) zu melden, mit Fotos zu dokumentieren und die Verpackung aufzubewahren.</li>
          </ol>
>>>>>>> Stashed changes

          <h2 className="text-2xl font-light text-black mt-8 mb-4">6. Eigentumsvorbehalt</h2>
          <p>Die Ware bleibt bis zur vollständigen Bezahlung unser Eigentum.</p>

<<<<<<< Updated upstream
            <section>
              <h2 className="text-2xl font-light text-black mb-4">§ 8 Online-Streitbeilegung</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  (1) Die EU-Kommission stellt unter <a href="https://ec.europa.eu/consumers/odr/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr/</a> eine Plattform zur Online-Streitbeilegung bereit.
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
                  (1) Schweizer Recht findet Anwendung, unter Ausschluss des UN-Kaufrechts (CISG), wenn der Kunde in der Schweiz wohnhaft ist oder dort ein Unternehmen betreibt.
                </p>
                <p>
                  (2) Für Kaufleute und juristische Personen ist ausschliesslicher Gerichtsstand der Firmensitz von Alltagsgold.
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
              <h2 className="text-xl font-light text-black mb-4">Kontakt bei Fragen zu den AGB</h2>
              <div className="text-gray-700">
                <p>
                  <strong>Alltagsgold</strong><br/>
                  E-Mail: <a href="mailto:hallo@alltagsgold.ch" className="text-blue-600 hover:underline">hallo@alltagsgold.ch</a>
                </p>
              </div>
            </section>
          </div>
=======
          <h2 className="text-2xl font-light text-black mt-8 mb-4">7. Widerruf/Rückgabe (freiwillige Regelung)</h2>
          <p className="mb-4">In der Schweiz besteht kein gesetzliches Widerrufsrecht im Fernabsatz. Wir gewähren freiwillig folgendes Rückgaberecht:</p>
          <ol className="list-decimal pl-6">
            <li>Rückgabefrist: 14 Tage ab Erhalt der Ware (Ankunftsnachweis).</li>
            <li>Bedingungen: Unbenutzt, originalverpackt, vollständig. Ausnahmen: Hygieneartikel, personalisierte/maßgefertigte Waren, geöffnete Verbrauchsgüter.</li>
            <li>Prozess: Vorherige Kontaktaufnahme über <a href="mailto:hallo@alltagsgold.ch" className="text-blue-600 hover:underline">hallo@alltagsgold.ch</a> (RMA-Nummer). Rücksendung erst nach Anweisungen.</li>
            <li>Kosten: Rückversand- und etwaige Einfuhr-/Zollkosten trägt der Kunde, sofern kein Produktmangel vorliegt.</li>
            <li>Erstattung: Nach Wareneingang & Prüfung binnen 14 Tagen in ursprünglicher Zahlart; Wertminderung wird abgezogen.</li>
          </ol>

          <h2 className="text-2xl font-light text-black mt-8 mb-4">8. Gewährleistung (Sachmängel)</h2>
          <ol className="list-decimal pl-6">
            <li>Es gelten die gesetzlichen Bestimmungen nach Schweizer Recht. Bei Neuwaren i. d. R. 2 Jahre, soweit nicht gesetzlich etwas anderes gilt.</li>
            <li>Vorgehen: Mängel sind mit Fotos und Bestellnummer zeitnah zu melden. Je nach Fall erfolgt Nachbesserung, Ersatzlieferung oder Erstattung.</li>
          </ol>

          <h2 className="text-2xl font-light text-black mt-8 mb-4">9. Haftung</h2>
          <ol className="list-decimal pl-6">
            <li>Unbeschränkte Haftung bei Verletzung von Leben, Körper, Gesundheit sowie bei Vorsatz und grober Fahrlässigkeit.</li>
            <li>Im Übrigen haften wir nur für vorhersehbare, vertragstypische Schäden. Haftung für mittelbare Schäden/Folgeschäden ist ausgeschlossen, soweit gesetzlich zulässig.</li>
          </ol>

          <h2 className="text-2xl font-light text-black mt-8 mb-4">10. Zahlung, Verzug</h2>
          <ol className="list-decimal pl-6">
            <li>Zahlungsarten (wie im Shop verfügbar): Kreditkarte (z. B. Stripe), PayPal, TWINT, ggf. Vorkasse. Etwaige Gebühren werden im Checkout angezeigt.</li>
            <li>Bei Zahlungsverzug können Mahngebühren und Verzugszinsen erhoben werden.</li>
          </ol>

          <h2 className="text-2xl font-light text-black mt-8 mb-4">11. Höhere Gewalt</h2>
          <p>Bei Ereignissen außerhalb unserer Kontrolle (z. B. Naturkatastrophen, Streik, behördliche Maßnahmen, Pandemien, Zollrestriktionen) ruhen die Leistungspflichten für die Dauer der Störung.</p>

          <h2 className="text-2xl font-light text-black mt-8 mb-4">12. Rechte an Inhalten</h2>
          <p>Alle Rechte an Bildern, Texten und Marken liegen bei uns oder unseren Lizenzgebern. Nutzung nur mit vorheriger Genehmigung.</p>

          <h2 className="text-2xl font-light text-black mt-8 mb-4">13. Schlussbestimmungen</h2>
          <ol className="list-decimal pl-6">
            <li>Rechtswahl: Schweizer Recht, unter Ausschluss des UN-Kaufrechts (CISG). Zwingende Verbraucherschutzvorschriften des Wohnsitzstaates bleiben unberührt.</li>
            <li>Gerichtsstand: Sitz des Verkäufers, sofern keine zwingenden Gerichtsstände entgegenstehen.</li>
            <li>Sprache: Rechtsverbindlich ist die deutsche Fassung.</li>
            <li>Salvatorische Klausel: Unwirksame Bestimmungen werden durch gesetzlich zulässige Regelungen ersetzt; die Wirksamkeit der übrigen bleibt unberührt.</li>
            <li>Änderungen: Wir können diese AGB jederzeit ändern; es gilt die zum Zeitpunkt der Bestellung gültige Fassung.</li>
          </ol>

          <h3 className="text-xl font-light text-black mt-12 mb-4">Kontakt</h3>
          <p>
            <strong>Alltagsgold</strong><br />
            Zürich, Schweiz<br />
            E-Mail: <a href="mailto:hallo@alltagsgold.ch" className="text-blue-600 hover:underline">hallo@alltagsgold.ch</a>
          </p>
>>>>>>> Stashed changes
        </div>
      </div>
    </div>
  );
}

// Default export for Next.js routing
export default function AGBPage() {
  return (
    <Layout>
      <AGBContent />
    </Layout>
  );
<<<<<<< Updated upstream
}
=======
}
>>>>>>> Stashed changes
