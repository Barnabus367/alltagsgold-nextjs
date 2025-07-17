// Professional product description generators
export function getProductIntroduction(title: string): string {
  const productName = title.toLowerCase();
  
  if (productName.includes('ring') || productName.includes('schmuck')) {
    return "Dieses exquisite Schmuckstück wurde nach höchsten Qualitätsstandards gefertigt und bringt schweizerische Präzision in Ihr Leben. Das zeitlose Design macht es zum perfekten Begleiter für besondere Momente.";
  }
  if (productName.includes('kette') || productName.includes('halskette')) {
    return "Eine außergewöhnliche Halskette, die durch ihre erlesene Verarbeitung besticht. Jedes Detail wurde sorgfältig durchdacht, um Ihnen ein Schmuckstück von bleibendem Wert zu bieten.";
  }
  if (productName.includes('ohrringe') || productName.includes('earring')) {
    return "Diese eleganten Ohrringe verkörpern zeitlose Schönheit und moderne Raffinesse. Handverlesen für Menschen mit ausgeprägtem Sinn für Stil und Qualität.";
  }
  if (productName.includes('armband') || productName.includes('bracelet')) {
    return "Ein Armband von außergewöhnlicher Eleganz, das durch seine durchdachte Konstruktion und edle Materialwahl überzeugt. Perfekt für den anspruchsvollen Träger.";
  }
  if (productName.includes('uhr') || productName.includes('watch')) {
    return "Diese Zeitmesser vereint schweizerische Uhrmacherkunst mit modernem Design. Entwickelt für Menschen, die Wert auf Präzision und Stil legen.";
  }
  if (productName.includes('tasche') || productName.includes('bag')) {
    return "Eine durchdachte Taschenlösung, die Funktionalität mit elegantem Design verbindet. Jedes Element wurde für maximale Benutzerfreundlichkeit optimiert.";
  }
  
  return "Dieses sorgfältig kuratierte Produkt repräsentiert unsere hohen Qualitätsansprüche. Entwickelt für Menschen, die das Besondere schätzen und keine Kompromisse bei Qualität eingehen.";
}

export function getProductFeatures(title: string, tags: string[]): string[] {
  const productName = title.toLowerCase();
  const features: string[] = [];
  
  // Material-based features
  if (tags.some(tag => tag.toLowerCase().includes('gold')) || productName.includes('gold')) {
    features.push("Edle Goldlegierung nach schweizerischen Standards");
    features.push("Widerstandsfähige Oberflächenveredelung");
  }
  if (tags.some(tag => tag.toLowerCase().includes('silber')) || productName.includes('silber')) {
    features.push("Sterling Silber 925 - Höchste Reinheit garantiert");
    features.push("Anlaufschutz durch spezielle Behandlung");
  }
  if (tags.some(tag => tag.toLowerCase().includes('edelstahl')) || productName.includes('edelstahl')) {
    features.push("Chirurgischer Edelstahl - Nickelfrei");
    features.push("Korrosionsbeständig und wasserfest");
  }
  
  // Product-specific features
  if (productName.includes('ring')) {
    features.push("Präzisionsgefertigt für perfekte Passform");
    features.push("Komfortfit-Innenseite für ganztägigen Tragekomfort");
  }
  if (productName.includes('kette') || productName.includes('halskette')) {
    features.push("Verstärkte Kettenglieder für maximale Sicherheit");
    features.push("Hochwertiger Federverschluss mit Sicherung");
  }
  if (productName.includes('ohrringe')) {
    features.push("Titanverstärkte Stecker für sichere Befestigung");
    features.push("Gewichtsoptimiert für ermüdungsfreies Tragen");
  }
  if (productName.includes('armband')) {
    features.push("Mikrojustierbare Längeneinstellung");
    features.push("Verstärkte Endstücke für dauerhaften Halt");
  }
  
  // Universal premium features
  if (features.length < 2) {
    features.push("Handgeprüfte Qualitätskontrolle");
    features.push("Nachhaltige Herstellungsverfahren");
    features.push("Exklusive Oberflächenbehandlung");
  }
  
  // Ensure we have exactly 3-4 features
  while (features.length < 3) {
    features.push("Schweizer Qualitätsgarantie");
  }
  
  return features.slice(0, 4);
}

export function getProductCTA(title: string, collection?: string): string {
  const productName = title.toLowerCase();
  
  if (productName.includes('ring')) {
    return "Ein Schmuckstück, das Ihre Persönlichkeit unterstreicht und zu jedem Anlass die richtige Wahl darstellt.";
  }
  if (productName.includes('kette') || productName.includes('halskette')) {
    return "Eine Investition in zeitlose Eleganz, die Sie jahrelang begleiten wird.";
  }
  if (productName.includes('ohrringe')) {
    return "Verleihen Sie Ihrem Look die perfekte Note mit diesem durchdachten Accessoire.";
  }
  if (productName.includes('armband')) {
    return "Ein Symbol für Ihren ausgeprägten Geschmack und Ihre Wertschätzung für Qualität.";
  }
  if (productName.includes('uhr')) {
    return "Präzision und Stil vereint - für Menschen, die das Beste erwarten.";
  }
  if (collection) {
    return `Eine sorgfältige Auswahl für anspruchsvolle Kunden der ${collection}-Kategorie.`;
  }
  
  return "Entdecken Sie die Verbindung von schweizerischer Qualität und zeitlosem Design.";
}