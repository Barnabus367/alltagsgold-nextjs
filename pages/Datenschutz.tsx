import { NextSEOHead } from '@/components/seo/NextSEOHead';
import { Layout } from '@/components/layout/Layout';
import { generateStaticPageSEO } from '@/lib/seo';

function DatenschutzContent() {
  const seo = generateStaticPageSEO('datenschutz');

  return (
    <div className="min-h-screen bg-white pt-16">
<<<<<<< Updated upstream
      <NextSEOHead 
        seo={seoData}
        canonicalUrl="datenschutz" 
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-gray max-w-none">
          <h1 className="text-4xl font-light text-black mb-8">Datenschutzerklärung</h1>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-light text-black mb-4">1. Datenschutz auf einen Blick</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Die folgenden Hinweise geben kurz wieder, wie wir Ihre personenbezogenen Daten beim Besuch unserer Website verarbeiten. Personenbezogene Daten sind alle Angaben, mit denen Sie persönlich identifiziert werden können.
                </p>
                
                <h3 className="text-lg font-medium text-black">Verantwortliche Stelle</h3>
                <p>
                  Verantwortlich für die Datenverarbeitung ist Alltagsgold. Kontaktdaten siehe Impressum.
                </p>
                
                <h3 className="text-lg font-medium text-black">Datenquelle</h3>
                <p>
                  Daten, die Sie uns mitteilen (z. B. via Kontaktformular), sowie technisch automatisch erhobene Daten (Cookies, Log-Dateien).
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-black mb-4">2. Hosting & Infrastruktur</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Die Website wird extern gehostet. Verarbeitet werden u. a. IP-Adresse, Kommunikationsdaten, Logfiles. Zweck: Betrieb, Sicherheit, Analyse.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-black mb-4">3. Cookies & Tracking</h2>
              <div className="space-y-4 text-gray-700">
                <ul className="space-y-2 list-disc list-inside">
                  <li><strong>Essenzielle Cookies</strong>: technisch notwendig, ohne Einwilligung aktiv.</li>
                  <li><strong>Nicht-essenzielle Cookies (Analyse/Marketing)</strong>: nur nach ausdrücklicher Einwilligung über ein Cookie-Banner, das Informationen zu Zweck, Ablehnungsmöglichkeit und granularer Auswahl bietet. Einwilligung ist jederzeit widerrufbar und konform mit revDSG/TCA.</li>
                  <li>Analyse-Tools (z. B. Google Analytics) nutzen IP-Anonymisierung (_anonymizeIp()) und werden nur mit Einwilligung aktiv.</li>
                  <li>Technisch datenschutzfreundliche Analysen (first-party Tools) bevorzugt.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-black mb-4">4. Server-Log-Dateien</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Erhobene Daten (Browsertyp, IP, Timestamp, Referrer) werden zur technischen Optimierung, Sicherheitszwecken und Missbrauchsverhinderung verarbeitet. Rechtsgrundlage: berechtigtes Interesse.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-black mb-4">5. Kontaktformular</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Daten wie Name, E-Mail, Nachricht dienen der Bearbeitung Ihrer Anfrage. Rechtsgrundlage: Vertragserfüllung oder berechtigtes Interesse.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-black mb-4">6. E‑Commerce & Zahlungsanbieter</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Vertrags- und Kundendaten verarbeiten wir zur Vertragserfüllung und Abrechnung. Weitergabe erfolgt nur an beteiligte Dritte (Lieferanten, Zahlungsdienstleister) im erforderlichen Umfang.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-black mb-4">7. Rechte der Betroffenen</h2>
              <div className="space-y-4 text-gray-700">
                <p>Sie haben jederzeit folgende Rechte:</p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Auskunft</li>
                  <li>Berichtigung</li>
                  <li>Löschung</li>
                  <li>Einschränkung der Verarbeitung</li>
                  <li>Datenübertragbarkeit</li>
                  <li>Widerspruch gegen Verarbeitung</li>
                  <li>Widerruf erteilter Einwilligungen</li>
                </ul>
                <p className="mt-4">
                  Bitte senden Sie Ihr Anliegen formlos an: <a href="mailto:hallo@alltagsgold.ch" className="text-blue-600 hover:underline">hallo@alltagsgold.ch</a>
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-black mb-4">8. Widerruf & Widerspruch</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Einwilligungen (z. B. Cookies, Newsletter) können Sie jederzeit ohne Angabe von Gründen widerrufen. Der Widerruf wirkt nicht rückwirkend.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-black mb-4">9. Datenschutz durch Technikgestaltung</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Wir setzen auf Privacy by Design und Default: datenschutzfreundliche Einstellungen von Anfang an, Pseudonymisierung/Anonymisierung wo möglich.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-black mb-4">10. Speicherung & Löschung</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Daten speichern wir nur so lange, wie es für die genannten Zwecke notwendig ist. Gesetzliche Aufbewahrungsfristen bleiben unberührt. Danach erfolgt sichere Löschung oder Anonymisierung.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-black mb-4">11. Drittlandübermittlungen</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Datenübermittlungen in Drittländer nur bei angemessenem Datenschutzniveau (z. B. Standardvertragsklauseln) oder mit Ihrer Einwilligung.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-black mb-4">12. Änderungen & Aktualisierung</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Diese Erklärung wird bei Bedarf aktualisiert. Letzte Aktualisierung: <strong>18. Juni 2025</strong>.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-black mb-4">13. Beschwerderecht</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Sie können bei der Schweizer Aufsichtsbehörde Beschwerde einlegen:<br/>
                  FDPIC – Eidg. Datenschutz- und Öffentlichkeitsbeauftragter (<a href="https://www.edoeb.admin.ch" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">www.edoeb.admin.ch</a>)
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-black mb-4">14. Kontakt für Datenschutzanfragen</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Für Auskünfte, Beschwerden oder Rechteausübung wenden Sie sich bitte an: <a href="mailto:hallo@alltagsgold.ch" className="text-blue-600 hover:underline">hallo@alltagsgold.ch</a>
                </p>
              </div>
            </section>
          </div>
=======
      <NextSEOHead seo={seo} canonicalUrl="/datenschutz" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-gray max-w-none">
          <h1 className="text-4xl font-light text-black mb-8">Datenschutzerklärung</h1>

          <p className="text-sm text-gray-500 mb-8">
            Verantwortlicher: <strong>Alltagsgold</strong>, Zürich, Schweiz, 
            E-Mail: <a href="mailto:hallo@alltagsgold.ch" className="text-blue-600 hover:underline">hallo@alltagsgold.ch</a>. 
            Diese Erklärung erläutert, wie wir personenbezogene Daten gemäss schweizerischem Datenschutzrecht (revDSG) verarbeiten.
          </p>

          <h2 className="text-2xl font-light text-black mt-8 mb-4">1. Kurzüberblick</h2>
          <ul className="list-disc pl-6">
            <li>Wir verarbeiten Daten, die Sie uns mitteilen (z. B. Bestellungen, Kontakt) und technisch anfallende Daten (z. B. Server-Logs).</li>
            <li>Zwecke: Shop-Betrieb, Vertragserfüllung, Versand, Bezahlung, Support, Sicherheit, Analyse (privacy‑freundlich).</li>
            <li>Rechtsgrundlagen: Vertragserfüllung, gesetzliche Pflichten, berechtigtes Interesse, Einwilligung (für nicht‑essenzielle Tools).</li>
          </ul>

          <h2 className="text-2xl font-light text-black mt-8 mb-4">2. Hosting & Infrastruktur</h2>
          <p>Wir hosten/deployen über Vercel Inc. (USA/EU). Verarbeitet werden u. a. IP-Adressen und Logs zum Betrieb/Sicherheit. Für Übermittlungen in Drittländer bestehen geeignete Garantien (z. B. Standardvertragsklauseln/DPF).</p>

          <h2 className="text-2xl font-light text-black mt-8 mb-4">3. Shop-System & Bestellung</h2>
          <p>Wir nutzen Shopify als Commerce-Plattform (Kunden-, Bestell- und Erfüllungsdaten). Datenverarbeitung dient Vertragserfüllung, Abrechnung, Kundenkommunikation. Daten können – soweit erforderlich – an Logistikpartner weitergegeben werden, um den Versand zu ermöglichen.</p>

          <h2 className="text-2xl font-light text-black mt-8 mb-4">4. Zahlung</h2>
          <p>Zahlungsabwicklung über Zahlungsdienstleister (z. B. Stripe, PayPal, TWINT). Diese verarbeiten Zahlungs- und ggf. Betrugspräventionsdaten in eigener Verantwortung. Es gelten die Datenschutzhinweise der jeweiligen Anbieter.</p>

          <h2 className="text-2xl font-light text-black mt-8 mb-4">5. Kommunikation & E-Mail</h2>
          <p>Transaktions- und Servicemails versenden wir z. B. über SendGrid. Verarbeitet werden E-Mail-Adresse, Versand-/Zustellinformationen. Zweck: Zustellung und Nachverfolgung.</p>

          <h2 className="text-2xl font-light text-black mt-8 mb-4">6. Medien/CDN</h2>
          <p>Bilder/Assets liefern wir u. a. über Cloudinary aus. Dabei fallen technisch bedingte Verbindungsdaten (z. B. IP-Adresse in Logs) an.</p>

          <h2 className="text-2xl font-light text-black mt-8 mb-4">7. Analyse & Reichweite</h2>
          <ul className="list-disc pl-6">
            <li>Vercel Analytics/Web Vitals: Performance‑Metriken, aggregiert/pseudonymisiert; kein Tracking über Seiten hinweg.</li>
            <li>Optionale Tools (z. B. Google Analytics, Meta Pixel) setzen wir nur nach Einwilligung ein (Consent‑Banner). IP-Anonymisierung wird aktiviert, wo möglich.</li>
          </ul>

          <h2 className="text-2xl font-light text-black mt-8 mb-4">8. Cookies, Consent & Einstellungen</h2>
          <ul className="list-disc pl-6">
            <li>Essenzielle Cookies: für Grundfunktionen, ohne Einwilligung.</li>
            <li>Nicht‑essenzielle Cookies/Pixel: nur mit Einwilligung (Consent‑Banner), jederzeit widerrufbar.</li>
            <li>Cookie‑Präferenzen können Sie jederzeit über „Cookie‑Einstellungen" im Footer ändern.</li>
          </ul>

          <h2 className="text-2xl font-light text-black mt-8 mb-4">9. Server-Log-Dateien</h2>
          <p>Wir verarbeiten technisch erforderliche Daten (z. B. IP, Timestamp, User Agent) zur Sicherstellung des Betriebs, Missbrauchsabwehr und Fehleranalyse. Speicherdauer: so kurz wie möglich (z. B. 7–30 Tage), soweit nicht längere Aufbewahrung erforderlich ist.</p>

          <h2 className="text-2xl font-light text-black mt-8 mb-4">10. Kontakt & Support</h2>
          <p>Bei Anfragen verarbeiten wir die von Ihnen angegebenen Daten (z. B. Name, E‑Mail, Inhalt) zur Bearbeitung. Rechtsgrund: Vertrag/Anfrage (berechtigtes Interesse). Speicherdauer: zweckgebunden und begrenzt.</p>

          <h2 className="text-2xl font-light text-black mt-8 mb-4">11. Lieferung & Weitergabe an Dritte</h2>
          <p>Für die Vertragserfüllung (Versand) übermitteln wir notwendige Daten (z. B. Name, Adresse, Produktangaben) an ausgewählte Logistiker. Wir achten auf ein angemessenes Schutzniveau und beschränken die Daten auf das erforderliche Minimum.</p>

          <h2 className="text-2xl font-light text-black mt-8 mb-4">12. Drittlandübermittlungen</h2>
          <p>Für Anbieter mit Sitz außerhalb der Schweiz/EU/EWR stellen wir angemessene Garantien sicher (z. B. Standardvertragsklauseln, Data Privacy Framework) oder holen – falls erforderlich – Ihre Einwilligung ein.</p>

          <h2 className="text-2xl font-light text-black mt-8 mb-4">13. Speicherdauer & Löschung</h2>
          <p>Wir speichern personenbezogene Daten nur solange, wie es für die genannten Zwecke erforderlich ist oder gesetzliche Pflichten bestehen. Danach löschen oder anonymisieren wir die Daten.</p>

          <h2 className="text-2xl font-light text-black mt-8 mb-4">14. Datensicherheit</h2>
          <p>Wir setzen geeignete technische und organisatorische Maßnahmen ein (z. B. TLS‑Verschlüsselung, Zugriffskontrollen, Datenminimierung, Auftragsverarbeitungsverträge).</p>

          <h2 className="text-2xl font-light text-black mt-8 mb-4">15. Ihre Rechte</h2>
          <ul className="list-disc pl-6">
            <li>Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit.</li>
            <li>Widerspruch gegen Verarbeitung auf Basis berechtigter Interessen.</li>
            <li>Widerruf erteilter Einwilligungen mit Wirkung für die Zukunft.</li>
          </ul>
          <p className="mt-4">Zur Ausübung wenden Sie sich an: <a href="mailto:hallo@alltagsgold.ch" className="text-blue-600 hover:underline">hallo@alltagsgold.ch</a>. Wir prüfen Anfragen und antworten innerhalb angemessener Frist.</p>

          <h2 className="text-2xl font-light text-black mt-8 mb-4">16. Beschwerderecht</h2>
          <p>Sie können bei der Schweizer Aufsichtsbehörde Beschwerde einlegen: FDPIC – Eidg. Datenschutz‑ und Öffentlichkeitsbeauftragter (<a href="https://www.edoeb.admin.ch" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.edoeb.admin.ch</a>).</p>

          <h2 className="text-2xl font-light text-black mt-8 mb-4">17. Änderungen</h2>
          <p>Wir passen diese Erklärung bei Bedarf an. Letzte Aktualisierung: <strong>{new Date().toLocaleDateString('de-CH')}</strong>.</p>

          <h3 className="text-xl font-light text-black mt-12 mb-4">Kontakt Datenschutz</h3>
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

export default function DatenschutzPage() {
  return (
    <Layout>
      <DatenschutzContent />
    </Layout>
  );
<<<<<<< Updated upstream
}
=======
}
>>>>>>> Stashed changes
