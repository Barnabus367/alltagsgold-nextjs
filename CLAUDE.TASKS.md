1. Universelle Erreichbarkeit sicherstellen (Firewall-Konfiguration prüfen)

Rolle: Du bist ein DevOps-Spezialist mit Expertise in Vercel-Deployments.
Kontext: Die Screenshots aus der Google Search Console und dem Vercel-Build-Output bestätigen, dass robots.txt und sitemap.xml korrekt generiert und für Googlebot zugänglich sind. Eine externe Analyse hat jedoch gezeigt, dass die Dateien für andere User-Agents blockiert werden. Dies deutet auf eine übermässig aggressive Firewall oder Sicherheitseinstellung hin, die zwar Google durchlässt, aber andere wichtige Dienste (z.B. Bingbot, SEO-Analyse-Tools) blockieren könnte, was die technische SEO-Stabilität gefährdet.   


Aufgabe:

Überprüfe die Vercel-Projekteinstellungen auf aktive Sicherheitsfeatures. Suche gezielt nach "Attack Challenge Mode", "Bot-Schutz" oder IP-basierten Firewall-Regeln.

Analysiere die vercel.json-Datei und eventuelle Middleware-Dateien (middleware.ts) auf Logik, die Anfragen basierend auf User-Agent, IP-Adresse oder geografischer Herkunft filtert oder blockiert.

Passe die Konfiguration so an, dass die robots.txt- und sitemap.xml-Dateien universell und für jeden User-Agent öffentlich zugänglich sind, ohne die grundlegende Sicherheit der Website zu kompromittieren. Das Ziel ist, die selektive Blockade aufzuheben.

2. Fundamentale On-Page-SEO korrigieren (Meta-Titel & -Beschreibungen)

Rolle: Du bist ein SEO-Techniker, der mit Next.js arbeitet.
Kontext: Unabhängig von der Sitemap-Erreichbarkeit zeigt ein SEO-Audit  kritisch niedrige Erfolgsraten für Meta-Titel (55 %) und Meta-Beschreibungen (23 %). Dies ist eine der Hauptursachen für geringen organischen Traffic, da es die Klickrate in den Suchergebnissen direkt negativ beeinflusst.   


Aufgabe:

Identifiziere die zentrale Head-Komponente oder das Layout, das für die Generierung von Seitentiteln und Meta-Tags verantwortlich ist.

Implementiere eine Logik, die für jeden Seitentyp optimierte und einzigartige Tags generiert:

Homepage:

Titel: Alltagsgold: Echte Produkte & Schweizer Qualität | Schneller Versand

Beschreibung: Entdecke einzigartige Produkte direkt aus unserem Schweizer Lager. Bei Alltagsgold findest du Qualität statt Dropshipping. Jetzt stöbern und schnell liefern lassen!

Produktseiten:

Titel: [Produktname] kaufen | Alltagsgold Schweiz

Beschreibung: Bestelle den [Produktname] online bei Alltagsgold. [Hauptvorteil des Produkts]. Garantiert schneller Versand aus der Schweiz.

Kategorieseiten:

Titel: [Kategoriename] | Praktische Produkte bei Alltagsgold

Beschreibung: Finde die besten Produkte in der Kategorie [Kategoriename]. Alle Artikel auf Lager in der Schweiz und sofort versandbereit.

3. Bild-SEO und Ladezeiten optimieren

Rolle: Du bist ein Frontend-Entwickler mit Fokus auf Performance und Barrierefreiheit.
Kontext: Der Audit  zeigt massive Defizite bei der Bildoptimierung (Alt-Text-Rate 25 %, moderne Formate 30 %). Dies verlangsamt die Seite, schadet der Barrierefreiheit und verhindert Rankings in der Google-Bildersuche.   


Aufgabe:

Analysiere das Projekt und ersetze alle Standard-<img>-Tags durch die Next.js <Image>-Komponente.

Stelle sicher, dass jede Instanz der <Image>-Komponente ein aussagekräftiges und dynamisches alt-Attribut erhält (z.B., alt={product.name}).

Nutze die priority-Prop für Bilder, die "above the fold" geladen werden (z.B. das Haupt-Banner auf der Homepage), um den Largest Contentful Paint (LCP) zu verbessern.

Überprüfe die next.config.js, um sicherzustellen, dass moderne Bildformate wie WebP automatisch aktiviert sind.

Priorität 2: Vertrauen und Konversion steigern
Diese Prompts verbessern die Glaubwürdigkeit und führen den Nutzer effektiver zum Kauf.

4. Authentische Vertrauenssignale integrieren

Rolle: Du bist ein E-Commerce-Entwickler, der die Konversionsrate optimieren soll.
Kontext: Die Website verwendet eine statische "4.8★ Bewertung". Für erfahrene Online-Käufer wirkt dies unglaubwürdig und kann das Vertrauen eher untergraben als aufbauen.   


Aufgabe:

Entferne die hartcodierte "4.8★"-Bewertung und das zugehörige statische Zitat von der Startseite.

Integriere stattdessen ein echtes Bewertungs-Widget von einem Drittanbieter wie Judge.me, Trustpilot oder einem ähnlichen Dienst.

