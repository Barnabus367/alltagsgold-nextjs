const fs = require('fs');

function analyzeDescriptions() {
  console.log('📊 Analysiere Shopify-Produktbeschreibungen...\n');
  
  // Load raw product data
  const rawData = JSON.parse(fs.readFileSync('./data/all-products-raw.json', 'utf8'));
  const products = rawData.products;
  
  const analysis = {
    total: 0,
    empty: [],
    withHtml: [],
    plainText: [],
    withLineBreaks: [],
    withLists: [],
    withHeadings: [],
    withParagraphs: [],
    lengthDistribution: {
      veryShort: [], // < 50 chars
      short: [],     // 50-150 chars  
      medium: [],    // 150-300 chars
      long: [],      // 300-600 chars
      veryLong: []   // > 600 chars
    },
    htmlPatterns: {
      h3: [],
      ul: [],
      li: [],
      p: [],
      br: [],
      strong: [],
      em: []
    },
    samples: {}
  };
  
  products.forEach(product => {
    analysis.total++;
    const desc = product.body_html || '';
    const descLength = desc.length;
    
    // Track empty descriptions
    if (!desc || desc.trim() === '') {
      analysis.empty.push(product.handle);
      return;
    }
    
    // Store samples for first 5 products with descriptions
    if (Object.keys(analysis.samples).length < 5) {
      analysis.samples[product.handle] = {
        title: product.title,
        description: desc.substring(0, 300) + (desc.length > 300 ? '...' : ''),
        fullLength: desc.length
      };
    }
    
    // Length distribution
    if (descLength < 50) {
      analysis.lengthDistribution.veryShort.push(product.handle);
    } else if (descLength < 150) {
      analysis.lengthDistribution.short.push(product.handle);
    } else if (descLength < 300) {
      analysis.lengthDistribution.medium.push(product.handle);
    } else if (descLength < 600) {
      analysis.lengthDistribution.long.push(product.handle);
    } else {
      analysis.lengthDistribution.veryLong.push(product.handle);
    }
    
    // Check for HTML patterns
    if (desc.includes('<h3>')) analysis.htmlPatterns.h3.push(product.handle);
    if (desc.includes('<ul>')) analysis.htmlPatterns.ul.push(product.handle);
    if (desc.includes('<li>')) analysis.htmlPatterns.li.push(product.handle);
    if (desc.includes('<p>')) analysis.htmlPatterns.p.push(product.handle);
    if (desc.includes('<br>') || desc.includes('<br/>') || desc.includes('<br />')) {
      analysis.htmlPatterns.br.push(product.handle);
    }
    if (desc.includes('<strong>')) analysis.htmlPatterns.strong.push(product.handle);
    if (desc.includes('<em>')) analysis.htmlPatterns.em.push(product.handle);
    
    // General categorization
    if (desc.includes('<') && desc.includes('>')) {
      analysis.withHtml.push(product.handle);
    }
    
    if (desc.includes('\n')) {
      analysis.withLineBreaks.push(product.handle);
    }
    
    if (desc.includes('<ul>') || desc.includes('<li>')) {
      analysis.withLists.push(product.handle);
    }
    
    if (desc.includes('<h') || desc.includes('</h')) {
      analysis.withHeadings.push(product.handle);
    }
    
    if (desc.includes('<p>') || desc.includes('</p>')) {
      analysis.withParagraphs.push(product.handle);
    }
    
    // Plain text (no HTML tags at all)
    if (!desc.includes('<') && !desc.includes('>')) {
      analysis.plainText.push(product.handle);
    }
  });
  
  // Print Results
  console.log('📈 ANALYSE-ERGEBNISSE:');
  console.log('====================');
  console.log(`Total Produkte: ${analysis.total}`);
  console.log(`Ohne Beschreibung: ${analysis.empty.length} (${Math.round(analysis.empty.length/analysis.total*100)}%)`);
  console.log(`Mit HTML-Tags: ${analysis.withHtml.length} (${Math.round(analysis.withHtml.length/analysis.total*100)}%)`);
  console.log(`Nur Plain Text: ${analysis.plainText.length} (${Math.round(analysis.plainText.length/analysis.total*100)}%)`);
  
  console.log('\n📏 LÄNGEN-VERTEILUNG:');
  console.log('====================');
  console.log(`Sehr kurz (<50 Zeichen): ${analysis.lengthDistribution.veryShort.length}`);
  console.log(`Kurz (50-150 Zeichen): ${analysis.lengthDistribution.short.length}`);
  console.log(`Mittel (150-300 Zeichen): ${analysis.lengthDistribution.medium.length}`);
  console.log(`Lang (300-600 Zeichen): ${analysis.lengthDistribution.long.length}`);
  console.log(`Sehr lang (>600 Zeichen): ${analysis.lengthDistribution.veryLong.length}`);
  
  console.log('\n🏷️ HTML-MUSTER GEFUNDEN:');
  console.log('=======================');
  console.log(`<h3> Überschriften: ${analysis.htmlPatterns.h3.length} Produkte`);
  console.log(`<ul> Listen: ${analysis.htmlPatterns.ul.length} Produkte`);
  console.log(`<li> Listenpunkte: ${analysis.htmlPatterns.li.length} Produkte`);
  console.log(`<p> Absätze: ${analysis.htmlPatterns.p.length} Produkte`);
  console.log(`<br> Umbrüche: ${analysis.htmlPatterns.br.length} Produkte`);
  console.log(`<strong> Fett: ${analysis.htmlPatterns.strong.length} Produkte`);
  console.log(`<em> Kursiv: ${analysis.htmlPatterns.em.length} Produkte`);
  
  // Save analysis
  fs.writeFileSync('shopify-descriptions-analysis.json', JSON.stringify(analysis, null, 2));
  console.log('\n✅ Detaillierte Analyse in shopify-descriptions-analysis.json gespeichert');
  
  // Show samples
  console.log('\n📝 BEISPIELE DER ERSTEN 5 PRODUKTE:');
  console.log('===================================');
  Object.entries(analysis.samples).forEach(([handle, sample], index) => {
    console.log(`\n${index + 1}. ${sample.title} (${handle})`);
    console.log(`   Länge: ${sample.fullLength} Zeichen`);
    console.log(`   Anfang: ${sample.description.replace(/\n/g, ' ').substring(0, 100)}...`);
  });
  
  // Recommendations
  console.log('\n💡 VEREINHEITLICHUNGS-STRATEGIE:');
  console.log('================================');
  console.log('Basierend auf der Analyse empfehle ich folgendes einheitliches Format:');
  console.log('\n1. STRUKTUR:');
  console.log('   - Kurze Einleitung (1-2 Sätze)');
  console.log('   - Produktvorteile als Bullet-Liste');
  console.log('   - Technische Details als separate Liste');
  console.log('\n2. HTML-FORMAT:');
  console.log('   <p>Einleitungstext...</p>');
  console.log('   <h3>Produktvorteile</h3>');
  console.log('   <ul><li>Vorteil 1</li><li>Vorteil 2</li></ul>');
  console.log('   <h3>Technische Details</h3>');
  console.log('   <ul><li>Detail 1</li><li>Detail 2</li></ul>');
  console.log('\n3. AKTIONEN:');
  console.log(`   - ${analysis.empty.length} Produkte benötigen neue Beschreibungen`);
  console.log(`   - ${analysis.plainText.length} Produkte müssen HTML-formatiert werden`);
  console.log(`   - ${analysis.total - analysis.htmlPatterns.h3.length} Produkte brauchen strukturierte Überschriften`);
  
  return analysis;
}

// Run analysis
analyzeDescriptions();