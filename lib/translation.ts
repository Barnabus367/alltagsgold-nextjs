// Translation utility using manual German translations
// Cache for translated content to avoid re-translating
const translationCache = new Map<string, string>();

// Manual German translations for common e-commerce terms
const manualTranslations: Record<string, string> = {
  // Colors
  'black': 'Schwarz',
  'white': 'Weiß',
  'red': 'Rot',
  'blue': 'Blau', 
  'green': 'Grün',
  'yellow': 'Gelb',
  'orange': 'Orange',
  'purple': 'Lila',
  'pink': 'Rosa',
  'gray': 'Grau',
  'grey': 'Grau',
  'brown': 'Braun',
  'navy': 'Marineblau',
  'gold': 'Gold',
  'silver': 'Silber',
  'beige': 'Beige',
  'cream': 'Creme',
  
  // Sizes
  'small': 'Klein',
  'medium': 'Mittel', 
  'large': 'Groß',
  'extra large': 'Extra Groß',
  'xl': 'XL',
  'xxl': 'XXL',
  's': 'S',
  'm': 'M',
  'l': 'L',
  
  // Common product terms
  'default title': 'Standard',
  'default': 'Standard',
  'regular': 'Standard',
  'one size': 'Einheitsgröße',
  'free size': 'Freie Größe',
  'unisex': 'Unisex',
  'men': 'Herren',
  'women': 'Damen',
  'kids': 'Kinder',
  'baby': 'Baby',
  
  // Materials
  'cotton': 'Baumwolle',
  'silk': 'Seide',
  'wool': 'Wolle',
  'leather': 'Leder',
  'metal': 'Metall',
  'plastic': 'Kunststoff',
  'glass': 'Glas',
  'ceramic': 'Keramik',
  'wood': 'Holz',
  
  // Common descriptions
  'premium quality': 'Premium Qualität',
  'high quality': 'Hochwertige Qualität',
  'durable': 'Langlebig',
  'comfortable': 'Bequem',
  'stylish': 'Stilvoll',
  'modern': 'Modern',
  'classic': 'Klassisch',
  'elegant': 'Elegant',
  'casual': 'Lässig',
  'formal': 'Formell',
  
  // Product categories and types
  'jewelry': 'Schmuck',
  'accessories': 'Accessoires',
  'home': 'Haus & Garten',
  'fashion': 'Mode',
  'electronics': 'Elektronik',
  'beauty': 'Schönheit',
  'health': 'Gesundheit',
  'sports': 'Sport',
  'outdoor': 'Outdoor',
  'kitchen': 'Küche',
  'decoration': 'Dekoration',
  'gift': 'Geschenk',
  'gifts': 'Geschenke',
  
  // Common adjectives
  'new': 'Neu',
  'bestseller': 'Bestseller',
  'popular': 'Beliebt',
  'trending': 'Trending',
  'limited': 'Limitiert',
  'exclusive': 'Exklusiv',
  'handmade': 'Handgemacht',
  'vintage': 'Vintage',
  'retro': 'Retro',
  'unique': 'Einzigartig',
  'rare': 'Selten',
  'original': 'Original',
  'authentic': 'Authentisch',
  
  // Common product features
  'waterproof': 'Wasserdicht',
  'wireless': 'Drahtlos',
  'rechargeable': 'Aufladbar',
  'portable': 'Tragbar',
  'lightweight': 'Leichtgewicht',
  'heavy duty': 'Robust',
  'eco friendly': 'Umweltfreundlich',
  'sustainable': 'Nachhaltig',
  'organic': 'Bio',
  'natural': 'Natürlich',
  
  // Brand and quality terms
  'brand new': 'Brandneu',
  'top quality': 'Top Qualität',
  'best seller': 'Bestseller',
  'customer favorite': 'Kundenfavorit',
  'highly rated': 'Hochbewertet',
  'recommended': 'Empfohlen'
};

export async function translateText(text: string, targetLang: string = 'DE'): Promise<string> {
  // Return immediately if text is empty
  if (!text || text.length < 2) return text;
  
  // Create cache key
  const cacheKey = `${text}-${targetLang}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  // Skip if text appears to already be German
  const germanWords = ['der', 'die', 'das', 'und', 'oder', 'mit', 'für', 'von', 'zu', 'auf', 'in', 'aus', 'an', 'bei', 'nach', 'vor', 'über', 'unter', 'zwischen', 'schwarz', 'weiß', 'rot', 'blau', 'grün'];
  const textLower = text.toLowerCase();
  const hasGermanWords = germanWords.some(word => textLower.includes(word));
  
  if (hasGermanWords) {
    translationCache.set(cacheKey, text);
    return text;
  }

  // Check manual translations first
  const lowerText = text.toLowerCase().trim();
  if (manualTranslations[lowerText]) {
    const translated = manualTranslations[lowerText];
    translationCache.set(cacheKey, translated);
    return translated;
  }

  // For longer texts, try to translate word by word and combine
  const words = text.split(/\s+/);
  if (words.length > 1) {
    const translatedWords = words.map(word => {
      const lowerWord = word.toLowerCase().replace(/[^\w]/g, '');
      return manualTranslations[lowerWord] || word;
    });
    const result = translatedWords.join(' ');
    translationCache.set(cacheKey, result);
    return result;
  }

  // If no translation found, return original
  translationCache.set(cacheKey, text);
  return text;
}

export async function translateProductTitle(title: string): Promise<string> {
  return translateText(title);
}

export async function translateProductDescription(description: string): Promise<string> {
  return translateText(description);
}

export async function translateVariantTitle(variantTitle: string): Promise<string> {
  // Handle color variants specifically
  const colorMap: Record<string, string> = {
    'black': 'Schwarz',
    'white': 'Weiß',
    'red': 'Rot',
    'blue': 'Blau',
    'green': 'Grün',
    'yellow': 'Gelb',
    'orange': 'Orange',
    'purple': 'Lila',
    'pink': 'Rosa',
    'gray': 'Grau',
    'grey': 'Grau',
    'brown': 'Braun',
    'navy': 'Marineblau',
    'gold': 'Gold',
    'silver': 'Silber',
    'beige': 'Beige',
    'cream': 'Creme',
    'small': 'Klein',
    'medium': 'Mittel',
    'large': 'Groß',
    'xl': 'XL',
    'xxl': 'XXL',
    's': 'S',
    'm': 'M',
    'l': 'L',
  };

  const lowerTitle = variantTitle.toLowerCase();
  
  // Check if it's a known color/size
  for (const [english, german] of Object.entries(colorMap)) {
    if (lowerTitle === english) {
      return german;
    }
  }

  // If not a known color/size, translate normally
  return translateText(variantTitle);
}

export async function translateCollectionTitle(title: string): Promise<string> {
  return translateText(title);
}