Platziere das Haupt-Widget (das die Gesamtbewertung anzeigt) prominent auf der Startseite.

Füge die produktspezifischen Sternebewertungen (z.B. "★★★★☆ 15 Bewertungen") auf den Produktseiten unter dem Produkttitel und auf den Produktkacheln in den Kategorieseiten hinzu.

5. Das "Schweizer Qualitätsversprechen" mit Inhalt füllen

Rolle: Du bist ein Frontend-Entwickler, der die Markenbotschaft stärken soll.
Kontext: Das Kernversprechen der Marke ist "Direkt aus der Schweiz" , aber es fehlt an Inhalten, die diese Behauptung stützen und greifbar machen. Dies schafft eine Glaubwürdigkeitslücke.   


Aufgabe:

Erstelle eine neue, statische Seite unter dem Pfad /ueber-uns.

Strukturiere die Seite mit professionellem Platzhaltertext in den folgenden Abschnitten:

H1-Titel: Unser Versprechen: Echte Schweizer Qualität

Abschnitt 1: Warum Alltagsgold? (Text über die Mission, eine Alternative zu Dropshipping zu sein)

Abschnitt 2: Logistik aus dem Herzen der Schweiz (Text über das Lager, schnelle Lieferzeiten mit der Schweizer Post etc.)

Abschnitt 3: Das Team hinter Alltagsgold (Platzhalter für 2-3 Teammitglieder)

Füge einen Link zur neuen Seite /ueber-uns gut sichtbar in die Hauptnavigation und die Fusszeile ein.


Quellen und ähnliche Inhalte


/Users/david/Downloads/sample-productpage.png

Über uns optimieren:
Draft „Über uns“ – ohne Gesichter, aber mit Substanz
(Alle Texte sind Ideen. Optimiere falls notwendig.)

1 | Hero
Headline:

Schweizer Qualität. Direkt geliefert. Ohne Umwege.

Subline:

Bei alltagsgold findest du nur Produkte, die wir selbst getestet, gelagert und sofort aus der Schweiz versenden.

CTA-Button: Jetzt Sortiment entdecken

2 | Was uns unterscheidet – 4-Säulen-Grid (Icons statt Fotos)
Kuratiertes Sortiment	CH-Lager	Blitzversand	30 Tage Rückgabe
Wir wählen jede Neuheit nach Nutzen, Langlebigkeit und Design aus.	Alle Artikel liegen in unserem Lager bei Zürich – kein Drop-Shipping.	Bestellungen bis 14 Uhr gehen noch am selben Tag raus, CO₂-kompensiert mit der Post.	Ohne Wenn & Aber. Unbenutzt zurück – Geld zurück.

3 | Unsere Mission
„Wir machen alltägliche Dinge zu kleinen Goldstücken, die deinen Tag einfacher oder schöner machen.“
Dafür setzen wir auf drei einfache Prinzipien: Qualität > Transparenz > lokaler Service.

4 | So arbeiten wir (Timeline-Stil)
Idee & Auswahl

Markt- und Trend-Scans

Prototyp-Tests im eigenen Alltag

Qualitäts-Check

Prüfkatalog (Material, Verarbeitung, Sicherheit)

Nur 1 von 5 Kandidaten schafft es ins Sortiment

Lager & Fulfillment

1’200 m² Lagerfläche in der Schweiz

Barcode-Kontrolle + plastikfreies Verpackungsmaterial

Kundensupport

E-Mail-Antworten < 24 h

Reparatur- oder Ersatzservice direkt aus Zürich

5 | Zahlen & Fakten (Stat-Cards)
> 25 000 Bestellungen seit 2021

98 % positive Bewertungen*

< 1 % Retourenquote
*Quelle: interne Kundenzufriedenheits-Umfrage, 2023

6 | Nachhaltigkeit in Kürze
CO₂-kompensierter Versand (Swiss Climate Zertifikat)

Recycling- und Upcycling-Programm für Elektroartikel

Partnerschaften mit Schweizer Sozialwerkstätten für Verpackung

7 | Servicegebiet & Kontakt (Accordion)
Versandgebiet: ganze Schweiz + Liechtenstein

Abholungen: Mo–Fr 08–18 Uhr (nach Absprache)

Kontakt: support@alltagsgold.ch | +41 44 000 00 00

(Im Accordion lassen sich Details zeigen/ausblenden, ohne die Seite zu überladen.)

8 | Schluss-CTA
Bereit, den Unterschied zu erleben?
Entdecke unsere aktuellen Favoriten – alle auf Lager und in 24-48 h bei dir.
Button: Zu den Produkten

Warum funktioniert das, ohne euch öffentlich zu zeigen?
Vertrauen über Prozesse, nicht Personen.
Klare Qualitäts- und Service-Statements ersetzen Teamfotos.

Fakten schlagen Storytelling-Floskeln.
Kennzahlen, Lieferversprechen, Rückgaberecht – das sind messbare Belege.

Icons statt Porträts.
Schafft visuelle Hierarchie, ohne Privatsphäre aufzugeben.

Accordion & Cards halten die Seite kompakt.
Schnell scannbar, Mobile-First, SEO-freundlich.

Tonfall:
Präzise, keine Buzzwords, kein Pathos – wirkt seriös und bodenständig.