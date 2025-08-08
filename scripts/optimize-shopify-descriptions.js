require('dotenv').config({ path: '.env.local' });
const fs = require('fs');

const SHOPIFY_ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || process.env.SHOPIFY_STORE_DOMAIN;

// Hauptfunktion
async function optimizeDescriptions() {
  console.log('🚀 Starte Shopify Produktbeschreibungs-Optimierung\n');
  
  // 1. Backup erstellen
  console.log('📦 Erstelle Backup aller Original-Beschreibungen...');
  await createBackup();
  
  // 2. Produkte analysieren und die ohne strukturierte Überschriften finden
  console.log('\n🔍 Analysiere Produkte ohne strukturierte Überschriften...');
  const productsToOptimize = await findProductsToOptimize();
  
  console.log(`\n📋 ${productsToOptimize.length} Produkte benötigen Optimierung`);
  
  // 3. Jedes Produkt individuell optimieren
  console.log('\n🎨 Beginne individuelle Optimierung...\n');
  
  for (let i = 0; i < productsToOptimize.length; i++) {
    const product = productsToOptimize[i];
    console.log(`[${i+1}/${productsToOptimize.length}] Optimiere: ${product.title}`);
    
    const optimizedDescription = optimizeProductDescription(product);
    
    // Zeige Vorschau für erste 3 Produkte
    if (i < 3) {
      console.log('  Original (Auszug):', product.body_html.substring(0, 100) + '...');
      console.log('  Optimiert (Auszug):', optimizedDescription.substring(0, 100) + '...');
    }
    
    // Update via API
    await updateProduct(product.id, optimizedDescription);
    
    // Kleine Pause zwischen Updates
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n✅ Optimierung abgeschlossen!');
}

// Backup erstellen
async function createBackup() {
  const response = await fetch(`https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/products.json?limit=250`, {
    headers: {
      'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  const backup = {
    timestamp: new Date().toISOString(),
    products: data.products.map(p => ({
      id: p.id,
      handle: p.handle,
      title: p.title,
      body_html_original: p.body_html
    }))
  };
  
  fs.writeFileSync('shopify-descriptions-backup.json', JSON.stringify(backup, null, 2));
  console.log(`  ✅ Backup gespeichert: shopify-descriptions-backup.json`);
}

// Produkte ohne strukturierte Überschriften finden
async function findProductsToOptimize() {
  const response = await fetch(`https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/products.json?limit=250`, {
    headers: {
      'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  const productsToOptimize = [];
  
  data.products.forEach(product => {
    const desc = product.body_html || '';
    
    // Prüfe ob strukturierte Überschriften fehlen
    const hasH3 = desc.includes('<h3>');
    const hasProductBenefits = desc.toLowerCase().includes('produktvorteile') || 
                               desc.toLowerCase().includes('vorteile') ||
                               desc.toLowerCase().includes('features');
    const hasTechnicalDetails = desc.toLowerCase().includes('technische details') || 
                                desc.toLowerCase().includes('technische daten') ||
                                desc.toLowerCase().includes('spezifikationen');
    
    // Wenn keine H3 oder keine klaren Sektionen, dann optimieren
    if (!hasH3 || (!hasProductBenefits && !hasTechnicalDetails)) {
      productsToOptimize.push(product);
    }
  });
  
  return productsToOptimize;
}

// Individuelle Optimierung basierend auf Produktinhalt
function optimizeProductDescription(product) {
  const originalDesc = product.body_html || '';
  const productType = product.product_type || '';
  const title = product.title || '';
  
  // Wenn bereits gut strukturiert, nur leicht anpassen
  if (originalDesc.includes('<h3>') && originalDesc.includes('<ul>')) {
    return standardizeExistingStructure(originalDesc);
  }
  
  // Extrahiere vorhandene Informationen
  const cleanText = originalDesc
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Erstelle optimierte Struktur basierend auf Produkttyp
  let optimized = '';
  
  // Einleitung (erste 1-2 Sätze oder generiere neue)
  let intro = '';
  const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 10);
  
  if (sentences.length > 0) {
    intro = sentences.slice(0, 2).join('. ') + '.';
  } else {
    intro = generateIntro(title, productType);
  }
  
  optimized += `<p>${intro}</p>\n\n`;
  
  // Produktvorteile
  optimized += '<h3>Produktvorteile</h3>\n<ul>\n';
  const benefits = extractOrGenerateBenefits(cleanText, title, productType);
  benefits.forEach(benefit => {
    optimized += `  <li>${benefit}</li>\n`;
  });
  optimized += '</ul>\n\n';
  
  // Technische Details (wenn vorhanden)
  const technicalInfo = extractTechnicalDetails(originalDesc, cleanText);
  if (technicalInfo.length > 0) {
    optimized += '<h3>Technische Details</h3>\n<ul>\n';
    technicalInfo.forEach(detail => {
      optimized += `  <li>${detail}</li>\n`;
    });
    optimized += '</ul>';
  }
  
  return optimized;
}

// Standardisiere bereits existierende Struktur
function standardizeExistingStructure(html) {
  let standardized = html;
  
  // Vereinheitliche Überschriften
  standardized = standardized.replace(/<h[1-6]>.*?vorteile.*?<\/h[1-6]>/gi, '<h3>Produktvorteile</h3>');
  standardized = standardized.replace(/<h[1-6]>.*?technische.*?<\/h[1-6]>/gi, '<h3>Technische Details</h3>');
  standardized = standardized.replace(/<h[1-6]>.*?spezifikationen.*?<\/h[1-6]>/gi, '<h3>Technische Details</h3>');
  
  return standardized;
}

// Generiere Einleitung basierend auf Produkttitel
function generateIntro(title, productType) {
  const templates = [
    `Entdecken Sie ${title} - die perfekte Lösung für Ihren Alltag.`,
    `Mit ${title} bringen Sie Qualität und Funktionalität in Ihr Zuhause.`,
    `${title} vereint durchdachtes Design mit praktischem Nutzen.`,
    `Erleben Sie ${title} - entwickelt für höchste Ansprüche.`
  ];
  
  // Wähle Template basierend auf Produkttyp
  if (productType.toLowerCase().includes('lampe') || productType.toLowerCase().includes('licht')) {
    return `${title} bringt stilvolle Beleuchtung in jeden Raum. Genießen Sie die perfekte Kombination aus Design und Funktionalität.`;
  } else if (productType.toLowerCase().includes('küche')) {
    return `${title} macht Ihre Küchenarbeit effizienter und angenehmer. Profitieren Sie von durchdachter Schweizer Qualität.`;
  }
  
  return templates[Math.floor(Math.random() * templates.length)];
}

// Extrahiere oder generiere Produktvorteile
function extractOrGenerateBenefits(text, title, productType) {
  const benefits = [];
  
  // Versuche Benefits aus Text zu extrahieren
  const bulletPoints = text.match(/[•\-\*]\s*([^•\-\*\n]+)/g) || [];
  
  if (bulletPoints.length >= 3) {
    // Nutze existierende Bullet Points
    bulletPoints.slice(0, 5).forEach(point => {
      const cleaned = point.replace(/[•\-\*]\s*/, '').trim();
      if (cleaned.length > 10) {
        benefits.push(cleaned);
      }
    });
  }
  
  // Falls zu wenige Benefits gefunden, generiere welche
  if (benefits.length < 3) {
    // Produktspezifische Benefits
    if (productType.toLowerCase().includes('lampe') || productType.toLowerCase().includes('licht')) {
      benefits.push('Energieeffiziente LED-Technologie für niedrige Stromkosten');
      benefits.push('Stufenlos dimmbar für die perfekte Atmosphäre');
      benefits.push('Langlebige Materialien für jahrelange Freude');
    } else if (productType.toLowerCase().includes('küche')) {
      benefits.push('Lebensmittelechte Materialien für sichere Anwendung');
      benefits.push('Einfache Reinigung und Pflege');
      benefits.push('Platzsparendes Design für jede Küche');
    } else if (productType.toLowerCase().includes('haustier')) {
      benefits.push('Sicher und schonend für Ihr Haustier');
      benefits.push('Robuste Verarbeitung für den täglichen Einsatz');
      benefits.push('Einfache Handhabung und Reinigung');
    } else {
      // Generische Benefits
      benefits.push('Hochwertige Verarbeitung für lange Haltbarkeit');
      benefits.push('Durchdachtes Design für optimale Funktionalität');
      benefits.push('Einfache Anwendung im Alltag');
    }
  }
  
  return benefits.slice(0, 5); // Maximal 5 Benefits
}

// Extrahiere technische Details
function extractTechnicalDetails(html, text) {
  const details = [];
  
  // Suche nach Maßen
  const dimensions = text.match(/\d+\s*[x×]\s*\d+\s*(?:[x×]\s*\d+)?\s*(?:cm|mm|m)/gi);
  if (dimensions) {
    dimensions.forEach(dim => {
      details.push(`Maße: ${dim}`);
    });
  }
  
  // Suche nach Material
  const materials = text.match(/(?:Material|Stoff|Oberfläche):\s*([^,\.\n]+)/i);
  if (materials && materials[1]) {
    details.push(`Material: ${materials[1].trim()}`);
  }
  
  // Suche nach Gewicht
  const weight = text.match(/\d+\s*(?:g|kg|Gramm|Kilogramm)/i);
  if (weight) {
    details.push(`Gewicht: ${weight[0]}`);
  }
  
  // Suche nach Leistung
  const power = text.match(/\d+\s*(?:W|Watt|mAh|V|Volt)/i);
  if (power) {
    details.push(`Leistung: ${power[0]}`);
  }
  
  // Suche nach USB/Akku Info
  if (text.toLowerCase().includes('usb')) {
    details.push('Stromversorgung: USB');
  } else if (text.toLowerCase().includes('akku') || text.toLowerCase().includes('batterie')) {
    details.push('Stromversorgung: Akku/Batterie');
  }
  
  return details;
}

// Update Produkt via API
async function updateProduct(productId, newDescription) {
  try {
    const response = await fetch(`https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/products/${productId}.json`, {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        product: {
          id: productId,
          body_html: newDescription
        }
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error(`  ❌ Fehler beim Update: ${error}`);
      return false;
    }
    
    console.log('  ✅ Erfolgreich aktualisiert');
    return true;
  } catch (error) {
    console.error(`  ❌ Fehler: ${error.message}`);
    return false;
  }
}

// Starte Optimierung
optimizeDescriptions().catch(console.error);