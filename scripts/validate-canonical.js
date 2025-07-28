#!/usr/bin/env node

/**
 * Canonical URL Validation Script für AlltagsGold
 * Prüft alle Seiten auf korrekte Canonical-URL-Implementierung
 */

const fs = require('fs');
const path = require('path');

// Configuration
const PAGES_DIR = path.join(__dirname, '../pages');
const EXPECTED_DOMAIN = 'https://www.alltagsgold.ch';

/**
 * Console Styling
 */
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[37m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

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
      // Nur Page-Dateien, keine Komponenten oder Test-Dateien
      if (!file.startsWith('_') && !file.includes('.test.') && !file.includes('.spec.')) {
        allFiles.push(fullPath);
      }
    }
  }
  
  return allFiles;
}

/**
 * Prüft eine einzelne Page-Datei auf Canonical-URL-Implementierung
 */
function validateCanonicalInPage(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(PAGES_DIR, filePath);
  
  const issues = [];
  const warnings = [];
  const info = [];
  
  // Prüfe auf SEOHead Import und Usage
  const hasSEOHeadImport = content.includes('NextSEOHead');
  const hasSEOHeadUsage = content.includes('<NextSEOHead');
  
  if (!hasSEOHeadImport) {
    issues.push('Missing NextSEOHead import');
  }
  
  if (!hasSEOHeadUsage) {
    issues.push('NextSEOHead component not used');
  }
  
  // Prüfe auf canonicalUrl Prop
  const hasCanonicalUrlProp = content.includes('canonicalUrl=');
  
  if (hasSEOHeadUsage && !hasCanonicalUrlProp) {
    // Spezialfall: not-found, error pages sollten keine Canonical URLs haben
    if (relativePath.includes('not-found') || relativePath.includes('error') || relativePath.includes('404')) {
      info.push('Error page correctly has no canonical URL');
    } else {
      warnings.push('SEO component used but no canonicalUrl specified');
    }
  }
  
  // Extrahiere Canonical URLs
  const canonicalMatches = content.match(/canonicalUrl=["']([^"']+)["']/g);
  const canonicalUrls = canonicalMatches ? canonicalMatches.map(match => {
    const url = match.match(/canonicalUrl=["']([^"']+)["']/)[1];
    return url;
  }) : [];
  
  // Prüfe Canonical URLs
  canonicalUrls.forEach(url => {
    // Prüfe Format
    if (!url.startsWith('/')) {
      issues.push(`Canonical URL should start with /: ${url}`);
    }
    
    // Prüfe auf Query-Parameter
    if (url.includes('?')) {
      warnings.push(`Canonical URL contains query parameters: ${url}`);
    }
    
    // Prüfe auf Fragment
    if (url.includes('#')) {
      warnings.push(`Canonical URL contains fragment: ${url}`);
    }
    
    // Erwartete URLs für bekannte Patterns
    if (relativePath.includes('[handle]')) {
      if (!url.includes('${') && !url.includes('handle')) {
        warnings.push(`Dynamic page should use handle in canonical URL: ${url}`);
      }
    }
  });
  
  // Prüfe auf korrekte Domain-Verwendung in generateCanonicalUrl imports
  if (content.includes('generateCanonicalUrl')) {
    info.push('Uses generateCanonicalUrl utility (good practice)');
  }
  
  return {
    file: relativePath,
    issues,
    warnings,
    info,
    canonicalUrls,
    hasSEO: hasSEOHeadUsage,
    isErrorPage: relativePath.includes('not-found') || relativePath.includes('error') || relativePath.includes('404')
  };
}

/**
 * Validiert bekannte Canonical URL Patterns
 */
function validateCanonicalPatterns() {
  const patterns = [
    { pattern: '/', description: 'Homepage' },
    { pattern: '/products', description: 'Products listing' },
    { pattern: '/collections', description: 'Collections listing' },
    { pattern: '/blog', description: 'Blog listing' },
    { pattern: '/contact', description: 'Contact page' },
    { pattern: '/cart', description: 'Cart page' },
    { pattern: '/agb', description: 'Terms & Conditions' },
    { pattern: '/datenschutz', description: 'Privacy Policy' },
    { pattern: '/impressum', description: 'Legal Notice' },
    { pattern: '/products/[handle]', description: 'Product detail pages' },
    { pattern: '/collections/[handle]', description: 'Collection detail pages' },
    { pattern: '/blog/[handle]', description: 'Blog post pages' }
  ];
  
  log('\n📋 Expected Canonical URL Patterns:', 'bold');
  patterns.forEach(p => {
    const fullUrl = p.pattern === '/' ? EXPECTED_DOMAIN : `${EXPECTED_DOMAIN}${p.pattern}`;
    log(`   ${p.description}: ${fullUrl}`, 'cyan');
  });
}

