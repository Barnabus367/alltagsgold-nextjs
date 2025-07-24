#!/usr/bin/env node

/**
 * Rich Snippets Validation Script
 * Überprüft Schema.org Markup auf allen generierten Seiten
 */

const fs = require('fs');
const path = require('path');

const BUILD_DIR = path.join(__dirname, '../.next/server/pages');

/**
 * Sucht nach JSON-LD Schema.org Markup in HTML-Dateien
 */
function findStructuredData(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Suche nach JSON-LD Scripts
    const jsonLdRegex = /<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs;
    const matches = content.match(jsonLdRegex);
    
    if (!matches) return [];
    
    return matches.map(match => {
      // Extrahiere JSON-Inhalt
      const jsonMatch = match.match(/>(.+?)</s);
      if (!jsonMatch) return null;
      
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.warn(`⚠️  Invalid JSON-LD in ${filePath}:`, e.message);
        return null;
      }
    }).filter(Boolean);
  } catch (error) {
    return [];
  }
}

/**
 * Analysiert Schema.org Typen
 */
function analyzeSchemaTypes(schemas) {
  const types = {};
  
  schemas.forEach(schema => {
    const type = schema['@type'];
    if (type) {
      types[type] = (types[type] || 0) + 1;
    }
  });
  
  return types;
}

/**
 * Validiert Product Schema
 */
function validateProductSchema(schema) {
  const required = ['name', 'description', 'url', 'offers'];
  const missing = required.filter(field => !schema[field]);
  
  const warnings = [];
  const errors = [];
  
  if (missing.length > 0) {
    errors.push(`Missing required fields: ${missing.join(', ')}`);
  }
  
  if (schema.offers) {
    if (!schema.offers.price) warnings.push('Missing price in offers');
    if (!schema.offers.availability) warnings.push('Missing availability in offers');
  }
  
  if (schema.aggregateRating) {
    if (!schema.aggregateRating.ratingValue) warnings.push('Missing ratingValue');
    if (!schema.aggregateRating.reviewCount) warnings.push('Missing reviewCount');
  } else {
    warnings.push('Missing aggregateRating (recommended for better Rich Snippets)');
  }
  
  return { errors, warnings };
}

/**
 * Hauptvalidierung
 */
function validateRichSnippets() {
  console.log('🔍 Starting Rich Snippets validation...\n');
  
  const stats = {
    totalPages: 0,
    pagesWithSchema: 0,
    schemaTypes: {},
    productPages: 0,
    validProducts: 0,
    errors: [],
    warnings: []
  };
  
  // Durchsuche Build-Verzeichnis
  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (item.endsWith('.html')) {
        stats.totalPages++;
        
        const schemas = findStructuredData(fullPath);
        if (schemas.length > 0) {
          stats.pagesWithSchema++;
          
          // Analysiere Schema-Typen
          const types = analyzeSchemaTypes(schemas);
          Object.keys(types).forEach(type => {
            stats.schemaTypes[type] = (stats.schemaTypes[type] || 0) + types[type];
          });
          
          // Validiere Product Schemas
          schemas.forEach(schema => {
            if (schema['@type'] === 'Product') {
              stats.productPages++;
              const validation = validateProductSchema(schema);
              
              if (validation.errors.length === 0) {
                stats.validProducts++;
              } else {
                stats.errors.push(`${fullPath}: ${validation.errors.join(', ')}`);
              }
              
              if (validation.warnings.length > 0) {
                stats.warnings.push(`${fullPath}: ${validation.warnings.join(', ')}`);
              }
            }
          });
        }
      }
    }
  }
  
  // Scan starten
  if (fs.existsSync(BUILD_DIR)) {
    scanDirectory(BUILD_DIR);
  } else {
    console.error('❌ Build directory not found. Run "npm run build" first.');
    process.exit(1);
  }
  
  // Ergebnisse ausgeben
  console.log('📊 Rich Snippets Validation Summary:');
  console.log(`   Total pages scanned: ${stats.totalPages}`);
  console.log(`   Pages with Schema.org markup: ${stats.pagesWithSchema}`);
  console.log(`   Schema coverage: ${Math.round((stats.pagesWithSchema / stats.totalPages) * 100)}%`);
  console.log('');
  
  console.log('📋 Schema Types Found:');
  Object.entries(stats.schemaTypes).forEach(([type, count]) => {
    console.log(`   ${type}: ${count} instances`);
  });
  console.log('');
  
  if (stats.productPages > 0) {
    console.log('🛍️  Product Schema Validation:');
    console.log(`   Product pages found: ${stats.productPages}`);
    console.log(`   Valid product schemas: ${stats.validProducts}`);
    console.log(`   Product schema success rate: ${Math.round((stats.validProducts / stats.productPages) * 100)}%`);
    console.log('');
  }
  
  if (stats.errors.length > 0) {
    console.log('❌ Errors:');
    stats.errors.slice(0, 5).forEach(error => console.log(`   ${error}`));
    if (stats.errors.length > 5) {
      console.log(`   ... and ${stats.errors.length - 5} more errors`);
    }
    console.log('');
  }
  
  if (stats.warnings.length > 0) {
    console.log('⚠️  Warnings:');
    stats.warnings.slice(0, 5).forEach(warning => console.log(`   ${warning}`));
    if (stats.warnings.length > 5) {
      console.log(`   ... and ${stats.warnings.length - 5} more warnings`);
    }
    console.log('');
  }
  
  // Bewertung
  const schemaPercentage = Math.round((stats.pagesWithSchema / stats.totalPages) * 100);
  const productSuccessRate = stats.productPages > 0 ? Math.round((stats.validProducts / stats.productPages) * 100) : 0;
  
  if (schemaPercentage >= 80 && productSuccessRate >= 90 && stats.errors.length === 0) {
    console.log('🏆 EXCELLENT - Rich Snippets implementation is outstanding!');
    console.log('✅ Ready for Google Rich Results');
  } else if (schemaPercentage >= 60 && productSuccessRate >= 70) {
    console.log('🥈 GOOD - Rich Snippets implementation is solid');
    console.log('💡 Some improvements possible');
  } else {
    console.log('🥉 FAIR - Rich Snippets implementation needs work');
    console.log('🔧 Consider fixing errors and adding more schema markup');
  }
  
  console.log('');
  console.log('🔗 Test URLs:');
  console.log('   Google Rich Results Test: https://search.google.com/test/rich-results');
  console.log('   Schema.org Validator: https://validator.schema.org/');
  console.log('   Facebook Debugger: https://developers.facebook.com/tools/debug/');
  
  return stats.errors.length === 0 ? 0 : 1;
}

// Script ausführen
if (require.main === module) {
  const exitCode = validateRichSnippets();
  process.exit(exitCode);
}

module.exports = validateRichSnippets;
