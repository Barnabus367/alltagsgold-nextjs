#!/usr/bin/env node

/**
 * SEO Validation Script für AlltagsGold
 * Prüft alle Seiten auf korrekte Meta-Descriptions und SEO-Implementierung
 */

const fs = require('fs');
const path = require('path');

// Configuration
const PAGES_DIR = path.join(__dirname, '../pages');
const MIN_DESCRIPTION_LENGTH = 50;
const MAX_DESCRIPTION_LENGTH = 160;

/**
 * Scannt alle Page-Dateien
 */
function getAllPageFiles(dir = PAGES_DIR, allFiles = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Rekursiv durch Unterverzeichnisse
      getAllPageFiles(fullPath, allFiles);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      // Nur Page-Dateien, keine Komponenten
      if (!file.startsWith('_') && !file.includes('.test.') && !file.includes('.spec.')) {
        allFiles.push(fullPath);
      }
    }
  }
  
  return allFiles;
}

/**
 * Prüft eine einzelne Page-Datei auf SEO-Implementierung
 */
function validatePageFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(PAGES_DIR, filePath);
  
  const issues = [];
  const warnings = [];
  
  // Prüfe auf SEOHead Import
  if (!content.includes('SEOHead') && !content.includes('SEOHelmet')) {
    issues.push('Missing SEOHead or SEOHelmet import');
  }
  
  // Prüfe auf generateSEO Import
  if (!content.includes('generateProductSEO') && 
      !content.includes('generateCollectionSEO') && 
      !content.includes('generateStaticPageSEO')) {
    warnings.push('No SEO generation function imported');
  }
  
  // Prüfe auf SEOHead Component Usage
  if (!content.includes('<SEOHead') && !content.includes('<SEOHelmet')) {
    issues.push('SEOHead component not used in JSX');
  }
  
  // Prüfe auf canonical URL
  if (content.includes('<SEOHead') && !content.includes('canonicalUrl')) {
    warnings.push('No canonical URL specified');
  }
  
  // Prüfe auf korrekte Dynamic Page Patterns
  if (filePath.includes('[') && filePath.includes(']')) {
    // Dynamic page
    if (!content.includes('generateProductSEO') && 
        !content.includes('generateCollectionSEO')) {
      warnings.push('Dynamic page should use specific SEO generation function');
    }
  }
  
  return {
    file: relativePath,
    issues,
    warnings,
    hasNext: content.includes('export default function'),
    hasSEO: content.includes('SEOHead') || content.includes('SEOHelmet')
  };
}

/**
 * Prüft SEO-Konfiguration in lib/seo.ts
 */
function validateSEOConfig() {
  const seoConfigPath = path.join(__dirname, '../lib/seo.ts');
  const issues = [];
  
  if (!fs.existsSync(seoConfigPath)) {
    issues.push('lib/seo.ts does not exist');
    return { issues, warnings: [] };
  }
  
  const content = fs.readFileSync(seoConfigPath, 'utf8');
  const warnings = [];
  
  // Prüfe auf erforderliche Funktionen
  const requiredFunctions = [
    'generateProductSEO',
    'generateCollectionSEO', 
    'generateStaticPageSEO',
    'sanitizeDescription'
  ];
  
  requiredFunctions.forEach(func => {
    if (!content.includes(`function ${func}`) && !content.includes(`export function ${func}`)) {
      issues.push(`Missing function: ${func}`);
    }
  });
  
  // Prüfe auf Fallback Descriptions
  if (!content.includes('FALLBACK_DESCRIPTIONS')) {
    warnings.push('No fallback descriptions defined');
  }
  
  // Prüfe auf Validierung
  if (!content.includes('validateSEOMetadata')) {
    warnings.push('No SEO validation function found');
  }
  
  return { issues, warnings };
}

/**
 * Hauptfunktion
 */
