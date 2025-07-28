/**
 * Custom Cloudinary Image Loader für Next.js
 * Basierend auf bewährter alter Version mit modernen Verbesserungen
 */

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'do7yh4dll';

export default function cloudinaryLoader({ src, width, quality }) {
  // Bereits optimierte URLs überspringen
  if (src.includes('res.cloudinary.com')) {
    return src;
  }
  
  // Lokale Bilder überspringen  
  if (src.startsWith('/') || src.includes('localhost') || src.includes('placeholder')) {
    return src;
  }
  
  // Quality-Parameter optimieren (wie in alter Version)
  const q = quality ? `q_${quality}` : 'q_auto';
  
  // Width-basierte Responsive-Transformation (bewährte alte Logik)
  let transform = `w_${width},${q},f_webp,dpr_auto`;
  
  // Spezielle Optimierungen basierend auf Bildgröße (wie alte Version)
  if (width <= 200) {
    transform += ',c_fill'; // Kleine Thumbnails croppen
  } else if (width <= 800) {
    transform += ',c_fit'; // Mittlere Bilder proportional skalieren
  } else {
    transform += ',c_limit'; // Große Bilder nur verkleinern, nicht vergrößern
  }
  
  // External URLs über Cloudinary Fetch API optimieren (bewährte Methode)
  if (src.startsWith('http')) {
    const encodedSrc = encodeURIComponent(src);
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/fetch/${transform}/${encodedSrc}`;
  }
  
  // Cloudinary Upload API für eigene Assets (wie alte Version)
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transform}/${src}`;
}