/**
 * EMERGENCY PRODUCTION HOTFIX
 * Globale Schutzfunktionen für alle Shopify-Zugriffe
 */

// Globale Schutzfunktion für alle price-Zugriffe
window.safePriceAccess = function(priceObj, fallback = '–') {
  try {
    if (!priceObj || typeof priceObj !== 'object') return fallback;
    
    const amount = typeof priceObj.amount === 'string' 
      ? parseFloat(priceObj.amount) 
      : typeof priceObj.amount === 'number'
      ? priceObj.amount
      : 0;
      
    const currency = priceObj.currencyCode || 'CHF';
    
    if (isNaN(amount) || amount < 0) return fallback;
    
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  } catch (error) {
    console.warn('Price formatting error:', error);
    return fallback;
  }
};

// Globale Schutzfunktion für numerische Werte
window.safeAmountAccess = function(priceObj, fallback = 0) {
  try {
    if (!priceObj || typeof priceObj !== 'object') return fallback;
    
    const amount = typeof priceObj.amount === 'string' 
      ? parseFloat(priceObj.amount) 
      : typeof priceObj.amount === 'number'
      ? priceObj.amount
      : fallback;
      
    return isNaN(amount) ? fallback : amount;
  } catch (error) {
    console.warn('Amount access error:', error);
    return fallback;
  }
};

// Überschreibe kritische parseFloat-Aufrufe
const originalParseFloat = window.parseFloat;
window.parseFloat = function(value) {
  if (value === undefined || value === null) {
    console.warn('Attempted to parseFloat undefined/null value');
    return 0;
  }
  return originalParseFloat(value);
};

console.log('🛡️ Emergency price protection activated');
