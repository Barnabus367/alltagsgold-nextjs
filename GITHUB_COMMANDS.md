# 🚀 GITHUB DEPLOYMENT COMMANDS

## Schritt 1: Git Repository initialisieren
```bash
git init
git add -A
git commit -m "🎉 AlltagsGold Production Build - Vercel Ready"
```

## Schritt 2: GitHub Repository erstellen
1. Gehen Sie zu github.com
2. Klicken Sie "New Repository"
3. Name: `alltagsgold-nextjs`  
4. **NICHT** initialisieren mit README

## Schritt 3: Repository verknüpfen und pushen
```bash
git remote add origin https://github.com/[IHR-USERNAME]/alltagsgold-nextjs.git
git branch -M main
git push -u origin main
```

## Schritt 4: Vercel Deployment
1. Öffnen Sie vercel.com
2. Klicken Sie "New Project"
3. Importieren Sie Ihr GitHub Repository
4. **Environment Variables setzen:**
   - `SHOPIFY_STORE_DOMAIN=alltagsgold.myshopify.com`
   - `SHOPIFY_STOREFRONT_ACCESS_TOKEN=[Ihr Token]`
   - `CLOUDINARY_CLOUD_NAME=[Ihr Name]`
   - `CLOUDINARY_API_KEY=[Ihr Key]`
   - `CLOUDINARY_API_SECRET=[Ihr Secret]`
   - `NODE_ENV=production`
5. Klicken Sie "Deploy"

## ✅ SUCCESS INDICATORS
- Build: ✅ 130 statische Seiten
- Performance: ✅ 155kB First Load  
- ISR: ✅ Products (86400s), Collections (43200s)
- SEO: ✅ Meta-Tags, Structured Data
- Analytics: ✅ Web Vitals Integration