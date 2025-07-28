/**
 * LEGACY CONTENT PROCESSING
 * Bestehende Regex-basierte Logik für Backward-Kompatibilität
 * Extrahiert aus ProductDetail.tsx für bessere Wartbarkeit
 */

export interface LegacyContentResult {
  introText: string;
  benefits: string[];
  sections: Array<{ title: string; content: string[] }>;
}

/**
 * Legacy Content Processing
 * Entspricht der ursprünglichen Logik aus ProductDetail.tsx
 */
export function generateLegacyContent(productData: any): LegacyContentResult {
  const description = productData.description;
  
  if (!description) {
    return { 
      introText: productData.title || 'Produkt wird geladen...', 
      benefits: [], 
      sections: [
        {
          title: 'Pflege & Wartung',
          content: [
            'Trocken und staubfrei lagern',
            'Mit weichem Tuch reinigen',
            'Vor Feuchtigkeit schützen',
            'Bei Nichtgebrauch sicher aufbewahren'
          ]
        }
      ]
    };
  }
  
  // Debug logging - ONLY in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Legacy Processing - Raw Shopify Description:', description);
  }
  
  const sections: Array<{ title: string; content: string[] }> = [];
  
  // Extract intro text (first paragraph before Produktvorteile)
  const introMatch = description.match(/^([\s\S]*?)(?=Produktvorteile|Technische Details|$)/);
  let introText = introMatch ? introMatch[1].trim() : '';
  
  // Fallback to product title if no description found
  if (!introText || introText.length < 10) {
    introText = productData.title || 'Produkt wird geladen...';
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log('📝 Legacy Processing - Extracted intro text:', introText);
  }
  
  // Extract product benefits with stable parsing for concatenated text
  let benefits: string[] = [];
  const benefitsMatch = description.match(/Produktvorteile\s*([\s\S]*?)(?=Technische Details|$)/);
  if (benefitsMatch && benefitsMatch[1]) {
    const benefitsText = benefitsMatch[1].trim();
    if (benefitsText) {
      // Split by recognizable German benefit patterns - manual approach for better results
      const manualBenefits = [];
      
      // Check for specific benefit patterns in the Mini-Eierkocher description
      if (benefitsText.includes('Kochvergnügen für die ganze Familie')) {
        manualBenefits.push('Kochvergnügen für die ganze Familie – bis zu 7 Eier gleichzeitig');
      }
      if (benefitsText.includes('Individuelle Härtegrade')) {
        manualBenefits.push('Individuelle Härtegrade für jeden Geschmack');
      }
      if (benefitsText.includes('Schnelle Zubereitung')) {
        manualBenefits.push('Schnelle Zubereitung für einen zeitsparenden Morgen');
      }
      if (benefitsText.includes('Sicherheitsfunktionen')) {
        manualBenefits.push('Sicherheitsfunktionen für sorgenfreies Kochen');
      }
      if (benefitsText.includes('Kompaktes Design')) {
        manualBenefits.push('Kompaktes Design, das in jede Küche passt');
      }
      
      // If manual parsing worked, use it
      if (manualBenefits.length > 0) {
        benefits = manualBenefits;
      } else {
        // Fallback: try splitting by bullet points (•) or line breaks
        benefits = benefitsText
          .split(/•|\n/) // Split by bullet points or line breaks
          .filter((sentence: string) => sentence.trim().length > 10)
          .map((sentence: string) => sentence.trim())
          .slice(0, 6);
      }
    }
  }
  
  // Extract technical details with stable parsing for concatenated text
  const technicalDetails: string[] = [];
  const techMatch = description.match(/Technische Details\s*([\s\S]*)$/);
  if (techMatch && techMatch[1]) {
    const techText = techMatch[1].trim();
    
    // Debug logging for technical details - ONLY in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Legacy Processing - Raw tech text:', techText);
    }
    
    // Try parsing by bullet points first
    const bulletPoints = techText
      .split(/•|\n/) // Split by bullet points or line breaks
      .filter((item: string) => item.trim().length > 5)
      .map((item: string) => item.trim())
      .slice(0, 8); // Allow more technical details
    
    if (bulletPoints.length > 0) {
      technicalDetails.push(...bulletPoints);
    } else {
      // Fallback: Parse known patterns with flexible whitespace handling
      const patterns = [
        { regex: /Masse:\s*([^A-ZÄÖÜ]*?)(?=\s[A-ZÄÖÜ][a-z]+:|$)/i, label: 'Abmessungen' },
        { regex: /Material:\s*([^A-ZÄÖÜ]*?)(?=\s[A-ZÄÖÜ][a-z]+:|$)/i, label: 'Material' },
        { regex: /Stromversorgung:\s*([^A-ZÄÖÜ]*?)(?=\s[A-ZÄÖÜ][a-z]+:|$)/i, label: 'Stromversorgung' },
        { regex: /Gewicht:\s*([^A-ZÄÖÜ]*?)(?=\s[A-ZÄÖÜ][a-z]+:|$)/i, label: 'Gewicht' },
        { regex: /Leistung:\s*([^A-ZÄÖÜ]*?)(?=\s[A-ZÄÖÜ][a-z]+:|$)/i, label: 'Leistung' },
        { regex: /Kapazität:\s*([^A-ZÄÖÜ]*?)(?=\s[A-ZÄÖÜ][a-z]+:|$)/i, label: 'Kapazität' }
      ];
      
      const addedLabels = new Set<string>();
      
      patterns.forEach(pattern => {
        const match = techText.match(pattern.regex);
        if (match && match[1] && !addedLabels.has(pattern.label)) {
          const value = match[1].trim().replace(/\s+/g, ' '); // Normalize spaces
          if (value && value.length > 1) {
            technicalDetails.push(`${pattern.label}: ${value}`);
            addedLabels.add(pattern.label);
          }
        }
      });
    }
    
    // Debug logging for technical details - ONLY in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Legacy Processing - Found technical details:', technicalDetails);
    }
  }
  
  // Always add technical details section for consistency - IMMER mit Fallback-Inhalten
  if (technicalDetails.length > 0) {
    sections.push({
      title: 'Technische Details',
      content: technicalDetails
    });
  } else {
    // Fallback technical details wenn keine geparst werden können
    sections.push({
      title: 'Technische Details',
      content: [
        'Hochwertige Materialien und Verarbeitung',
        'Qualitätskontrolle nach Swiss Standards',
        'Benutzerfreundliches Design',
        'Langlebige Konstruktion'
      ]
    });
  }
  
  // Always add care instructions section for consistency
  sections.push({
    title: 'Pflege & Wartung',
    content: [
      'Trocken und staubfrei lagern',
      'Mit weichem Tuch reinigen',
      'Vor Feuchtigkeit schützen',
      'Bei Nichtgebrauch sicher aufbewahren'
    ]
  });
  
  return { introText, benefits, sections };
}
