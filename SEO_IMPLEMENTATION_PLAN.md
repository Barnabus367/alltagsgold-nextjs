# SEO-Optimierung Umsetzungsplan für AlltagsGold.ch

## 🎯 PHASE 1: KRITISCHE FIXES (Tag 1-3)

### Tag 1: Homepage SEO reparieren
**Status:** 🔴 KRITISCH - Keine Meta-Tags auf Homepage sichtbar

#### 1.1 Homepage SEO-Komponente korrigieren
```typescript
// pages/index.tsx - SEOHead Component aktivieren
<SEOHead 
  seo={seoData} 
  canonicalUrl="/" 
/>
```

**Aktuelle Probleme:**
- ❌ Title-Tag wird nicht gerendert
- ❌ Meta-Description fehlt
- ❌ Canonical URL nicht gesetzt

**Ziel-Implementation:**
- ✅ Title: "AlltagsGold | Haushaltsware Schweiz ✓ Gratis Versand ✓ Top Bewertungen"
- ✅ Description: "Haushaltsware & Küchenhelfer günstig kaufen ✓ Schweizer Online Shop ✓ Gratis Versand ab CHF 50 ✓ 4.8★ Bewertungen"
- ✅ Canonical: https://www.alltagsgold.ch

#### 1.2 SEO-Templates korrigieren
```typescript
// lib/seo.ts - Homepage Template verbessern
home: {
  pageName: "Haushaltsware Schweiz ✓ Gratis Versand ✓ Top Bewertungen",
  description: "Haushaltsware & Küchenhelfer günstig kaufen ✓ Schweizer Online Shop ✓ Gratis Versand ab CHF 50 ✓ 4.8★ Bewertungen ✓ Sofort lieferbar"
}
```

---

### Tag 2: Produktseiten SEO aktivieren
**Status:** 🟡 TEILWEISE - SEOHelmet vorhanden aber canonicalUrl fehlt

#### 2.1 Canonical URLs für alle Produktseiten
```typescript
// pages/products/[handle].tsx
<SEOHelmet
  canonicalUrl={`/products/${product.handle}`}
  // ... andere Props
/>
```

#### 2.2 Produktseiten-Validierung
- [ ] 116 Produkte mit Canonical URLs
- [ ] Meta-Descriptions optimiert
- [ ] Strukturierte Daten aktiviert

---

### Tag 3: Collection-Seiten optimieren
**Status:** 🟡 TEILWEISE - SEO-Komponente fehlt canonicalUrl

#### 3.1 Collection SEO implementieren
```typescript
// pages/collections/[handle].tsx
<SEOHelmet
  canonicalUrl={`/collections/${collection.handle}`}
  // ... collection SEO data
/>
```

---

## 🚀 PHASE 2: RANKING-OPTIMIERUNG (Tag 4-7)

### Tag 4: Rich Snippets implementieren
**Ziel:** Google Rich Snippets für bessere CTR

#### 4.1 Product Schema erweitern
```json
{
  "@type": "Product",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "127"
  },
  "offers": {
    "@type": "Offer",
    "availability": "InStock",
    "priceCurrency": "CHF"
  }
}
```

#### 4.2 Breadcrumb Schema
```json
{
  "@type": "BreadcrumbList",
  "itemListElement": [...]
}
```

### Tag 5: Lokale SEO für Schweiz
**Ziel:** Schweizer Suchintention optimieren

#### 5.1 Swiss Keywords Integration
- [ ] "Schweiz" in allen Title-Tags
- [ ] Swiss German Begriffe
- [ ] Lokale Suchanfragen

#### 5.2 hreflang Implementation
```html
<link rel="alternate" hreflang="de-ch" href="https://www.alltagsgold.ch/" />
<link rel="alternate" hreflang="de" href="https://www.alltagsgold.ch/" />
```

### Tag 6-7: Google Search Console Setup
- [ ] Property verifizieren
- [ ] Sitemap einreichen
- [ ] Performance Monitoring

---

## 📊 TESTING & VALIDIERUNG

### Validation Checklist
```bash
# SEO-Validierung ausführen
node scripts/validate-seo.js
node scripts/validate-canonical.js
node scripts/seo-deploy-checklist.js
```

**Ziel-Metriken:**
- SEO Coverage: 78% → 95%
- Canonical URL Coverage: 44% → 100%
- Rich Snippets: 0 → Alle Produktseiten

### Live-Testing
```bash
# Meta-Tags prüfen
curl -s "https://www.alltagsgold.ch" | grep -i "title\|description\|canonical"

# Strukturierte Daten testen
# https://search.google.com/test/rich-results
```

---

## 🎯 ERFOLGS-METRIKEN

### Sofortige Verbesserungen (Tag 1-3)
- [ ] Homepage Title/Description sichtbar
- [ ] 116 Produktseiten mit Canonical URLs
- [ ] SEO Coverage > 90%

### Mittelfristige Ziele (Woche 2-4)
- [ ] Google Rich Snippets aktiv
- [ ] Top 10 für "Haushaltsware Schweiz"
- [ ] +50% organischer Traffic

### Langfristige Ziele (Monat 2-3)
- [ ] +150% organischer Traffic
- [ ] Featured Snippets für Kategorien
- [ ] Brand-Sichtbarkeit "AlltagsGold"

---

## 🚨 RISIKO-MANAGEMENT

### Potentielle Probleme
1. **Client-Side Rendering**: Meta-Tags nicht von Crawlern erkannt
2. **Caching Issues**: Vercel Cache blockiert SEO-Updates
3. **Schema Validation**: Strukturierte Daten Fehler

### Backup-Plan
- Server-Side Rendering für kritische SEO-Seiten
- Cache-Invalidierung nach SEO-Updates
- Schema.org Validator vor Deployment

---

## 📅 TIMELINE ÜBERSICHT

| Tag | Aufgabe | Status | Priorität |
|-----|---------|--------|-----------|
| 1 | Homepage SEO | 🔴 | KRITISCH |
| 2 | Produktseiten Canonical | 🟡 | HOCH |
| 3 | Collection SEO | 🟡 | HOCH |
| 4 | Rich Snippets | 🟢 | MITTEL |
| 5 | Lokale SEO | 🟢 | MITTEL |
| 6-7 | Google Console | 🟢 | NIEDRIG |

**Nächster Schritt:** Homepage SEO-Komponente reparieren und testen
