import { NextApiRequest, NextApiResponse } from 'next';

// PWA Manifest API Route als Fallback
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set proper headers for manifest
  res.setHeader('Content-Type', 'application/manifest+json');
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
  
  const manifest = {
    "name": "AlltagsGold - Premium Lifestyle Products",
    "short_name": "AlltagsGold",
    "description": "Entdecke premium Lifestyle-Produkte für den modernen Alltag. Hochwertige Auswahl, schneller Versand, erstklassiger Service.",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#059669",
    "orientation": "portrait-primary",
    "scope": "/",
    "lang": "de-DE",
    "dir": "ltr",
    "categories": ["shopping", "lifestyle", "business"],
    "icons": [
      {
        "src": "/icons/icon-72x72.png",
        "sizes": "72x72",
        "type": "image/png",
        "purpose": "maskable any"
      },
      {
        "src": "/icons/icon-96x96.png",
        "sizes": "96x96", 
        "type": "image/png",
        "purpose": "maskable any"
      },
      {
        "src": "/icons/icon-128x128.png",
        "sizes": "128x128",
        "type": "image/png",
        "purpose": "maskable any"
      },
      {
        "src": "/icons/icon-144x144.png",
        "sizes": "144x144",
        "type": "image/png",
        "purpose": "maskable any"
      },
      {
        "src": "/icons/icon-152x152.png",
        "sizes": "152x152",
        "type": "image/png",
        "purpose": "maskable any"
      },
      {
        "src": "/icons/icon-192x192.png",
        "sizes": "192x192",
        "type": "image/png",
        "purpose": "maskable any"
      },
      {
        "src": "/icons/icon-384x384.png",
        "sizes": "384x384",
        "type": "image/png",
        "purpose": "maskable any"
      },
      {
        "src": "/icons/icon-512x512.png",
        "sizes": "512x512",
        "type": "image/png",
        "purpose": "maskable any"
      }
    ],
    "shortcuts": [
      {
        "name": "Warenkorb",
        "short_name": "Warenkorb",
        "description": "Direkt zum Warenkorb",
        "url": "/cart",
        "icons": [
          {
            "src": "/icons/cart-shortcut.png",
            "sizes": "96x96"
          }
        ]
      },
      {
        "name": "Neue Produkte",
        "short_name": "Neu",
        "description": "Entdecke neue Produkte",
        "url": "/collections/new-arrivals",
        "icons": [
          {
            "src": "/icons/new-shortcut.png",
            "sizes": "96x96"
          }
        ]
      }
    ],
    "related_applications": [],
    "prefer_related_applications": false
  };

  res.status(200).json(manifest);
}