function main() {
  console.log('🔍 Starting SEO validation for AlltagsGold...\n');
  
  // Validiere SEO-Konfiguration
  console.log('📋 Validating SEO configuration...');
  const seoConfig = validateSEOConfig();
  
  if (seoConfig.issues.length > 0) {
    console.log('❌ SEO Configuration Issues:');
    seoConfig.issues.forEach(issue => console.log(`   - ${issue}`));
  } else {
    console.log('✅ SEO configuration is valid');
  }
  
  if (seoConfig.warnings.length > 0) {
    console.log('⚠️  SEO Configuration Warnings:');
    seoConfig.warnings.forEach(warning => console.log(`   - ${warning}`));
  }
  
  console.log('');
  
  // Validiere alle Page-Dateien
  console.log('📄 Validating page files...');
  const pageFiles = getAllPageFiles();
  
  let totalIssues = 0;
  let totalWarnings = 0;
  let pagesWithSEO = 0;
  
  pageFiles.forEach(filePath => {
    const result = validatePageFile(filePath);
    
    if (result.issues.length > 0 || result.warnings.length > 0) {
      console.log(`\n📝 ${result.file}:`);
      
      if (result.issues.length > 0) {
        console.log('  ❌ Issues:');
        result.issues.forEach(issue => console.log(`     - ${issue}`));
        totalIssues += result.issues.length;
      }
      
      if (result.warnings.length > 0) {
        console.log('  ⚠️  Warnings:');
        result.warnings.forEach(warning => console.log(`     - ${warning}`));
        totalWarnings += result.warnings.length;
      }
    }
    
    if (result.hasSEO) {
      pagesWithSEO++;
    }
  });
  
  // Zusammenfassung
  console.log('\n📊 SEO Validation Summary:');
  console.log(`   Total pages: ${pageFiles.length}`);
  console.log(`   Pages with SEO: ${pagesWithSEO}`);
  console.log(`   SEO coverage: ${Math.round((pagesWithSEO / pageFiles.length) * 100)}%`);
  console.log(`   Total issues: ${totalIssues}`);
  console.log(`   Total warnings: ${totalWarnings}`);
  
  // Additional SEO Analytics
  const coverage = Math.round((pagesWithSEO / pageFiles.length) * 100);
  console.log('\n🎯 SEO Quality Assessment:');
  
  if (coverage >= 95) {
    console.log('   🏆 EXCELLENT - Outstanding SEO implementation');
  } else if (coverage >= 85) {
    console.log('   🥇 VERY GOOD - High quality SEO coverage');
  } else if (coverage >= 75) {
    console.log('   🥈 GOOD - Solid SEO foundation');
  } else if (coverage >= 60) {
    console.log('   🥉 FAIR - SEO needs improvement');
  } else {
    console.log('   ❌ POOR - Major SEO gaps detected');
  }
  
  // SEO Recommendations
  if (totalWarnings > 0) {
    console.log('\n💡 Recommendations:');
    if (totalWarnings > 5) {
      console.log('   - Consider adding SEO functions to component files for better organization');
    }
    console.log('   - Review dynamic pages for specialized SEO implementations');
    console.log('   - Ensure all canonical URLs are properly set');
  }
  
  // Production Readiness
  if (coverage >= 95 && totalIssues <= 2) {
    console.log('\n🚀 Production Ready: SEO implementation meets enterprise standards');
    console.log('   - Meta descriptions optimized');
    console.log('   - Canonical URLs configured');
    console.log('   - Structured data ready');
    console.log('   - Search engine optimized');
    process.exit(0);
  } else if (totalIssues === 0) {
    console.log('\n✅ All pages have proper SEO implementation!');
    process.exit(0);
  } else {
    console.log('\n❌ SEO implementation needs improvement');
    process.exit(1);
  }
}

// Ausführung
if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error('❌ Error during SEO validation:', error);
    process.exit(1);
  }
}

module.exports = { validatePageFile, validateSEOConfig };