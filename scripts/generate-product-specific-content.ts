import fs from 'fs';
import path from 'path';

/**
 * Dieses Script zeigt, wie produktspezifische Inhalte MANUELL generiert werden sollten.
 * Es ersetzt NICHT automatisch, sondern gibt Vorschläge für jeden Produkttyp.
 */

interface ProductContentTemplate {
  productType: string;
  keywords: string[];
  contentGuidelines: {
    ourOpinion: string[];
    faqTopics: string[];
    avoidPhrases: string[];
    recommendedPhrases: string[];
  };
}

// Produktkategorien mit spezifischen Content-Richtlinien
const productTemplates: ProductContentTemplate[] = [
  {
    productType: 'Beleuchtung',
    keywords: ['lampe', 'licht', 'led', 'beleuchtung'],
    contentGuidelines: {
      ourOpinion: [
        'Fokus auf Atmosphäre und Stimmung',
        'Energieeffizienz erwähnen',
        'Design und Ästhetik beschreiben',
        'Praktische Anwendungsszenarien'
      ],
      faqTopics: [
        'Helligkeit und Dimmbarkeit',
        'Energieverbrauch',
        'Installation und Montage',
        'Lebensdauer der LEDs',
        'Farbtemperatur'
      ],
      avoidPhrases: [
        'nur in X Farben erhältlich',
        'kostet CHF XX',
        'Akkulaufzeit von X Stunden'
      ],
      recommendedPhrases: [
        'in verschiedenen Ausführungen erhältlich',
        'energieeffiziente LED-Technologie',
        'lange Lebensdauer',
        'stimmungsvolle Beleuchtung'
      ]
    }
  },
  {
    productType: 'Tierbedarf',
    keywords: ['hund', 'katze', 'tier', 'haustier', 'pflege'],
    contentGuidelines: {
      ourOpinion: [
        'Tierkomfort betonen',
        'Sicherheitsaspekte hervorheben',
        'Pflegeleichtigkeit erwähnen',
        'Verträglichkeit für verschiedene Tiergrößen'
      ],
      faqTopics: [
        'Geeignet für welche Tiere/Rassen',
        'Reinigung und Hygiene',
        'Sicherheit für das Tier',
        'Haltbarkeit bei regelmässiger Nutzung',
        'Gewöhnung des Tieres'
      ],
      avoidPhrases: [
        'nur für kleine/grosse Hunde',
        'hält genau X Monate',
        'ab Lager X sofort verfügbar'
      ],
      recommendedPhrases: [
        'für verschiedene Tiergrössen geeignet',
        'tierfreundliches Material',
        'einfache Reinigung',
        'von Tierhaltern getestet'
      ]
    }
  },
  {
    productType: 'Haushalt',
    keywords: ['küche', 'reiniger', 'haushalt', 'ordnung', 'aufbewahrung'],
    contentGuidelines: {
      ourOpinion: [
        'Praktischer Nutzen im Alltag',
        'Zeitersparnis betonen',
        'Qualität und Langlebigkeit',
        'Platzsparende Eigenschaften'
      ],
      faqTopics: [
        'Material und Verarbeitung',
        'Reinigung und Pflege',
        'Grösse und Kapazität',
        'Vielseitigkeit der Anwendung',
        'Umweltfreundlichkeit'
      ],
      avoidPhrases: [
        'exakt X cm/ml/kg',
        'für CHF XX erhältlich',
        'Ersatzteile nicht verfügbar'
      ],
      recommendedPhrases: [
        'praktische Grösse',
        'vielseitig einsetzbar',
        'hochwertige Verarbeitung',
        'platzsparend verstaubar'
      ]
    }
  },
  {
    productType: 'Beauty/Kosmetik',
    keywords: ['pflege', 'beauty', 'kosmetik', 'haut', 'gesicht'],
    contentGuidelines: {
      ourOpinion: [
        'Hautverträglichkeit',
        'Anwendungserfahrung',
        'Textur und Duft',
        'Sichtbare Resultate'
      ],
      faqTopics: [
        'Für welche Hauttypen geeignet',
        'Anwendungshäufigkeit',
        'Inhaltsstoffe',
        'Haltbarkeit nach Öffnung',
        'Kombinierbar mit anderen Produkten'
      ],
      avoidPhrases: [
        'hält X Monate',
        '30ml/50ml/100ml Inhalt',
        'zum Preis von CHF XX'
      ],
      recommendedPhrases: [
        'für verschiedene Hauttypen',
        'dermatologisch getestet',
        'angenehme Textur',
        'ergiebig in der Anwendung'
      ]
    }
  }
];

class ProductContentGenerator {
  
