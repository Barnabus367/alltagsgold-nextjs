/**
 * Schweizer CHF Formatierung mit 5-Rappen-Rundung
 * Löst das Problem ungewohnter Rappen-Beträge für Schweizer Kunden
 */

/**
 * Rundet CHF-Beträge auf 5 Rappen (0.05)
 * 47.83 → 47.80, 47.88 → 47.90
 */
export function roundToSwissFrancs(amount: number): number {
  return Math.round(amount * 20) / 20; // Multipliziere mit 20, runde, teile durch 20
}

/**
 * Formatiert CHF-Beträge mit Schweizer Rundung
 * Zeigt gerundeten Betrag mit * Hinweis an
 */
export function formatSwissCHF(
  amount: string | number, 
  currency: string = 'CHF',
  showRoundingHint: boolean = true
): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return `${currency} 0.00`;
  
  const rounded = roundToSwissFrancs(numAmount);
  const difference = Math.abs(numAmount - rounded);
  
  // Wenn Rundung stattgefunden hat und Hinweis gewünscht
  const needsHint = showRoundingHint && difference > 0.001; // Toleranz für Floating-Point
  
  const formattedAmount = `${currency} ${rounded.toFixed(2)}`;
  
  return needsHint ? `${formattedAmount}*` : formattedAmount;
}

/**
 * Berechnet Rundungsdifferenz für Transparenz
 */
export function getSwissRoundingAdjustment(originalAmount: number): {
  originalAmount: number;
  roundedAmount: number;
  adjustment: number;
  adjustmentFormatted: string;
} {
  const rounded = roundToSwissFrancs(originalAmount);
  const adjustment = rounded - originalAmount;
  
  return {
    originalAmount,
    roundedAmount: rounded,
    adjustment,
    adjustmentFormatted: adjustment >= 0 
      ? `+CHF ${Math.abs(adjustment).toFixed(2)}`
      : `-CHF ${Math.abs(adjustment).toFixed(2)}`
  };
}

/**
 * Wrapper für bestehende formatPrice Funktion mit Schweizer Rundung
 */
export function formatPriceSwiss(
  amount: string | number, 
  currency: string = 'CHF',
  showRoundingHint: boolean = false
): string {
  return formatSwissCHF(amount, currency, showRoundingHint);
}
