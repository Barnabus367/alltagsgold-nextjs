# AlltagsGold - Technische Architektur

## 🏗️ System-Übersicht

AlltagsGold ist eine moderne E-Commerce-Plattform für den Schweizer Markt, die auf Performance, Skalierbarkeit und hervorragende Benutzererfahrung ausgelegt ist.

## 🛠️ Technologie-Stack

### Frontend
- **Framework**: Next.js 14 (Pages Router)
- **Sprache**: TypeScript (Strict Mode)
- **Styling**: 
  - Tailwind CSS für Utility-First Styling
  - shadcn/ui für konsistente UI-Komponenten
  - Custom CSS für spezielle Animationen
- **State Management**: React Hooks + Context API
- **Bildoptimierung**: 
  - Next.js Image Component
  - Cloudinary für dynamische Transformationen

### Backend & APIs
- **E-Commerce**: Shopify Storefront API (GraphQL)
- **Datenbank**: Neon (PostgreSQL) mit Drizzle ORM
- **Authentication**: Shopify Customer Access Token
- **API Routes**: Next.js API Routes für Backend-Funktionalität

### Infrastructure
- **Hosting**: Vercel (Frankfurt Region)
- **CDN**: Vercel Edge Network
- **Analytics**: 
  - Vercel Analytics
  - Custom Performance Monitoring
  - Google Analytics 4
- **Monitoring**: Custom Performance Monitor

## 📁 Projektstruktur

```
alltagsgold-nextjs/
├── pages/                    # Next.js Pages Router
│   ├── _app.tsx             # Global App-Konfiguration
│   ├── index.tsx            # Homepage
│   ├── products/            # Dynamische Produktseiten
│   ├── collections/         # Kategorie-Seiten
│   └── api/                 # API-Endpunkte
├── components/              # React-Komponenten
│   ├── layout/             # Layout-Komponenten
│   ├── product/            # Produkt-spezifische Komponenten
│   ├── cart/               # Warenkorb-Funktionalität
│   ├── common/             # Wiederverwendbare Komponenten
│   └── ui/                 # shadcn/ui Komponenten
├── lib/                     # Utility-Funktionen
│   ├── shopify.ts          # Shopify API Integration
│   ├── seo.ts              # SEO-Utilities
│   └── performance-monitor.ts # Performance-Tracking
├── hooks/                   # Custom React Hooks
├── types/                   # TypeScript Type-Definitionen
├── styles/                  # Globale Styles
└── public/                  # Statische Assets
```

## 🔌 Core-Integrationen

### Shopify Storefront API
- GraphQL-basierte Produktdaten
- Echtzeit-Inventar-Synchronisation
- Multi-Währungs-Support (CHF)
- Checkout über Shopify

```typescript
// Beispiel: Produkt-Abfrage
const PRODUCT_QUERY = gql`
  query getProduct($handle: String!) {
    product(handle: $handle) {
      id
      title
      images(first: 10) {
        edges {
          node {
            url
            altText
          }
        }
      }
    }
  }
`;
```

### Performance-Optimierungen
1. **Code-Splitting**: Automatisch durch Next.js
2. **Lazy Loading**: 
   - Bilder mit loading="lazy"
   - Komponenten mit dynamic imports
3. **Bundle-Optimierung**: 
   - Tree-shaking
   - Minifizierung
   - Compression
4. **Caching-Strategie**:
   - Static Generation für Produktseiten
   - ISR (Incremental Static Regeneration)
   - Client-side Caching mit SWR

## 🎨 Design-System

### Farbschema
```css
:root {
  --primary: #c9a74d;           /* Gold */
  --secondary: #2C2825;         /* Dunkelbraun */
  --background: #FAF8F5;        /* Warm Beige */
  --accent: #8B7355;            /* Mittelbraun */
}
```

### Komponenten-Hierarchie
1. **Layout-Komponenten**: Header, Footer, Layout
2. **Feature-Komponenten**: ProductCard, CartSidebar, SearchBar
3. **UI-Komponenten**: Button, Input, Dialog (shadcn/ui)
4. **Utility-Komponenten**: SEOHead, ErrorBoundary

## 🔐 Sicherheit

### Best Practices
- Environment Variables für sensitive Daten
- HTTPS überall erzwungen
- Content Security Policy (CSP)
- XSS-Schutz durch React
- SQL-Injection-Schutz durch Drizzle ORM

### API-Sicherheit
- Rate Limiting auf API-Routes
- CORS-Konfiguration
- Input-Validierung
- Shopify Webhook-Verifizierung

## 📈 Performance-Metriken

### Core Web Vitals Ziele
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### Monitoring
```typescript
// Performance Monitor Integration
import { trackPerformance } from '@/lib/performance-monitor';

// Automatisches Tracking von:
- Seitenladezeiten
- API-Response-Zeiten
- Client-side Errors
- Resource Loading
```

## 🚀 Deployment

### Vercel-Konfiguration
```json
{
  "regions": ["fra1"],
  "functions": {
    "pages/api/*": {
      "maxDuration": 10
    }
  }
}
```

### Environment Variables
```bash
# Shopify
SHOPIFY_STOREFRONT_TOKEN
SHOPIFY_STORE_DOMAIN
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN

# Database
DATABASE_URL

# Analytics
NEXT_PUBLIC_GA_ID
NEXT_PUBLIC_VERCEL_ANALYTICS_ID

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
```

## 🧪 Testing-Strategie

### Test-Typen
1. **Unit Tests**: Jest + React Testing Library
2. **Integration Tests**: API-Route-Tests
3. **E2E Tests**: Cypress (geplant)
4. **Performance Tests**: Lighthouse CI

### Coverage-Ziele
- Minimum 70% Code Coverage
- 100% Coverage für kritische Geschäftslogik
- Automatische Tests in CI/CD Pipeline

## 📱 Mobile-First Ansatz

### Responsive Design
- Mobile Breakpoint: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Mobile-Optimierungen
- Touch-optimierte Interaktionen
- Vereinfachte Navigation
- Optimierte Bildgrößen
- Reduzierte JavaScript-Bundles

## 🔄 Continuous Integration

### GitHub Actions Workflow
```yaml
- Build & Type-Check
- Run Tests
- Lighthouse Performance Audit
- Deploy to Vercel (Preview/Production)
```

## 🎯 Zukünftige Erweiterungen

1. **PWA-Funktionalität**: Offline-Support
2. **Internationalisierung**: Mehrsprachigkeit
3. **Advanced Analytics**: Heatmaps, User-Journey
4. **AI-Features**: Produktempfehlungen
5. **Social Commerce**: Instagram Shopping Integration