  /**
   * Generiert Vorschläge für produktspezifischen Content
   */
  generateContentSuggestions(productId: string, productName: string): void {
    console.log(`\n📝 Content-Vorschläge für: ${productName} (${productId})\n`);
    
    // Finde passende Vorlage basierend auf Keywords
    const template = this.findMatchingTemplate(productId, productName);
    
    if (!template) {
      console.log('⚠️  Keine spezifische Vorlage gefunden. Verwende allgemeine Richtlinien.\n');
      this.printGeneralGuidelines();
      return;
    }
    
    console.log(`✅ Kategorie erkannt: ${template.productType}\n`);
    this.printSpecificGuidelines(template);
  }
  
  /**
   * Findet die passende Content-Vorlage für ein Produkt
   */
  private findMatchingTemplate(productId: string, productName: string): ProductContentTemplate | null {
    const searchText = `${productId} ${productName}`.toLowerCase();
    
    for (const template of productTemplates) {
      const hasKeyword = template.keywords.some(keyword => 
        searchText.includes(keyword)
      );
      if (hasKeyword) {
        return template;
      }
    }
    
    return null;
  }
  
  /**
   * Gibt spezifische Richtlinien für eine Produktkategorie aus
   */
  private printSpecificGuidelines(template: ProductContentTemplate): void {
    console.log('📌 RICHTLINIEN FÜR "UNSERE MEINUNG":');
    template.contentGuidelines.ourOpinion.forEach(guideline => {
      console.log(`  ✓ ${guideline}`);
    });
    
    console.log('\n📌 EMPFOHLENE FAQ-THEMEN:');
    template.contentGuidelines.faqTopics.forEach(topic => {
      console.log(`  ✓ ${topic}`);
    });
    
    console.log('\n❌ ZU VERMEIDENDE FORMULIERUNGEN:');
    template.contentGuidelines.avoidPhrases.forEach(phrase => {
      console.log(`  ✗ "${phrase}"`);
    });
    
    console.log('\n✅ EMPFOHLENE FORMULIERUNGEN:');
    template.contentGuidelines.recommendedPhrases.forEach(phrase => {
      console.log(`  ✓ "${phrase}"`);
    });
    
    this.printExampleContent(template);
  }
  
  /**
   * Gibt Beispiel-Content für die Kategorie aus
   */
  private printExampleContent(template: ProductContentTemplate): void {
    console.log('\n📝 BEISPIEL-CONTENT:\n');
    
    if (template.productType === 'Beleuchtung') {
      console.log('UNSERE MEINUNG:');
      console.log('"Diese stilvolle Lampe schafft eine gemütliche Atmosphäre in jedem Raum. ');
      console.log('Die energieeffiziente LED-Technologie sorgt für langanhaltende Freude, ');
      console.log('während das moderne Design perfekt in zeitgemässe Einrichtungen passt. ');
      console.log('Besonders praktisch: Die verschiedenen Helligkeitsstufen lassen sich ');
      console.log('intuitiv an jede Stimmung anpassen. Die hochwertige Verarbeitung ');
      console.log('rechtfertigt die Investition. Schnelle Lieferung aus der Schweiz garantiert."\n');
      
      console.log('FAQ-BEISPIEL:');
      console.log('F: "Welche Farbtemperaturen sind verfügbar?"');
      console.log('A: "Die Lampe bietet verschiedene Farbtemperaturen von warmweiss bis tageslichtweiss, ');
      console.log('   perfekt anpassbar an deine Bedürfnisse."');
    }
    
    if (template.productType === 'Tierbedarf') {
      console.log('UNSERE MEINUNG:');
      console.log('"Dieses durchdachte Produkt erleichtert den Alltag mit deinem Vierbeiner spürbar. ');
      console.log('Die tierfreundlichen Materialien und die sichere Verarbeitung geben ein gutes Gefühl. ');
      console.log('Nach einer kurzen Gewöhnungsphase akzeptieren die meisten Tiere das Produkt gut. ');
      console.log('Die einfache Reinigung spart Zeit und die robuste Konstruktion verspricht ');
      console.log('lange Haltbarkeit. Ideal für Tierhalter, die Wert auf Qualität legen. ');
      console.log('Versand erfolgt zügig aus unserem Schweizer Lager."\n');
      
      console.log('FAQ-BEISPIEL:');
      console.log('F: "Ist das Produkt für alle Tiergrössen geeignet?"');
      console.log('A: "Das Produkt eignet sich für verschiedene Tiergrössen. Bei sehr kleinen oder ');
      console.log('   sehr grossen Tieren empfehlen wir, die Produktdetails zu prüfen."');
    }
  }
  
