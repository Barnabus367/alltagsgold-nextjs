// Intelligente Bildauswahl: Shopify-First mit optimierten Fallbacks
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

  // 2. FALLBACK: Kuratierte Bilder für spezifische Collections
  const exactMappings: Record<string, string> = {
    'haushaltsgerate': 'https://res.cloudinary.com/dwrk3iihw/image/upload/w_800,q_auto,f_webp/v1750348905/pexels-elly-fairytale-3806953_su8gtr.jpg',
    'reinigungsgerate': 'https://res.cloudinary.com/dwrk3iihw/image/upload/w_800,q_auto,f_webp/v1750349439/pexels-olly-3768910_bjtf5z.jpg',
    'luftreiniger-luftbefeuchter': 'https://res.cloudinary.com/dwrk3iihw/image/upload/w_800,q_auto,f_webp/v1750349603/pexels-alireza-kaviani-535828-1374448_wlk6mk.jpg',
    'technik-gadgets': 'https://res.cloudinary.com/dwrk3iihw/image/upload/w_800,q_auto,f_webp/v1750349707/pexels-sorjigrey-9956769_li3wx9.jpg',
    'kuchengerate-1': 'https://res.cloudinary.com/dwrk3iihw/image/upload/w_800,q_auto,f_webp/v1750350657/pexels-jvdm-1599791_hkiovx.jpg',
    'bbq-grill': 'https://res.cloudinary.com/dwrk3iihw/image/upload/w_800,q_auto,f_webp/v1750350703/barbeque_1_vnzqln.jpg',
    'aufbewahrung-organisation': 'https://res.cloudinary.com/dwrk3iihw/image/upload/w_800,q_auto,f_webp/v1750350827/pexels-cottonbro-4553182_rduji7.jpg',
    'selfcare-beauty': 'https://res.cloudinary.com/dwrk3iihw/image/upload/w_800,q_auto,f_webp/v1750350903/pexels-juanpphotoandvideo-1242349_cqpjuv.jpg',
    'dekoration': 'https://res.cloudinary.com/dwrk3iihw/image/upload/w_800,q_auto,f_webp/v1750350978/pexels-kevin-malik-9016170_wd3swb.jpg',
    'beleuchtung': 'https://res.cloudinary.com/dwrk3iihw/image/upload/w_800,q_auto,f_webp/v1750351051/pexels-pixabay-356048_t33j1h.jpg',
  };

  // 3. FALLBACK: Prüfe exakte Handle-Übereinstimmung
  if (exactMappings[lowerHandle]) {
    return exactMappings[lowerHandle];
  }

  // 4. LAST RESORT: Keyword-basierte intelligente Zuordnung
  // 1. Küche - Küchengeräte
  if (lowerTitle.includes('küche') || lowerTitle.includes('kitchen') || 
      lowerHandle.includes('kitchen') || lowerHandle.includes('kuche') || lowerHandle.includes('kueche')) {
    return 'https://res.cloudinary.com/dwrk3iihw/image/upload/w_800,q_auto,f_webp/v1750350657/pexels-jvdm-1599791_hkiovx.jpg';
  }
  
  // 2. Haushalt - Haushaltsgeräte
  if (lowerTitle.includes('haushalt') || lowerTitle.includes('household') || lowerTitle.includes('home') ||
      lowerHandle.includes('household') || lowerHandle.includes('home') || lowerHandle.includes('haushalt')) {
    return 'https://res.cloudinary.com/dwrk3iihw/image/upload/w_800,q_auto,f_webp/v1750348905/pexels-elly-fairytale-3806953_su8gtr.jpg';
  }
  
  // 3. Reinigung - Reinigungsgeräte
  if (lowerTitle.includes('reinigung') || lowerTitle.includes('cleaning') || lowerTitle.includes('clean') ||
      lowerHandle.includes('cleaning') || lowerHandle.includes('clean') || lowerHandle.includes('reinigung')) {
    return 'https://res.cloudinary.com/dwrk3iihw/image/upload/w_800,q_auto,f_webp/v1750349439/pexels-olly-3768910_bjtf5z.jpg';
  }
  
  // 4. Luftreinigung - Luftreiniger & Luftbefeuchter
  if (lowerTitle.includes('luftreinigung') || lowerTitle.includes('air') || lowerTitle.includes('luft') ||
      lowerHandle.includes('air') || lowerHandle.includes('luft') || lowerHandle.includes('luftreinigung')) {
    return 'https://res.cloudinary.com/dwrk3iihw/image/upload/w_800,q_auto,f_webp/v1750349603/pexels-alireza-kaviani-535828-1374448_wlk6mk.jpg';
  }
  
  // 5. Technik und Gadgets
  if (lowerTitle.includes('technik') || lowerTitle.includes('gadget') || lowerTitle.includes('tech') ||
      lowerHandle.includes('tech') || lowerHandle.includes('gadget') || lowerHandle.includes('electronic')) {
    return 'https://res.cloudinary.com/dwrk3iihw/image/upload/w_800,q_auto,f_webp/v1750349707/pexels-sorjigrey-9956769_li3wx9.jpg';
  }

  // Erweiterte Keyword-Zuordnungen für neue Kategorien
  
  // BBQ & Grill
  if (lowerTitle.includes('bbq') || lowerTitle.includes('grill') || lowerTitle.includes('barbecue') ||
      lowerHandle.includes('bbq') || lowerHandle.includes('grill') || lowerHandle.includes('barbecue')) {
    return 'https://res.cloudinary.com/dwrk3iihw/image/upload/w_800,q_auto,f_webp/v1750350703/barbeque_1_vnzqln.jpg';
  }
  
  // Aufbewahrung & Organisation
  if (lowerTitle.includes('aufbewahrung') || lowerTitle.includes('organisation') || lowerTitle.includes('organizer') ||
      lowerHandle.includes('storage') || lowerHandle.includes('organizer') || lowerHandle.includes('aufbewahrung') ||
      lowerHandle.includes('organisation')) {
    return 'https://res.cloudinary.com/dwrk3iihw/image/upload/w_800,q_auto,f_webp/v1750350827/pexels-cottonbro-4553182_rduji7.jpg';
  }
  
  // Beauty & Pflege - spezifisches Selfcare-Bild
  if (lowerTitle.includes('beauty') || lowerTitle.includes('pflege') || lowerTitle.includes('wellness') ||
      lowerTitle.includes('selfcare') || lowerHandle.includes('beauty') || lowerHandle.includes('care') || 
      lowerHandle.includes('wellness') || lowerHandle.includes('selfcare')) {
    return 'https://res.cloudinary.com/dwrk3iihw/image/upload/w_800,q_auto,f_webp/v1750350903/pexels-juanpphotoandvideo-1242349_cqpjuv.jpg';
  }
  
  // Dekoration & Design
  if (lowerTitle.includes('dekoration') || lowerTitle.includes('deko') || lowerTitle.includes('design') ||
      lowerHandle.includes('decoration') || lowerHandle.includes('deko') || lowerHandle.includes('design')) {
    return 'https://res.cloudinary.com/dwrk3iihw/image/upload/w_800,q_auto,f_webp/v1750350978/pexels-kevin-malik-9016170_wd3swb.jpg';
  }
  
  // Beleuchtung & Licht
  if (lowerTitle.includes('beleuchtung') || lowerTitle.includes('licht') || lowerTitle.includes('lampe') ||
      lowerHandle.includes('lighting') || lowerHandle.includes('light') || lowerHandle.includes('lamp') ||
      lowerHandle.includes('beleuchtung')) {
    return 'https://res.cloudinary.com/dwrk3iihw/image/upload/w_800,q_auto,f_webp/v1750351051/pexels-pixabay-356048_t33j1h.jpg';
  }

  // Fallback-Kategorien mit optimierten Bildern
  
  // Sport & Fitness - verwende Tech Gadget
  if (lowerTitle.includes('sport') || lowerTitle.includes('fitness') || lowerTitle.includes('outdoor') ||
      lowerHandle.includes('sport') || lowerHandle.includes('fitness') || lowerHandle.includes('outdoor')) {
    return 'https://res.cloudinary.com/dwrk3iihw/image/upload/w_800,q_auto,f_webp/v1750349707/pexels-sorjigrey-9956769_li3wx9.jpg';
  }
  
  // Mode & Accessoires - verwende Beauty/Selfcare
  if (lowerTitle.includes('mode') || lowerTitle.includes('fashion') || lowerTitle.includes('accessoires') ||
      lowerHandle.includes('fashion') || lowerHandle.includes('accessories') || lowerHandle.includes('style')) {
    return 'https://res.cloudinary.com/dwrk3iihw/image/upload/w_800,q_auto,f_webp/v1750350903/pexels-juanpphotoandvideo-1242349_cqpjuv.jpg';
  }
  
  // Auto & Fahrzeug - verwende Tech Gadget
  if (lowerTitle.includes('auto') || lowerTitle.includes('car') || lowerTitle.includes('fahrzeug') ||
      lowerHandle.includes('auto') || lowerHandle.includes('car') || lowerHandle.includes('vehicle')) {
    return 'https://res.cloudinary.com/dwrk3iihw/image/upload/w_800,q_auto,f_webp/v1750349707/pexels-sorjigrey-9956769_li3wx9.jpg';
  }
  
  // Büro & Arbeit - verwende Aufbewahrung/Organisation
  if (lowerTitle.includes('büro') || lowerTitle.includes('office') || lowerTitle.includes('arbeit') ||
      lowerHandle.includes('office') || lowerHandle.includes('work') || lowerHandle.includes('business')) {
    return 'https://res.cloudinary.com/dwrk3iihw/image/upload/w_800,q_auto,f_webp/v1750350827/pexels-cottonbro-4553182_rduji7.jpg';
  }
  
  // Garten & Outdoor - verwende BBQ/Grill als Outdoor-Bezug
  if (lowerTitle.includes('garten') || lowerTitle.includes('garden') || lowerTitle.includes('outdoor') ||
      lowerHandle.includes('garden') || lowerHandle.includes('outdoor') || lowerHandle.includes('plant')) {
    return 'https://res.cloudinary.com/dwrk3iihw/image/upload/w_800,q_auto,f_webp/v1750350703/barbeque_1_vnzqln.jpg';
  }
  
  // Baby & Kinder - verwende Haushaltsgeräte
  if (lowerTitle.includes('baby') || lowerTitle.includes('kinder') || lowerTitle.includes('kind') ||
      lowerHandle.includes('baby') || lowerHandle.includes('kids') || lowerHandle.includes('children')) {
    return 'https://res.cloudinary.com/dwrk3iihw/image/upload/w_800,q_auto,f_webp/v1750348905/pexels-elly-fairytale-3806953_su8gtr.jpg';
  }
  
  // Tier & Haustier - verwende Reinigungsgeräte
  if (lowerTitle.includes('tier') || lowerTitle.includes('haustier') || lowerTitle.includes('hund') || lowerTitle.includes('katze') ||
      lowerHandle.includes('pet') || lowerHandle.includes('dog') || lowerHandle.includes('cat') || lowerHandle.includes('animal')) {
    return 'https://res.cloudinary.com/dwrk3iihw/image/upload/w_800,q_auto,f_webp/v1750349439/pexels-olly-3768910_bjtf5z.jpg';
  }
  
  // Werkzeug & Handwerk - verwende Küchengeräte als Tool-Bezug
  if (lowerTitle.includes('werkzeug') || lowerTitle.includes('handwerk') || lowerTitle.includes('tool') ||
      lowerHandle.includes('tools') || lowerHandle.includes('craft') || lowerHandle.includes('diy')) {
    return 'https://res.cloudinary.com/dwrk3iihw/image/upload/w_800,q_auto,f_webp/v1750350657/pexels-jvdm-1599791_hkiovx.jpg';
  }
  
  // 5. ULTIMATE FALLBACK: Premium default für AlltagsGold
  return 'https://res.cloudinary.com/dwrk3iihw/image/upload/w_800,q_auto,f_webp/v1750350657/pexels-jvdm-1599791_hkiovx.jpg';
};

// Typ-sichere Bildoptimierung für verschiedene Kontexte - VERBESSERTE QUALITÄT
export const getOptimizedImageUrl = (
  originalUrl: string | null | undefined,
  context: 'hero' | 'card' | 'thumbnail' | 'detail' = 'card'
): string => {
  // DEBUG: Log incoming URLs
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 getOptimizedImageUrl called:', { originalUrl, context });
  }

  if (!originalUrl || originalUrl.includes('placeholder')) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Invalid or placeholder URL detected:', originalUrl);
    }
    return '';
  }

  const sizeMap = {
    hero: 'w_1920,h_1080',
    detail: 'w_800,h_800', 
    card: 'w_400,h_400',
    thumbnail: 'w_150,h_150'
  };

  const size = sizeMap[context];
  
  // Cloudinary optimization mit höherer Qualität (q_90 statt q_auto)
  const optimizedUrl = `https://res.cloudinary.com/dwrk3iihw/image/fetch/${size},q_90,f_auto,r_8/${encodeURIComponent(originalUrl)}`;
  
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Optimized URL created:', optimizedUrl);
  }
  
  return optimizedUrl;
};