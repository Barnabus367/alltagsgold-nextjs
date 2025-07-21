/**
 * SOFORT-TRAFFIC STRATEGIE FÜR ALLTAGSGOLD
 * Nach 2 Wochen ohne Traffic - Aggressive Maßnahmen
 */

export const IMMEDIATE_TRAFFIC_STRATEGY = {
  
  // 🚨 CRITICAL: Google My Business & Local SEO (Sofort-Traffic)
  localSEO: {
    googleMyBusiness: {
      name: "AlltagsGold - Haushaltsware Schweiz",
      description: "Premium Haushaltsware & Küchenhelfer ✓ Gratis Versand ✓ Top Bewertungen ✓ Schweizer Online Shop",
      categories: ["Haushaltswarengeschäft", "Online-Shop", "Küchengeschäft"],
      keywords: ["haushaltsware schweiz", "küchenhelfer online", "haushaltsgeräte günstig"]
    },
    localKeywords: [
      "haushaltsware zürich", "küchenhelfer basel", "haushaltsgeräte bern",
      "haushaltsware geneva", "küchenhelfer lausanne", "haushaltsgeräte luzern"
    ]
  },

  // 🎯 LONG-TAIL KEYWORDS (Schnelles Ranking möglich)
  quickWinKeywords: [
    "mini eierkocher elektrisch schweiz kaufen",
    "abflussreiniger spirale küche günstig",
    "haushaltshelfer set günstig schweiz",
    "küchenhelfer praktisch online bestellen",
    "haushaltsware gratis versand schweiz",
    "led lichterkette halloween outdoor schweiz",
    "hautpflege produkte schweiz online shop",
    "reinigungsprodukte haushalt umweltfreundlich"
  ],

  // 📱 SOCIAL MEDIA TRAFFIC (Sofort-Maßnahmen)
  socialMediaBoost: {
    instagram: {
      hashtags: ["#haushaltswarescheiz", "#küchenhelfercH", "#alltagsgold", "#haushaltshacks"],
      content: "Produktvorstellungen, Küchentipps, Haushaltshacks, Vorher-Nachher"
    },
    facebook: {
      groups: ["Haushalt Schweiz", "Küchentipps CH", "Haushaltshelfer Forum"],
      ads: "Lookalike Audiences: Haushaltsware-Käufer 25-55 Jahre"
    },
    tiktok: {
      trends: ["#haushaltshack", "#küchentipp", "#organisieren", "#putzhack"],
      content: "15-60s Videos: Produktdemos, Life Hacks, Küchentricks"
    }
  },

  // 💰 PAID TRAFFIC (ROI-optimiert)
  paidTrafficChannels: {
    googleAds: {
      budget: "CHF 20-50/Tag",
      campaigns: [
        {
          name: "Haushaltsware Schweiz",
          keywords: ["haushaltsware schweiz", "küchenhelfer online", "haushaltsgeräte günstig"],
          landingPage: "/collections"
        },
        {
          name: "Spezifische Produkte", 
          keywords: ["mini eierkocher", "abflussreiniger", "led lichterkette"],
          landingPage: "/products/[specific-product]"
        }
      ]
    },
    facebookAds: {
      budget: "CHF 15-30/Tag",
      audiences: ["Haushaltsführung", "Küchenliebhaber", "Organisation & Ordnung"],
      formats: ["Carousel Ads", "Video Ads", "Collection Ads"]
    }
  },

  // 📧 EMAIL MARKETING (Traffic-Retention)
  emailStrategy: {
    welcomeSeries: [
      "Willkommen bei AlltagsGold - 10% Rabatt für Neukunden",
      "Die 5 besten Küchenhelfer für jeden Haushalt",
      "Haushaltstipps von Schweizer Experten"
    ],
    weeklyNewsletters: [
      "Produkt der Woche", 
      "Haushaltshacks & Tipps",
      "Kundenbewertungen & Erfolgsgeschichten"
    ]
  },

  // 🤝 INFLUENCER & PARTNERSHIPS (Authentischer Traffic)
  partnerships: {
    microInfluencers: {
      niches: ["Haushalt", "Küche", "Organisation", "Familie"],
      followers: "1K-50K (höhere Engagement-Rate)",
      compensation: "Produkte + kleine Geldbeträge"
    },
    collaborations: [
      "Schweizer Lifestyle Blogs",
      "YouTube Kanäle: Haushalt & Küche", 
      "Instagram Accounts: #swisshome",
      "TikTok Creators: Life Hacks"
    ]
  },

  // 📊 CONTENT MARKETING (Authority Building)
  contentCalendar: {
    week1: {
      blog: "10 Küchenhelfer die jeder Schweizer Haushalt braucht",
      social: "Mini Eierkocher Test - 7 Eier in 10 Minuten",
      video: "Küche organisieren mit AlltagsGold Produkten"
    },
    week2: {
      blog: "Haushaltsbudget sparen - Günstige Haushaltsware Schweiz",
      social: "Abflussreiniger Hack - Verstopfung in 30 Sekunden lösen", 
      video: "5 Haushaltstricks die Zeit sparen"
    },
    week3: {
      blog: "Nachhaltiger Haushalt - Umweltfreundliche Haushaltshelfer",
      social: "LED Beleuchtung Tipps für gemütliches Zuhause",
      video: "Hautpflege Routine mit Schweizer Produkten"
    },
    week4: {
      blog: "Schweizer Haushaltsware vs. Import - Qualitätsvergleich",
      social: "Reinigungshacks für jeden Raum",
      video: "AlltagsGold Kundenreaktionen & Reviews"
    }
  }
};

/**
 * SOFORT-UMSETZBARE MASSNAHMEN (Diese Woche)
 */
export const IMMEDIATE_ACTIONS = {
  today: [
    "Google My Business Profil erstellen und optimieren",
    "Facebook Business Seite mit Produktkatalog einrichten", 
    "Instagram Business Account mit allen Produkten",
    "Google Ads Kampagne 'Haushaltsware Schweiz' starten (CHF 20/Tag)"
  ],
  
  thisWeek: [
    "10 Produktbewertungen von Freunden/Familie sammeln",
    "Erste TikTok Videos erstellen (3-5 Haushaltshacks)",
    "Email Newsletter Setup mit Willkommens-Serie",
    "Erste Micro-Influencer kontaktieren (5-10 Profile)"
  ],
  
  nextWeek: [
    "Blog-Artikel 'Küchenhelfer Schweiz Guide' veröffentlichen",
    "YouTube Kanal starten mit Produktdemos",
    "Facebook Ads für Lookalike Audiences",
    "Schweizer Lifestyle Blogs für Gastbeiträge kontaktieren"
  ]
};

/**
 * TRAFFIC-TRACKING & KPIs
 */
export const TRAFFIC_GOALS = {
  month1: {
    organic: "50-100 Besucher/Monat",
    paid: "200-500 Besucher/Monat", 
    social: "100-300 Besucher/Monat",
    direct: "50-100 Besucher/Monat"
  },
  
  month2: {
    organic: "150-300 Besucher/Monat",
    paid: "500-1000 Besucher/Monat",
    social: "300-600 Besucher/Monat", 
    direct: "100-200 Besucher/Monat"
  },
  
  month3: {
    organic: "400-800 Besucher/Monat",
    paid: "800-1500 Besucher/Monat",
    social: "500-1000 Besucher/Monat",
    direct: "200-400 Besucher/Monat"
  }
};