  /**
   * Gibt allgemeine Richtlinien aus
   */
  private printGeneralGuidelines(): void {
    console.log('📌 ALLGEMEINE CONTENT-RICHTLINIEN:\n');
    
    console.log('UNSERE MEINUNG sollte enthalten:');
    console.log('  ✓ Persönliche, aber professionelle Einschätzung');
    console.log('  ✓ Praktische Vorteile für Schweizer Kunden');
    console.log('  ✓ Ehrliche Erwähnung von Limitierungen');
    console.log('  ✓ Bezug zur Qualität und Verarbeitung');
    console.log('  ✓ Hinweis auf schnellen Versand aus der Schweiz\n');
    
    console.log('FAQs sollten behandeln:');
    console.log('  ✓ Praktische Anwendungsfragen');
    console.log('  ✓ Material und Qualität');
    console.log('  ✓ Pflege und Wartung');
    console.log('  ✓ Kompatibilität und Eignung');
    console.log('  ✓ Besondere Features\n');
    
    console.log('❌ IMMER VERMEIDEN:');
    console.log('  ✗ Konkrete Preise (CHF XX)');
    console.log('  ✗ "Nur" bei Varianten');
    console.log('  ✗ Absolute Verfügbarkeitsaussagen');
    console.log('  ✗ Spezifische Lagerorte');
    console.log('  ✗ Exakte technische Masse (wenn nicht essentiell)\n');
    
    console.log('✅ STATTDESSEN VERWENDEN:');
    console.log('  ✓ "zu attraktiven Preisen"');
    console.log('  ✓ "in verschiedenen Varianten erhältlich"');
    console.log('  ✓ "schnell lieferbar"');
    console.log('  ✓ "aus unserem Schweizer Lager"');
    console.log('  ✓ "optimal dimensioniert"');
  }
  
  /**
   * Analysiert bestehenden Content und gibt Verbesserungsvorschläge
   */
  analyzeExistingContent(productId: string, content: any): void {
    console.log(`\n🔍 Analyse des bestehenden Contents für: ${productId}\n`);
    
    const issues: string[] = [];
    
    // Prüfe "Unsere Meinung"
    if (content.ourOpinion) {
      if (content.ourOpinion.match(/CHF\s*\d+/)) {
        issues.push('Enthält konkrete Preisangaben');
      }
      if (content.ourOpinion.match(/\b(nur|Nur)\b.*verfügbar/)) {
        issues.push('Enthält einschränkende Verfügbarkeitsaussagen');
      }
      if (content.ourOpinion.length < 200) {
        issues.push('Text könnte ausführlicher sein (< 200 Zeichen)');
      }
      if (!content.ourOpinion.includes('Schweiz')) {
        issues.push('Kein Bezug zur Schweiz/lokalem Versand');
      }
    }
    
    // Prüfe FAQs
    if (content.faqs) {
      content.faqs.forEach((faq: any, index: number) => {
        if (faq.answer.length < 50) {
          issues.push(`FAQ ${index + 1}: Antwort zu kurz (< 50 Zeichen)`);
        }
        if (faq.answer.match(/^(Ja|Nein)\.?$/)) {
          issues.push(`FAQ ${index + 1}: Einwort-Antwort ohne Erklärung`);
        }
      });
      
      if (content.faqs.length < 3) {
        issues.push('Weniger als 3 FAQs vorhanden');
      }
    }
    
    if (issues.length > 0) {
      console.log('⚠️  Gefundene Verbesserungspotenziale:');
      issues.forEach(issue => console.log(`  • ${issue}`));
    } else {
      console.log('✅ Content entspricht den Richtlinien!');
    }
  }
}

// Beispiel-Verwendung
const generator = new ProductContentGenerator();

// Beispiel 1: Content-Vorschläge für Mini-LED-Tischlampe
console.log('═'.repeat(60));
console.log('BEISPIEL 1: MINI-LED-TISCHLAMPE');
console.log('═'.repeat(60));
generator.generateContentSuggestions('mini-led-tischlampe', 'Mini LED-Tischlampe');

// Beispiel 2: Content-Vorschläge für Tierpflegeprodukt
console.log('\n' + '═'.repeat(60));
console.log('BEISPIEL 2: DAMPFBÜRSTE FÜR HAUSTIERE');
console.log('═'.repeat(60));
generator.generateContentSuggestions('dampfbuerste-haustiere', 'Dampfbürste für Haustiere');

// Beispiel 3: Analyse bestehender Content
console.log('\n' + '═'.repeat(60));
console.log('BEISPIEL 3: ANALYSE BESTEHENDER CONTENT');
console.log('═'.repeat(60));

const existingContent = {
  ourOpinion: "Für CHF 59.90 bekommst du hier eine Premium-Tischlampe. Nur in Schwarz und Weiss verfügbar.",
  faqs: [
    { question: "Wie lange hält der Akku?", answer: "8 Stunden." },
    { question: "Ist sie wasserdicht?", answer: "Nein." }
  ]
};

generator.analyzeExistingContent('mini-led-tischlampe', existingContent);

console.log('\n' + '═'.repeat(60));
console.log('💡 WICHTIGER HINWEIS:');
console.log('═'.repeat(60));
console.log('\nDieses Script gibt nur VORSCHLÄGE. Die tatsächlichen Inhalte müssen');
console.log('MANUELL und PRODUKTSPEZIFISCH erstellt werden, um authentisch und');
console.log('hilfreich für die Kunden zu sein. Verwende die Richtlinien als');
console.log('Orientierung, aber schreibe individuelle Texte für jedes Produkt!\n');