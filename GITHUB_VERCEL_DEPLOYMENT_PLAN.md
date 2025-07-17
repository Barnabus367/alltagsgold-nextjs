# GitHub + Vercel Deployment Plan für AlltagsGold

## 🎯 Deployment-Strategie

### 1. Repository-Vorbereitung

#### Zu pushende Dateien (Core):
```
├── components/          # Alle UI-Komponenten
├── data/               # Statische Daten
├── hooks/              # Custom React Hooks
├── lib/                # Utilities und APIs
├── pages/              # Next.js Seiten
├── public/             # Statische Assets
├── shared/             # Geteilte Komponenten
├── styles/             # CSS/Styling
├── types/              # TypeScript Definitionen
├── next.config.js      # Next.js Konfiguration
├── package.json        # Dependencies
├── tsconfig.json       # TypeScript Config
├── tailwind.config.js  # Tailwind Konfiguration
├── postcss.config.js   # PostCSS Konfiguration
└── vercel.json         # Vercel-spezifische Config
```

#### NICHT zu pushende Dateien:
```
.env.local              # Lokale Umgebungsvariablen
.next/                  # Build-Artefakte
node_modules/           # Dependencies
attached_assets/        # Temporäre Dateien
tmp/                    # Temporäre Dateien
index.js                # Migration Tool
MIGRATION_*.md          # Migration-Dokumentation
```

### 2. .gitignore Konfiguration

#### Aktuelle .gitignore erweitern:
```gitignore
# Vercel-specific
.vercel

# Build outputs
.next/
out/

# Environment variables
.env*.local
.env.production

# Migration tools
index.js
MIGRATION_*.md
attached_assets/
tmp/

# Dependencies
node_modules/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# IDE
.vscode/
.idea/
*.swp
*.swo
```

### 3. Vercel-spezifische Konfiguration

#### vercel.json optimieren:
```json
{
  "version": 2,
  "name": "alltagsgold-nextjs",
  "build": {
    "env": {
      "NEXT_TELEMETRY_DISABLED": "1"
    }
  },
  "env": {
    "SHOPIFY_STORE_DOMAIN": "@shopify_store_domain",
    "SHOPIFY_STOREFRONT_ACCESS_TOKEN": "@shopify_storefront_access_token",
    "CLOUDINARY_CLOUD_NAME": "@cloudinary_cloud_name",
    "CLOUDINARY_API_KEY": "@cloudinary_api_key",
    "CLOUDINARY_API_SECRET": "@cloudinary_api_secret"
  },
  "functions": {
    "pages/api/**/*.js": {
      "runtime": "nodejs18.x"
    }
  }
}
```

### 4. Package.json Build-Scripts

#### Vercel-optimierte Scripts:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "vercel-build": "npm run build"
  }
}
```

### 5. Environment Variables Setup

#### In Vercel Dashboard konfigurieren:
```
SHOPIFY_STORE_DOMAIN=alltagsgold.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=[Token]
CLOUDINARY_CLOUD_NAME=[Name]
CLOUDINARY_API_KEY=[Key]
CLOUDINARY_API_SECRET=[Secret]
NEXT_TELEMETRY_DISABLED=1
NODE_ENV=production
```

### 6. Deployment-Reihenfolge

#### Phase 1: Repository-Setup
1. Lokales Git Repository initialisieren
2. .gitignore konfigurieren
3. Alle relevanten Dateien stagen
4. Initial commit erstellen

#### Phase 2: GitHub Push
1. GitHub Repository erstellen
2. Remote origin hinzufügen
3. Main branch pushen
4. Deployment-Branch erstellen (optional)

#### Phase 3: Vercel-Verbindung
1. Vercel Dashboard öffnen
2. GitHub Repository verknüpfen
3. Environment Variables setzen
4. Build Settings konfigurieren
5. Domain Setup (optional)

### 7. Build-Optimierungen für Vercel

#### next.config.js Einstellungen:
```javascript
const nextConfig = {
  // Vercel-optimiert
  output: 'standalone',
  experimental: {
    optimizeCss: true,
    optimizePackageImports: true
  },
  
  // Performance
  compress: true,
  poweredByHeader: false,
  
  // ISR Configuration
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=31536000, stale-while-revalidate=86400'
          }
        ]
      }
    ]
  }
}
```

### 8. Troubleshooting Guide

#### Häufige Vercel Build-Probleme:
1. **Environment Variables**: Alle Secrets in Vercel Dashboard setzen
2. **Node Version**: Node 18.x verwenden
3. **Build Timeout**: Output auf 'standalone' setzen
4. **Memory Issues**: Vercel Pro Plan für große Builds
5. **Static Assets**: Alle Assets in public/ Ordner

#### Build Success Checklist:
- [ ] Alle Dependencies in package.json
- [ ] Environment Variables gesetzt
- [ ] next.config.js optimiert
- [ ] .gitignore korrekt konfiguriert
- [ ] Keine lokalen Pfade in Code
- [ ] API-Routen funktional
- [ ] Static Assets verfügbar

### 9. Post-Deployment Optimierungen

#### Nach erfolgreichem Deployment:
1. **Performance-Check**: Core Web Vitals überprüfen
2. **SEO-Validierung**: Meta-Tags und Strukturierte Daten
3. **E-Commerce-Tests**: Warenkorb und Checkout-Flow
4. **Analytics-Setup**: Tracking-Integration validieren
5. **CDN-Konfiguration**: Cloudinary und Vercel Edge

#### Monitoring Setup:
- Vercel Analytics aktivieren
- Error Tracking konfigurieren
- Performance Monitoring
- Uptime Monitoring

## 🚀 Deployment Commands

```bash
# Repository Setup
git init
git add -A
git commit -m "Initial AlltagsGold production build"

# GitHub Push
git remote add origin https://github.com/[username]/alltagsgold-nextjs.git
git branch -M main
git push -u origin main

# Vercel CLI (optional)
npx vercel
npx vercel --prod
```

## ✅ Success Indicators

- ✅ Build ohne Fehler abgeschlossen
- ✅ 130 statische Seiten generiert
- ✅ ISR für Produkte und Collections aktiv
- ✅ Core Web Vitals im grünen Bereich
- ✅ Shopify API-Integration funktional
- ✅ Cloudinary-Bildoptimierung aktiv