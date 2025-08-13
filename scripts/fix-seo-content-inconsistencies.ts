import fs from 'fs';
import path from 'path';

interface SEOContent {
  ourOpinion: string;
  useCases: Array<{
    title: string;
    description: string;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

interface ContentIssue {
  productId: string;
  field: 'ourOpinion' | 'faq';
  faqIndex?: number;
  original: string;
  suggestion: string;
  issueType: string;
}

class SEOContentFixer {
  private content: Record<string, SEOContent>;
  private issues: ContentIssue[] = [];
  
  constructor() {
    const filePath = path.join(process.cwd(), 'data', 'product-seo-content.json');
    this.content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }

  // Hauptmethode zur Analyse und Korrektur
  analyzeAndFix() {
    console.log('🔍 Analysiere SEO-Inhalte auf Inkonsistenzen...\n');
    
    Object.entries(this.content).forEach(([productId, data]) => {
      this.checkOpinion(productId, data.ourOpinion);
      data.faqs.forEach((faq, index) => {
        this.checkFAQ(productId, faq, index);
      });
    });

    this.generateReport();
    this.applyFixes();
  }

  // Prüft "Unsere Meinung" auf problematische Inhalte
  private checkOpinion(productId: string, opinion: string) {
    // Preisangaben
    const priceMatch = opinion.match(/CHF\s*\d+(\.\d{2})?|für\s+(unter\s+)?\d+\s*Franken|knapp\s+\d+\s*Franken/gi);
    if (priceMatch) {
      this.issues.push({
        productId,
        field: 'ourOpinion',
        original: opinion,
        suggestion: this.removeSpecificPrices(opinion),
        issueType: 'Konkrete Preisangabe'
      });
    }

    // Spezifische Masse
    const measureMatch = opinion.match(/\d+\s*(cm|mm|ml|kg|g)\b/gi);
    if (measureMatch && !this.isEssentialMeasurement(productId, opinion)) {
      this.issues.push({
        productId,
        field: 'ourOpinion',
        original: opinion,
        suggestion: this.generalizeaMeasurements(opinion),
        issueType: 'Spezifische Masse'
      });
    }

    // Lagerort-Angaben
    const locationMatch = opinion.match(/ab\s+(Lager\s+)?(Wil|Basel|Zürich|Neuenburg|Yverdon|Lugano|Bern)/gi);
    if (locationMatch) {
      this.issues.push({
        productId,
        field: 'ourOpinion',
        original: opinion,
        suggestion: opinion.replace(/ab\s+(Lager\s+)?(Wil|Basel|Zürich|Neuenburg|Yverdon|Lugano|Bern)/gi, 'aus unserem Schweizer Lager'),
        issueType: 'Spezifischer Lagerort'
      });
    }
  }

  // Prüft FAQs auf problematische Inhalte
  private checkFAQ(productId: string, faq: { question: string; answer: string }, index: number) {
    const answer = faq.answer;
    
    // "Nur" Aussagen bei Farben/Varianten
    if (faq.question.toLowerCase().includes('farbe') || faq.question.toLowerCase().includes('variante')) {
      if (answer.match(/\b(nur|Nur|aktuell nur|Aktuell nur)\b/)) {
        this.issues.push({
          productId,
          field: 'faq',
          faqIndex: index,
          original: answer,
          suggestion: this.makeColorStatementFlexible(answer),
          issueType: 'Einschränkende Farbaussage'
        });
      }
    }

    // Konkrete Verfügbarkeitsaussagen
    if (answer.match(/sofort\s+(verfügbar|lieferbar|ab\s+Lager)/i)) {
      this.issues.push({
        productId,
        field: 'faq',
        faqIndex: index,
        original: answer,
        suggestion: answer.replace(/sofort\s+(verfügbar|lieferbar|ab\s+Lager)/gi, 'schnell lieferbar'),
        issueType: 'Absolute Verfügbarkeitsaussage'
      });
    }

    // Ersatzteil-Verfügbarkeit
    if (faq.question.toLowerCase().includes('ersatz')) {
      if (answer.match(/nicht\s+verfügbar|leider\s+nicht/i)) {
        this.issues.push({
          productId,
          field: 'faq',
          faqIndex: index,
          original: answer,
          suggestion: this.softeneNoAvailability(answer),
          issueType: 'Absolute Nicht-Verfügbarkeit'
        });
      }
    }

    // Technische Spezifikationen in Antworten
    const techSpecMatch = answer.match(/\d+\s*(Stunden|Minuten|Tage|Wochen|Monate)/gi);
    if (techSpecMatch && !this.isEssentialSpec(productId, answer)) {
      this.issues.push({
        productId,
        field: 'faq',
        faqIndex: index,
        original: answer,
        suggestion: this.generalizeDuration(answer),
        issueType: 'Spezifische Zeitangabe'
      });
    }
  }

  // Hilfsmethoden für intelligente Ersetzungen
  private removeSpecificPrices(text: string): string {
    return text
      .replace(/für\s+CHF\s*\d+(\.\d{2})?/gi, 'zu einem attraktiven Preis')
      .replace(/CHF\s*\d+(\.\d{2})?/gi, 'zum fairen Preis')
      .replace(/für\s+(unter\s+)?\d+\s*Franken/gi, 'zu einem günstigen Preis')
      .replace(/knapp\s+\d+\s*Franken/gi, 'zu einem erschwinglichen Preis');
  }

  private generalizeaMeasurements(text: string): string {
    // Behalte wichtige Produktmasse (z.B. bei "60cm Reiniger" ist die Länge wichtig)
    return text
      .replace(/Mit\s+\d+cm\s+Durchmesser/gi, 'Mit grosszügigem Durchmesser')
      .replace(/\d+ml\s+Tank/gi, 'grosser Tank')
      .replace(/etwa\s+\d+g/gi, 'leichtgewichtig')
      .replace(/\d+kg/gi, 'stabiles Gewicht');
  }

  private makeColorStatementFlexible(text: string): string {
    return text
      .replace(/Aktuell nur in Schwarz und Weiss erhältlich/gi, 'In verschiedenen Farben erhältlich - Verfügbarkeit kann variieren')
      .replace(/nur in (\w+) und (\w+)/gi, 'in mehreren Farbvarianten erhältlich')
      .replace(/Nur (\w+), (\w+) und (\w+) verfügbar/gi, 'In verschiedenen Farben erhältlich');
  }

  private softeneNoAvailability(text: string): string {
    return text
      .replace(/Ersatzteile leider nicht verfügbar/gi, 'Informationen zu Ersatzteilen auf Anfrage')
      .replace(/nicht verfügbar/gi, 'Verfügbarkeit auf Anfrage')
      .replace(/Nein, aber bei dem Preis kauft man einfach neu/gi, 'Das Produkt ist als praktische Komplettlösung konzipiert');
  }

  private generalizeDuration(text: string): string {
    return text
      .replace(/\d+-\d+\s+Stunden/gi, 'mehrere Stunden')
      .replace(/etwa\s+\d+\s+Stunden/gi, 'stundenlang')
      .replace(/\d+\s+Wochen/gi, 'wochenlang')
      .replace(/\d+-\d+\s+Monate/gi, 'mehrere Monate');
  }

  // Prüft ob eine Messung essentiell für das Produkt ist
  private isEssentialMeasurement(productId: string, text: string): boolean {
    // Bei manchen Produkten sind Masse Teil des Produktnamens
    const essentialProducts = [
      'flexibler-abfluss-reiniger-60cm', // 60cm ist Teil des Produkts
      'aroma-diffuser-300ml', // 300ml ist Produktbezeichnung
      'anti-aging-gesichtstoner-30ml' // 30ml ist Produktbezeichnung
    ];
    
    return essentialProducts.includes(productId);
  }

  // Prüft ob eine technische Spezifikation essentiell ist
  private isEssentialSpec(productId: string, text: string): boolean {
    // Manche Specs sind wichtig für die Kaufentscheidung
    const essentialSpecs = ['Akkulaufzeit', 'Garantie', 'Ladedauer'];
    return essentialSpecs.some(spec => text.includes(spec));
  }

  // Generiert einen Bericht über gefundene Probleme
  private generateReport() {
    console.log(`📊 Gefundene Probleme: ${this.issues.length}\n`);
    
    const issuesByType = this.issues.reduce((acc, issue) => {
      acc[issue.issueType] = (acc[issue.issueType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('Nach Typ:');
    Object.entries(issuesByType).forEach(([type, count]) => {
      console.log(`  - ${type}: ${count}`);
    });
    
    console.log('\n📝 Beispiele für Korrekturen:\n');
    
    // Zeige 3 Beispiele
    this.issues.slice(0, 3).forEach(issue => {
      console.log(`Produkt: ${issue.productId}`);
      console.log(`Typ: ${issue.issueType}`);
      console.log(`Original: "${issue.original.substring(0, 100)}..."`);
      console.log(`Vorschlag: "${issue.suggestion.substring(0, 100)}..."`);
      console.log('---');
    });
  }

  // Wendet die Korrekturen an und speichert
  private applyFixes() {
    console.log('\n✅ Wende Korrekturen an...\n');
    
    // Erstelle Backup
    const backupPath = path.join(process.cwd(), 'data', `product-seo-content.backup.${Date.now()}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(this.content, null, 2));
    console.log(`📁 Backup erstellt: ${backupPath}`);
    
    // Wende Fixes an
    this.issues.forEach(issue => {
      if (issue.field === 'ourOpinion') {
        this.content[issue.productId].ourOpinion = issue.suggestion;
      } else if (issue.field === 'faq' && issue.faqIndex !== undefined) {
        this.content[issue.productId].faqs[issue.faqIndex].answer = issue.suggestion;
      }
    });
    
    // Speichere korrigierte Version
    const outputPath = path.join(process.cwd(), 'data', 'product-seo-content.json');
    fs.writeFileSync(outputPath, JSON.stringify(this.content, null, 2));
    console.log(`✅ Korrekturen gespeichert: ${outputPath}`);
    
    // Erstelle detailliertes Changelog
    const changelogPath = path.join(process.cwd(), 'data', `seo-fixes-changelog.${Date.now()}.json`);
    fs.writeFileSync(changelogPath, JSON.stringify(this.issues, null, 2));
    console.log(`📋 Changelog erstellt: ${changelogPath}`);
  }
}

// Script ausführen
const fixer = new SEOContentFixer();
fixer.analyzeAndFix();

console.log('\n🎉 Script erfolgreich ausgeführt!');
console.log('⚠️  WICHTIG: Bitte überprüfe die Änderungen manuell, da manche Produktbeschreibungen kontextabhängig sind.');