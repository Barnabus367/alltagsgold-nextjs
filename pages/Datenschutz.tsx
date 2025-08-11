import { NextSEOHead } from '@/components/seo/NextSEOHead';
import { generateStaticPageSEO } from '@/lib/seo';
import { Layout } from '@/components/layout/Layout';

function Datenschutz() {
  const seoData = generateStaticPageSEO('datenschutz');
  return (
    <div className="min-h-screen bg-white pt-16">
      <NextSEOHead 
        seo={seoData}
        canonicalUrl="/datenschutz" 
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
                  Verantwortlich für die Datenverarbeitung ist <strong>Alltagsgold</strong>, Zürich, Schweiz. Kontakt: <a href="mailto:hallo@alltagsgold.ch" className="text-blue-600 hover:underline">hallo@alltagsgold.ch</a>.
                </p>
                
                <h3 className="text-lg font-medium text-black">Datenquelle</h3>
                <p>
                  Daten, die Sie uns mitteilen (z. B. via Kontaktformular), sowie technisch automatisch erhobene Daten (Cookies, Log‑Dateien).
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-black mb-4">2. Hosting &amp; Infrastruktur</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Die Website wird extern gehostet. Verarbeitet werden u. a. IP‑Adresse, Kommunikationsdaten und Logfiles. Zweck: Betrieb, Sicherheit, Analyse.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-black mb-4">3. Cookies &amp; Tracking</h2>
              <div className="space-y-4 text-gray-700">
                <ul className="space-y-2 list-disc list-inside">
                  <li><strong>Essenzielle Cookies</strong>: technisch notwendig, ohne Einwilligung aktiv.</li>
                  <li><strong>Nicht‑essenzielle Cookies (Analyse/Marketing)</strong>: nur nach ausdrücklicher Einwilligung über ein Cookie‑Banner. Einwilligung jederzeit widerrufbar; IP‑Anonymisierung wird eingesetzt.</li>
                  <li>Datenschutzfreundliche, First‑Party Analysen werden bevorzugt.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-black mb-4">4. Server‑Log‑Dateien</h2>
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
                  Daten wie Name, E‑Mail und Nachricht dienen der Bearbeitung Ihrer Anfrage. Rechtsgrundlage: Vertragserfüllung oder berechtigtes Interesse.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-black mb-4">6. E‑Commerce &amp; Zahlungsanbieter</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Vertrags‑ und Kundendaten verarbeiten wir zur Vertragserfüllung und Abrechnung. Weitergabe erfolgt nur an beteiligte Dritte (z. B. Zahlungsdienstleister) im erforderlichen Umfang.
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
                  Kontakt: <a href="mailto:hallo@alltagsgold.ch" className="text-blue-600 hover:underline">hallo@alltagsgold.ch</a>
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-black mb-4">8. Widerruf &amp; Widerspruch</h2>
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
                  Privacy by Design und Default: datenschutzfreundliche Einstellungen von Anfang an; Pseudonymisierung/Anonymisierung, wo möglich.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-black mb-4">10. Speicherung &amp; Löschung</h2>
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
                  Datenübermittlungen in Drittländer erfolgen nur bei angemessenem Datenschutzniveau (z. B. Standardvertragsklauseln) oder mit Ihrer Einwilligung.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-black mb-4">12. Änderungen &amp; Aktualisierung</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Diese Erklärung wird bei Bedarf aktualisiert. Letzte Aktualisierung: <strong>11. August 2025</strong>.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-black mb-4">13. Beschwerderecht</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Sie können bei der Schweizer Aufsichtsbehörde Beschwerde einlegen:<br/>
                  FDPIC – Eidg. Datenschutz‑ und Öffentlichkeitsbeauftragter (<a href="https://www.edoeb.admin.ch" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">www.edoeb.admin.ch</a>)
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-black mb-4">14. Kontakt</h2>
              <div className="space-y-4 text-gray-700">
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

export default function DatenschutzPage() {
  return (
    <Layout>
      <Datenschutz />
    </Layout>
  );
}

