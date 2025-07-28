// Intelligente Bildauswahl: Shopify-First mit optimierten Fallbacks
import { getNewCloudinaryUrl, getCloudinaryAssetUrl } from './cloudinary-config';

export const getCategoryImage = (
  collectionTitle: string, 
  collectionHandle: string, 
  shopifyImage?: string | null
): string => {
  // 1. PRIORITY: Verwende echtes Shopify-Bild wenn verfügbar
  if (shopifyImage && shopifyImage.trim() && !shopifyImage.includes('placeholder')) {
    return shopifyImage;
  }

  const lowerTitle = collectionTitle.toLowerCase();
  const lowerHandle = collectionHandle.toLowerCase();

  // 2. FALLBACK: Kuratierte Bilder für spezifische Collections (NEUE CLOUDINARY)
  const exactMappings: Record<string, string> = {
    'haushaltsgerate': getCloudinaryAssetUrl('pexels-elly-fairytale-3806953_su8gtr', 'card'),
    'reinigungsgerate': getCloudinaryAssetUrl('pexels-olly-3768910_bjtf5z', 'card'),
    'luftreiniger-luftbefeuchter': getCloudinaryAssetUrl('pexels-alireza-kaviani-535828-1374448_wlk6mk', 'card'),
    'technik-gadgets': getCloudinaryAssetUrl('pexels-sorjigrey-9956769_li3wx9', 'card'),
    'kuchengerate-1': getCloudinaryAssetUrl('pexels-jvdm-1599791_hkiovx', 'card'),
    'bbq-grill': getCloudinaryAssetUrl('barbeque_1_vnzqln', 'card'),
    'aufbewahrung-organisation': getCloudinaryAssetUrl('pexels-cottonbro-4553182_rduji7', 'card'),
    'selfcare-beauty': getCloudinaryAssetUrl('pexels-juanpphotoandvideo-1242349_cqpjuv', 'card'),
    'dekoration': getCloudinaryAssetUrl('pexels-kevin-malik-9016170_wd3swb', 'card'),
    'beleuchtung': getCloudinaryAssetUrl('pexels-pixabay-356048_t33j1h', 'card'),
  };

  // 3. FALLBACK: Prüfe exakte Handle-Übereinstimmung
  if (exactMappings[lowerHandle]) {
    return exactMappings[lowerHandle];
  }

  // 4. LAST RESORT: Keyword-basierte intelligente Zuordnung mit neuer Cloudinary
  // 1. Küche - Küchengeräte
  if (lowerTitle.includes('küche') || lowerTitle.includes('kitchen') || 
      lowerHandle.includes('kitchen') || lowerHandle.includes('kuche') || lowerHandle.includes('kueche')) {
    return getCloudinaryAssetUrl('pexels-jvdm-1599791_hkiovx', 'card');
  }
  
  // 2. Haushalt - Haushaltsgeräte
  if (lowerTitle.includes('haushalt') || lowerTitle.includes('household') || lowerTitle.includes('home') ||
      lowerHandle.includes('household') || lowerHandle.includes('home') || lowerHandle.includes('haushalt')) {
    return getCloudinaryAssetUrl('pexels-elly-fairytale-3806953_su8gtr', 'card');
  }
  
  // 3. Reinigung - Reinigungsgeräte
  if (lowerTitle.includes('reinigung') || lowerTitle.includes('cleaning') || lowerTitle.includes('clean') ||
      lowerHandle.includes('cleaning') || lowerHandle.includes('clean') || lowerHandle.includes('reinigung')) {
    return getCloudinaryAssetUrl('pexels-olly-3768910_bjtf5z', 'card');
  }
  
  // 4. Luftreinigung - Luftreiniger & Luftbefeuchter
  if (lowerTitle.includes('luftreinigung') || lowerTitle.includes('air') || lowerTitle.includes('luft') ||
      lowerHandle.includes('air') || lowerHandle.includes('luft') || lowerHandle.includes('luftreinigung')) {
    return getCloudinaryAssetUrl('pexels-alireza-kaviani-535828-1374448_wlk6mk', 'card');
  }
  
  // 5. Technik und Gadgets
  if (lowerTitle.includes('technik') || lowerTitle.includes('gadget') || lowerTitle.includes('tech') ||
      lowerHandle.includes('tech') || lowerHandle.includes('gadget') || lowerHandle.includes('electronic')) {
    return getCloudinaryAssetUrl('pexels-sorjigrey-9956769_li3wx9', 'card');
  }

  // Erweiterte Keyword-Zuordnungen für neue Kategorien
  
  // BBQ & Grill
  if (lowerTitle.includes('bbq') || lowerTitle.includes('grill') || lowerTitle.includes('barbecue') ||
      lowerHandle.includes('bbq') || lowerHandle.includes('grill') || lowerHandle.includes('barbecue')) {
    return getCloudinaryAssetUrl('barbeque_1_vnzqln', 'card');
  }
  
  // Aufbewahrung & Organisation
  if (lowerTitle.includes('aufbewahrung') || lowerTitle.includes('organisation') || lowerTitle.includes('organizer') ||
      lowerHandle.includes('storage') || lowerHandle.includes('organizer') || lowerHandle.includes('aufbewahrung') ||
      lowerHandle.includes('organisation')) {
    return getCloudinaryAssetUrl('pexels-cottonbro-4553182_rduji7', 'card');
  }
  
  // Beauty & Pflege - spezifisches Selfcare-Bild
  if (lowerTitle.includes('beauty') || lowerTitle.includes('pflege') || lowerTitle.includes('wellness') ||
      lowerTitle.includes('selfcare') || lowerHandle.includes('beauty') || lowerHandle.includes('care') || 
      lowerHandle.includes('wellness') || lowerHandle.includes('selfcare')) {
    return getCloudinaryAssetUrl('pexels-juanpphotoandvideo-1242349_cqpjuv', 'card');
  }
  
  // Dekoration & Design
  if (lowerTitle.includes('dekoration') || lowerTitle.includes('deko') || lowerTitle.includes('design') ||
      lowerHandle.includes('decoration') || lowerHandle.includes('deko') || lowerHandle.includes('design')) {
    return getCloudinaryAssetUrl('pexels-kevin-malik-9016170_wd3swb', 'card');
  }
  
  // Beleuchtung & Licht
  if (lowerTitle.includes('beleuchtung') || lowerTitle.includes('licht') || lowerTitle.includes('lampe') ||
      lowerHandle.includes('lighting') || lowerHandle.includes('light') || lowerHandle.includes('lamp') ||
      lowerHandle.includes('beleuchtung')) {
    return getCloudinaryAssetUrl('pexels-pixabay-356048_t33j1h', 'card');
  }

  // Fallback-Kategorien mit optimierten Bildern
  
  // Sport & Fitness - verwende Tech Gadget
  if (lowerTitle.includes('sport') || lowerTitle.includes('fitness') || lowerTitle.includes('outdoor') ||
      lowerHandle.includes('sport') || lowerHandle.includes('fitness') || lowerHandle.includes('outdoor')) {
    return getCloudinaryAssetUrl('pexels-sorjigrey-9956769_li3wx9');
  }
  
  // Mode & Accessoires - verwende Beauty/Selfcare
  if (lowerTitle.includes('mode') || lowerTitle.includes('fashion') || lowerTitle.includes('accessoires') ||
      lowerHandle.includes('fashion') || lowerHandle.includes('accessories') || lowerHandle.includes('style')) {
    return getCloudinaryAssetUrl('pexels-juanpphotoandvideo-1242349_cqpjuv');
  }
  
  // Auto & Fahrzeug - verwende Tech Gadget
  if (lowerTitle.includes('auto') || lowerTitle.includes('car') || lowerTitle.includes('fahrzeug') ||
      lowerHandle.includes('auto') || lowerHandle.includes('car') || lowerHandle.includes('vehicle')) {
    return getCloudinaryAssetUrl('pexels-sorjigrey-9956769_li3wx9');
  }
  
  // Büro & Arbeit - verwende Aufbewahrung/Organisation
  if (lowerTitle.includes('büro') || lowerTitle.includes('office') || lowerTitle.includes('arbeit') ||
      lowerHandle.includes('office') || lowerHandle.includes('work') || lowerHandle.includes('business')) {
    return getCloudinaryAssetUrl('pexels-cottonbro-4553182_rduji7');
  }
  
  // Garten & Outdoor - verwende BBQ/Grill als Outdoor-Bezug
  if (lowerTitle.includes('garten') || lowerTitle.includes('garden') || lowerTitle.includes('outdoor') ||
      lowerHandle.includes('garden') || lowerHandle.includes('outdoor') || lowerHandle.includes('plant')) {
    return getCloudinaryAssetUrl('barbeque_1_vnzqln', 'card');
  }
  
  // Baby & Kinder - verwende Haushaltsgeräte
  if (lowerTitle.includes('baby') || lowerTitle.includes('kinder') || lowerTitle.includes('kind') ||
      lowerHandle.includes('baby') || lowerHandle.includes('kids') || lowerHandle.includes('children')) {
    return getCloudinaryAssetUrl('pexels-elly-fairytale-3806953_su8gtr', 'card');
  }
  
  // Tier & Haustier - verwende Reinigungsgeräte
  if (lowerTitle.includes('tier') || lowerTitle.includes('haustier') || lowerTitle.includes('hund') || lowerTitle.includes('katze') ||
      lowerHandle.includes('pet') || lowerHandle.includes('dog') || lowerHandle.includes('cat') || lowerHandle.includes('animal')) {
    return getCloudinaryAssetUrl('pexels-olly-3768910_bjtf5z', 'card');
  }
  
  // Werkzeug & Handwerk - verwende Küchengeräte als Tool-Bezug
  if (lowerTitle.includes('werkzeug') || lowerTitle.includes('handwerk') || lowerTitle.includes('tool') ||
      lowerHandle.includes('tools') || lowerHandle.includes('craft') || lowerHandle.includes('diy')) {
    return getCloudinaryAssetUrl('pexels-jvdm-1599791_hkiovx', 'card');
  }
  
  // 5. ULTIMATE FALLBACK: Premium default für AlltagsGold mit neuer Cloudinary
  return getCloudinaryAssetUrl('pexels-jvdm-1599791_hkiovx', 'card');
};

// Typ-sichere Bildoptimierung für verschiedene Kontexte - NEUE CLOUDINARY
export const getOptimizedImageUrl = (
  originalUrl: string | null | undefined,
  context: 'hero' | 'card' | 'thumbnail' | 'detail' = 'card'
): string => {
  // DEBUG: Log incoming URLs
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 getOptimizedImageUrl (NEW CLOUDINARY) called:', { originalUrl, context });
  }

  if (!originalUrl || originalUrl.includes('placeholder')) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Invalid or placeholder URL detected:', originalUrl);
    }
    return '';
  }

  // Verwende die neue Cloudinary-Konfiguration
  const optimizedUrl = getNewCloudinaryUrl(originalUrl, context);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ NEW Cloudinary optimized URL created:', optimizedUrl);
  }
  
  return optimizedUrl;
};