const fs = require('fs');
const { getAllProducts } = require('../lib/shopify');

async function analyzeDescriptions() {
  console.log('📊 Analysiere Shopify-Produktbeschreibungen...\n');
  
  const products = await getAllProducts();
  const analysis = {
    total: 0,
    empty: [],
    withHtml: [],
    plainText: [],
    withLineBreaks: [],
    withLists: [],
    withBold: [],
    lengthDistribution: {
      veryShort: [], // < 50 chars
      short: [],     // 50-150 chars
      medium: [],    // 150-300 chars
      long: [],      // 300-600 chars
      veryLong: []   // > 600 chars
    },
    samples: {}
  };
  
  products.forEach(product => {
    analysis.total++;
    const desc = product.description || '';
    const descLength = desc.length;
    
    // Track empty descriptions
    if (!desc || desc.trim() === '') {
      analysis.empty.push(product.handle);
      return;
    }
    
    // Store sample for pattern analysis
    if (analysis.samples[product.handle] === undefined && Object.keys(analysis.samples).length < 10) {
      analysis.samples[product.handle] = desc.substring(0, 200) + (desc.length > 200 ? '...' : '');
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
    
    // Check for HTML
    if (desc.includes('<') && desc.includes('>')) {
      analysis.withHtml.push(product.handle);
    }
    
    // Check for line breaks
    if (desc.includes('\n') || desc.includes('<br>') || desc.includes('<br/>') || desc.includes('<br />')) {
      analysis.withLineBreaks.push(product.handle);
    }
    
    // Check for lists
    if (desc.match(/^[-•*]/m) || desc.includes('<ul>') || desc.includes('<li>')) {
      analysis.withLists.push(product.handle);
    }
    
    // Check for bold/emphasis
    if (desc.includes('**') || desc.includes('<b>') || desc.includes('<strong>')) {
      analysis.withBold.push(product.handle);
    }
    
    // Plain text (no special formatting)
    if (!desc.includes('<') && !desc.includes('\n') && !desc.includes('**') && !desc.match(/^[-•*]/m)) {
      analysis.plainText.push(product.handle);
    }
  });
  
  // Results
  console.log('📈 ANALYSE-ERGEBNISSE:');
  console.log('====================');
  console.log(`Total Produkte: ${analysis.total}`);
  console.log(`Ohne Beschreibung: ${analysis.empty.length} (${Math.round(analysis.empty.length/analysis.total*100)}%)`);
  console.log(`Mit HTML-Tags: ${analysis.withHtml.length} (${Math.round(analysis.withHtml.length/analysis.total*100)}%)`);
  console.log(`Mit Zeilenumbrüchen: ${analysis.withLineBreaks.length} (${Math.round(analysis.withLineBreaks.length/analysis.total*100)}%)`);
  console.log(`Mit Listen: ${analysis.withLists.length} (${Math.round(analysis.withLists.length/analysis.total*100)}%)`);
  console.log(`Mit Fett-Formatierung: ${analysis.withBold.length} (${Math.round(analysis.withBold.length/analysis.total*100)}%)`);
  console.log(`Nur Plain Text: ${analysis.plainText.length} (${Math.round(analysis.plainText.length/analysis.total*100)}%)`);
  
  console.log('\n📏 LÄNGEN-VERTEILUNG:');
  console.log('====================');
  console.log(`Sehr kurz (<50 Zeichen): ${analysis.lengthDistribution.veryShort.length}`);
  console.log(`Kurz (50-150 Zeichen): ${analysis.lengthDistribution.short.length}`);
  console.log(`Mittel (150-300 Zeichen): ${analysis.lengthDistribution.medium.length}`);
  console.log(`Lang (300-600 Zeichen): ${analysis.lengthDistribution.long.length}`);
  console.log(`Sehr lang (>600 Zeichen): ${analysis.lengthDistribution.veryLong.length}`);
  
  // Save detailed analysis
  fs.writeFileSync('shopify-descriptions-analysis.json', JSON.stringify(analysis, null, 2));
  console.log('\n✅ Detaillierte Analyse in shopify-descriptions-analysis.json gespeichert');
  
  // Show samples
  console.log('\n📝 FORMATIERUNGS-BEISPIELE:');
  console.log('============================');
  
  if (analysis.withHtml.length > 0) {
    console.log('\n1. MIT HTML-TAGS:');
    const htmlExample = products.find(p => analysis.withHtml.includes(p.handle));
    if (htmlExample) {
      console.log(`   Produkt: ${htmlExample.handle}`);
      console.log(`   Beispiel: ${htmlExample.description.substring(0, 150)}...`);
    }
  }
  
  if (analysis.plainText.length > 0) {
    console.log('\n2. NUR PLAIN TEXT:');
    const plainExample = products.find(p => analysis.plainText.includes(p.handle));
    if (plainExample) {
      console.log(`   Produkt: ${plainExample.handle}`);
      console.log(`   Beispiel: ${plainExample.description.substring(0, 150)}...`);
    }
  }
  
  if (analysis.withLineBreaks.length > 0) {
    console.log('\n3. MIT ZEILENUMBRÜCHEN:');
    const breakExample = products.find(p => analysis.withLineBreaks.includes(p.handle));
    if (breakExample) {
      console.log(`   Produkt: ${breakExample.handle}`);
      console.log(`   Beispiel: ${breakExample.description.substring(0, 150).replace(/\n/g, '\\n')}...`);
    }
  }
  
  return analysis;
}

analyzeDescriptions().catch(console.error);