/**
 * Hauptvalidierung
 */
function main() {
  log('🔗 Starting Canonical URL validation for AlltagsGold...', 'bold');
  
  const pageFiles = getAllPageFiles();
  
  log(`\n📄 Found ${pageFiles.length} page files to validate`, 'blue');
  
  let totalIssues = 0;
  let totalWarnings = 0;
  let pagesWithCanonical = 0;
  let errorPages = 0;
  
  const results = [];
  
  pageFiles.forEach(filePath => {
    const result = validateCanonicalInPage(filePath);
    results.push(result);
    
    totalIssues += result.issues.length;
    totalWarnings += result.warnings.length;
    
    if (result.hasSEO && result.canonicalUrls.length > 0) {
      pagesWithCanonical++;
    }
    
    if (result.isErrorPage) {
      errorPages++;
    }
    
    // Output für jede Datei
    if (result.issues.length > 0 || result.warnings.length > 0 || result.info.length > 0) {
      log(`\n📝 ${result.file}:`, 'yellow');
      
      if (result.issues.length > 0) {
        log('  ❌ Issues:', 'red');
        result.issues.forEach(issue => log(`     - ${issue}`, 'red'));
      }
      
      if (result.warnings.length > 0) {
        log('  ⚠️  Warnings:', 'yellow');
        result.warnings.forEach(warning => log(`     - ${warning}`, 'yellow'));
      }
      
      if (result.info.length > 0) {
        log('  ℹ️  Info:', 'cyan');
        result.info.forEach(info => log(`     - ${info}`, 'cyan'));
      }
      
      if (result.canonicalUrls.length > 0) {
        log('  🔗 Canonical URLs:', 'green');
        result.canonicalUrls.forEach(url => log(`     - ${EXPECTED_DOMAIN}${url}`, 'green'));
      }
    }
  });
  
  // Summary
  log('\n📊 Canonical URL Validation Summary:', 'bold');
  log(`   Total pages: ${pageFiles.length}`, 'cyan');
  log(`   Pages with canonical URLs: ${pagesWithCanonical}`, 'green');
  log(`   Error pages (no canonical needed): ${errorPages}`, 'gray');
  log(`   Total issues: ${totalIssues}`, totalIssues > 0 ? 'red' : 'green');
  log(`   Total warnings: ${totalWarnings}`, totalWarnings > 0 ? 'yellow' : 'green');
  
  // Coverage calculation
  const expectedPages = pageFiles.length - errorPages;
  const coverage = Math.round((pagesWithCanonical / expectedPages) * 100);
  
  log(`\n🎯 Canonical URL Coverage: ${coverage}%`, coverage >= 95 ? 'green' : coverage >= 80 ? 'yellow' : 'red');
  
  // Quality assessment
  if (totalIssues === 0 && coverage >= 95) {
    log('\n🏆 EXCELLENT - Outstanding canonical URL implementation', 'green');
  } else if (totalIssues <= 2 && coverage >= 90) {
    log('\n✅ GOOD - Good canonical URL implementation with minor improvements needed', 'yellow');
  } else {
    log('\n⚠️  NEEDS IMPROVEMENT - Address issues above before deployment', 'red');
  }
  
  validateCanonicalPatterns();
  
  log('\n💡 Best Practices:', 'bold');
  log('   - All pages should have canonical URLs except error pages', 'cyan');
  log('   - Use relative paths starting with /', 'cyan');
  log('   - Remove query parameters and fragments', 'cyan');
  log('   - Use generateCanonicalUrl utility for consistency', 'cyan');
  log('   - Dynamic pages should include handle/slug in URL', 'cyan');
  
  if (totalIssues > 0) {
    process.exit(1);
  }
}

// Run validation
main();