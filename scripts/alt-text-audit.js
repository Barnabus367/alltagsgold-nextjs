#!/usr/bin/env node

/**
 * Alt-Text Audit und Verbesserungsscript für AlltagsGold
 * Findet fehlende Alt-Texte und schlägt Verbesserungen vor
 */

const fs = require('fs');
const path = require('path');

// Verzeichnisse zum Scannen
const SCAN_DIRECTORIES = [
  'components',
  'pages', 
  'lib'
];

// Patterns für Image-Komponenten
const IMAGE_PATTERNS = [
  /<img\s+[^>]*>/gi,
  /<Image\s+[^>]*>/gi,
  /getCloudinaryUrl\(/gi,
  /OptimizedImage/gi,
  /PremiumImage/gi
];

// Alt-Text Regeln
const ALT_TEXT_RULES = {
  products: (productTitle) => `${productTitle} - Hochwertiges Produkt von AlltagsGold`,
  categories: (categoryName) => `${categoryName} Kategorie - Entdecken Sie unsere Auswahl`,
  logos: () => 'AlltagsGold - Premium Lifestyle Produkte',
  placeholders: () => 'Produktbild wird geladen',
  thumbnails: (title, index) => `${title} - Vorschaubild ${index + 1}`
};

class AltTextAuditor {
  constructor() {
    this.issues = [];
    this.suggestions = [];
    this.stats = {
      filesScanned: 0,
      imagesFound: 0,
      missingAltText: 0,
      improvedAltText: 0
    };
  }

  scanDirectory(dir) {
    const fullPath = path.join(process.cwd(), dir);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  Verzeichnis nicht gefunden: ${dir}`);
      return;
    }

    const files = this.getReactFiles(fullPath);
    
    files.forEach(file => {
      this.scanFile(file);
    });
  }

  getReactFiles(dir) {
    const files = [];
    
    const scan = (currentDir) => {
      const items = fs.readdirSync(currentDir);
      
      items.forEach(item => {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.')) {
          scan(fullPath);
        } else if (stat.isFile() && /\.(tsx?|jsx?)$/.test(item)) {
          files.push(fullPath);
        }
      });
    };
    
    scan(dir);
    return files;
  }

  scanFile(filePath) {
    this.stats.filesScanned++;
    
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);
    
    // Finde Image-Tags
    const imageMatches = this.findImageTags(content);
    
    imageMatches.forEach((match, index) => {
      this.stats.imagesFound++;
      this.analyzeImageTag(match, relativePath, index);
    });
  }

  findImageTags(content) {
    const matches = [];
    
    IMAGE_PATTERNS.forEach(pattern => {
      const found = content.match(pattern);
      if (found) {
        matches.push(...found);
      }
    });
    
    return matches;
  }

  analyzeImageTag(imageTag, filePath, index) {
    const issues = [];
    
    // Check für Alt-Text
    if (!this.hasAltText(imageTag)) {
      issues.push('Fehlender Alt-Text');
      this.stats.missingAltText++;
    }
    
    // Check für schlechte Alt-Texte
    const altText = this.extractAltText(imageTag);
    if (altText && this.isBadAltText(altText)) {
      issues.push(`Schlechter Alt-Text: "${altText}"`);
    }
    
    if (issues.length > 0) {
      this.issues.push({
        file: filePath,
        line: index + 1,
        tag: imageTag.substring(0, 100) + '...',
        issues: issues,
        suggestion: this.generateAltTextSuggestion(imageTag, filePath)
      });
    }
  }

  hasAltText(imageTag) {
    return /alt\s*=\s*["'][^"']*["']/.test(imageTag);
  }

  extractAltText(imageTag) {
    const match = imageTag.match(/alt\s*=\s*["']([^"']*)["']/);
    return match ? match[1] : null;
  }

  isBadAltText(altText) {
    const badPatterns = [
      /^(image|img|picture|photo)$/i,
      /^(bild|foto)$/i,
      /^[0-9]+$/,
      /^(undefined|null|)$/,
      /^.{1,2}$/,  // Zu kurz
      /lorem ipsum/i
    ];
    
    return badPatterns.some(pattern => pattern.test(altText));
  }

  generateAltTextSuggestion(imageTag, filePath) {
    // Kontext-basierte Vorschläge
    if (filePath.includes('product')) {
      return ALT_TEXT_RULES.products('Produktname hier');
    } else if (filePath.includes('category') || filePath.includes('collection')) {
      return ALT_TEXT_RULES.categories('Kategoriename hier');
    } else if (filePath.includes('header') || filePath.includes('logo')) {
      return ALT_TEXT_RULES.logos();
    } else {
      return 'Beschreibender Alt-Text basierend auf Bildinhalt';
    }
  }

  generateReport() {
    console.log('\n📊 ALT-TEXT AUDIT REPORT');
    console.log('=' * 50);
    
    // Statistiken
    console.log('\n📈 Statistiken:');
    console.log(`   Dateien gescannt: ${this.stats.filesScanned}`);
    console.log(`   Bilder gefunden: ${this.stats.imagesFound}`);
    console.log(`   Fehlende Alt-Texte: ${this.stats.missingAltText}`);
    console.log(`   Erfolgsrate: ${this.getSuccessRate()}%`);
    
    // Top Issues
    if (this.issues.length > 0) {
      console.log('\n🔍 Gefundene Probleme:');
      
      this.issues.slice(0, 10).forEach((issue, index) => {
        console.log(`\n${index + 1}. ${issue.file}:`);
        console.log(`   Tag: ${issue.tag}`);
        console.log(`   Probleme: ${issue.issues.join(', ')}`);
        console.log(`   Vorschlag: "${issue.suggestion}"`);
      });
      
      if (this.issues.length > 10) {
        console.log(`\n... und ${this.issues.length - 10} weitere Probleme`);
      }
    }
    
    // Empfehlungen
    console.log('\n💡 Empfehlungen:');
    console.log('   1. Alle Bilder sollten beschreibende Alt-Texte haben');
    console.log('   2. Alt-Texte sollten den Bildinhalt und Kontext beschreiben');
    console.log('   3. Für Produktbilder: Produktname + "AlltagsGold" verwenden');
    console.log('   4. Für dekorative Bilder: alt="" verwenden');
    
    // Nächste Schritte
    console.log('\n🚀 Nächste Schritte:');
    console.log('   1. Fixe die kritischsten 10 fehlenden Alt-Texte');
    console.log('   2. Implementiere generateImageAlt() Helper konsequent');
    console.log('   3. Erstelle Alt-Text Guidelines für das Team');
    console.log('   4. Automatisiere Alt-Text Generation für neue Bilder');
  }

  getSuccessRate() {
    if (this.stats.imagesFound === 0) return 100;
    
    const goodImages = this.stats.imagesFound - this.stats.missingAltText;
    return Math.round((goodImages / this.stats.imagesFound) * 100);
  }

  // Fix-Vorschläge generieren
  generateFixSuggestions() {
    const fixes = {
      quickFixes: [],
      improvements: [],
      automation: []
    };

    // Quick Fixes (sofort umsetzbar)
    fixes.quickFixes = [
      {
        file: 'components/common/OptimizedImage.tsx',
        change: 'generateImageAlt() Helper konsequent verwenden',
        impact: 'Hoch',
        effort: 'Niedrig'
      },
      {
        file: 'components/product/ProductCard.tsx',
        change: 'Alt-Text für Produktbilder standardisieren',
        impact: 'Hoch',
        effort: 'Niedrig'
      }
    ];

    // Verbesserungen (mittelfristig)
    fixes.improvements = [
      {
        task: 'Alt-Text Guidelines erstellen',
        description: 'Dokumentation für konsistente Alt-Texte',
        effort: 'Mittel'
      },
      {
        task: 'Cloudinary Auto-Alt aktivieren',
        description: 'Automatische Alt-Text Generation via AI',
        effort: 'Mittel'
      }
    ];

    return fixes;
  }

  run() {
    console.log('🔍 Starte Alt-Text Audit...\n');
    
    SCAN_DIRECTORIES.forEach(dir => {
      console.log(`📁 Scanne ${dir}/...`);
      this.scanDirectory(dir);
    });
    
    this.generateReport();
    
    return {
      stats: this.stats,
      issues: this.issues,
      fixes: this.generateFixSuggestions()
    };
  }
}

// Hauptfunktion
if (require.main === module) {
  const auditor = new AltTextAuditor();
  const results = auditor.run();
  
  // Optionally save results to file
  if (process.argv.includes('--save')) {
    fs.writeFileSync(
      'alt-text-audit-results.json', 
      JSON.stringify(results, null, 2)
    );
    console.log('\n💾 Ergebnisse gespeichert in alt-text-audit-results.json');
  }
}

module.exports = AltTextAuditor;
