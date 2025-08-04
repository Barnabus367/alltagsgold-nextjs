# SafeImage Integration Guide

## Wie man SafeImage in bestehenden Komponenten verwendet

### 1. ProductCard.tsx
```typescript
// ALT (Original)
<Image
  src={primaryImage?.url || 'placeholder.jpg'}
  alt={primaryImage?.altText || product.title}
  width={400}
  height={400}
  className="..."
/>

// NEU (Mit SafeImage)
import { SafeImage } from '@/components/common/SafeImage';

<SafeImage
  product={product}
  imageIndex={0}
  className="..."
  sizes="(max-width: 768px) 50vw, 33vw"
/>
```

### 2. ProductDetailEnhanced.tsx
```typescript
// ALT (Original)
{product.images.edges.map((edge, index) => (
  <Image
    key={index}
    src={edge.node.url}
    alt={edge.node.altText || `${product.title} - Bild ${index + 1}`}
    width={800}
    height={800}
  />
))}

// NEU (Mit SafeProductGallery)
import { SafeProductGallery, SafeProductImage } from '@/components/common/SafeImage';

// Hauptbild
<SafeProductImage
  product={product}
  imageIndex={selectedImageIndex}
  enableZoom={true}
  className="aspect-square rounded-lg"
/>

// Thumbnail-Galerie
<SafeProductGallery
  product={product}
  selectedIndex={selectedImageIndex}
  onImageClick={setSelectedImageIndex}
  className="mt-4"
/>
```

### 3. CollectionDetail.tsx
```typescript
// In der Produktliste
{products.map((product) => (
  <div key={product.id}>
    <SafeImage
      product={product}
      imageIndex={0}
      priority={index < 4} // Erste 4 Bilder mit Priority
      className="w-full h-auto"
    />
  </div>
))}
```

## Vorteile der SafeImage Komponente

1. **Automatische Alt-Texte**: Nutzt generierte SEO-optimierte Alt-Texte
2. **Fallback-Hierarchie**: Generiert → Shopify → Standard
3. **Type-Safe**: Vollständige TypeScript-Unterstützung
4. **Performance**: Automatische Bildoptimierung mit Next.js
5. **Shopify CDN**: Nutzt WebP und responsive Größen
6. **Keine Modifikation**: Original-Produkte bleiben unverändert

## Generierung neuer Alt-Texte

```bash
# Erste Generierung
npm run generate-alt-texts

# Force-Regenerierung (überschreibt Cache)
npm run generate-alt-texts:force

# Nur für neue Produkte
npm run generate-alt-texts  # (cached werden automatisch übersprungen)
```

## Wichtige Hinweise

- Alt-Texte werden in `/data/alt-texts-lookup.json` gespeichert
- Diese Datei NICHT ins Git committen (enthält alle Produktdaten)
- Build-Prozess integriert Alt-Texte automatisch
- Fallback funktioniert auch ohne generierte Alt-Texte