/**
 * Traffic-optimierte Keywords für AlltagsGold
 * Basiert auf SEO-Analyse und Schweizer Suchverhalten
 */

export const TRAFFIC_KEYWORDS = {
  // Hochvolumen Keywords für Schweiz (Deutsch)
  primary: [
    "küchenzubehör schweiz",
    "haushaltsgeräte online kaufen",
    "wohnaccessoires schweiz", 
    "praktische küchenhelfer",
    "reinigungsprodukte haushalt",
    "beleuchtung wohnzimmer",
    "hautpflege produkte schweiz",
    "lifestyle produkte online"
  ],

  // Long-Tail Keywords (hohe Conversion-Rate)
  longTail: [
    "mini eierkocher elektrisch schweiz",
    "abflussreiniger küche spiral",
    "led lichterkette halloween outdoor",
    "praktische haushaltsgadgets 2024",
    "schweizer online shop haushaltsware",
    "premium küchenhelfer switzerland",
    "hautpflege routine produkte",
    "wohnaccessoires modern schweiz"
  ],

  // Lokale Swiss SEO Keywords
  swiss: [
    "AlltagsGold schweiz",
    "haushaltsware online shop switzerland", 
    "küchenzubehör ch",
    "lifestyle produkte schweiz",
    "wohnaccessoires swiss made",
    "haushaltsgeräte schweizer qualität",
    "online shopping schweiz haushalt",
    "premium alltagsprodukte ch"
  ],

  // Saison-Keywords (Traffic-Booster)
  seasonal: {
    winter: ["weihnachtsbeleuchtung", "winterpflege haut", "gemütliche wohnaccessoires"],
    spring: ["frühjahrsputz produkte", "garten beleuchtung", "allergie luftreiniger"],
    summer: ["grillzubehör küche", "insektenschutz", "outdoor beleuchtung"],
    autumn: ["halloween dekoration", "herbstpflege haut", "gemütliche beleuchtung"]
  }
};

/**
 * Generiert SEO-optimierte Keywords für Produktkategorien
 */
export function generateCategoryKeywords(categoryName: string): string[] {
  const baseKeywords = [
    `${categoryName} schweiz`,
    `${categoryName} online kaufen`,
    `${categoryName} AlltagsGold`,
    `premium ${categoryName}`,
    `${categoryName} swiss quality`
  ];

  // Kategorie-spezifische Keywords
  const categorySpecific: Record<string, string[]> = {
    "Küchenhelfer": [
      "praktische küchenhelfer",
      "innovative küchengadgets",
      "zeitsparende küchentools",
      "küchenhelfer test schweiz"
    ],
    "Beleuchtung": [
      "led beleuchtung wohnzimmer", 
      "moderne lampen schweiz",
      "energiesparende beleuchtung",
      "stimmungsvolle beleuchtung"
    ],
    "Hautpflege": [
      "hautpflege routine schweiz",
      "premium hautpflege produkte", 
      "anti aging hautpflege",
      "natürliche hautpflege"
    ],
    "Haushalt": [
      "praktische haushaltshelfer",
      "moderne haushaltsgeräte",
      "haushalt organisieren tipps",
      "haushaltsware schweiz"
    ],
    "Reinigung": [
      "effektive reinigungsprodukte",
      "umweltfreundliche reiniger",
      "professionelle reinigung zuhause",
      "reinigungstools haushalt"
    ]
  };

  return [...baseKeywords, ...(categorySpecific[categoryName] || [])];
}

/**
 * Traffic-Score basierend auf Keyword-Performance
 */
export function calculateTrafficScore(keywords: string[]): number {
  const highVolumeKeywords = TRAFFIC_KEYWORDS.primary;
  const score = keywords.reduce((acc, keyword) => {
    if (highVolumeKeywords.some(hvk => keyword.includes(hvk))) {
      return acc + 10; // Hochvolumen Keywords
    }
    if (keyword.includes("schweiz") || keyword.includes("swiss")) {
      return acc + 8; // Lokale Keywords
    }
    if (keyword.length > 25) {
      return acc + 6; // Long-tail Keywords
    }
    return acc + 3; // Standard Keywords
  }, 0);

  return Math.min(score, 100); // Max 100 Punkte
}
