# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm run dev                    # Start development server on port 3000
npm run check                  # Run TypeScript type checking
```

### Build & Production
```bash
npm run build                  # Production build with sitemap generation
npm start                      # Start production server
npm run generate-sitemap       # Generate XML sitemaps for SEO
```

### Testing
```bash
npm test                       # Run all Jest tests
npm run test:watch            # Run tests in watch mode
npm run test:coverage         # Generate test coverage report (70% threshold required)
npm run test:types            # Run TypeScript type checking
```

### Database
```bash
npm run db:push               # Push Drizzle schema changes to Neon database
```

### Content Management
```bash
npm run update-collections    # Update Shopify collections cache
```

## Architecture Overview

AlltagsGold is a German/Swiss e-commerce platform built with Next.js 14 (Pages Router) and TypeScript, integrating with Shopify Storefront API.

### Key Technical Stack
- **Framework**: Next.js 14 with Pages Router
- **Language**: TypeScript (strict mode enabled)
- **Styling**: Tailwind CSS + shadcn/ui components
- **E-commerce**: Shopify Storefront API
- **Database**: Drizzle ORM + Neon (PostgreSQL)
- **Analytics**: Vercel Analytics + custom performance monitoring
- **Deployment**: Vercel (Frankfurt region)

### Core Architecture Patterns

1. **API Integration Pattern**
   - All Shopify API calls go through `/lib/shopify.ts`
   - Environment variables: `SHOPIFY_STOREFRONT_TOKEN`, `SHOPIFY_STORE_DOMAIN`
   - GraphQL queries for product data fetching

2. **Performance Optimization Pattern**
   - Lazy loading scripts via `/lib/lazy-load-scripts.ts`
   - Performance monitoring in `/lib/performance-monitor-optimized.ts`
   - Bundle optimization in `next.config.js` with manual chunks

3. **SEO Strategy Pattern**
   - SEO utilities in `/lib/seo.ts`
   - Structured data generation for products
   - Automatic sitemap generation on build
   - Swiss market focus with German language optimization

4. **Component Architecture**
   - Components organized by feature in `/components/`
   - UI components from shadcn/ui in `/components/ui/`
   - Mobile-specific components in `/components/mobile/`
   - Type definitions in `/types/` directory

5. **Testing Strategy**
   - Jest + React Testing Library setup
   - Tests co-located in `__tests__` directories
   - 70% coverage threshold enforced
   - Mock Vercel Analytics in tests

### Critical Files to Understand

1. **`/lib/shopify.ts`**: Core Shopify API integration
2. **`/pages/_app.tsx`**: Global app configuration and providers
3. **`/components/layout/Layout.tsx`**: Main layout wrapper
4. **`/types/index.ts`**: Core TypeScript type definitions
5. **`/lib/seo.ts`**: SEO utilities and meta tag generation

### Development Considerations

- Always run `npm run check` before committing to catch TypeScript errors
- Test coverage must maintain 70% threshold
- Use Cloudinary for image optimization when possible
- Follow existing component patterns in `/components/`
- Maintain Swiss German language conventions in content

CLAUDE.TASKS:

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
