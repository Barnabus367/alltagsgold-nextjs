/**
 * Custom Cloudinary Image Loader für Next.js
 * Integriert sich nahtlos mit Next.js Image-Component
 */

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dwrk3iihw';

export default function cloudinaryLoader({ src, width, quality }) {
  // Bereits optimierte URLs überspringen
  if (src.includes('res.cloudinary.com')) {
    return src;
  }
  
  // Lokale Bilder überspringen  
  if (src.startsWith('/') || src.includes('localhost') || src.includes('placeholder')) {
    return src;
  }
  
  // Quality-Parameter optimieren
  const q = quality ? `q_${quality}` : 'q_auto';
  
  // Width-basierte Responsive-Transformation
  let transform = `w_${width},${q},f_auto,dpr_auto`;
  
  // Spezielle Optimierungen basierend auf Bildgröße
  if (width <= 200) {
    transform += ',c_fill'; // Kleine Thumbnails croppen
  } else if (width <= 800) {
    transform += ',c_fit'; // Mittlere Bilder proportional skalieren
  } else {
    transform += ',c_limit'; // Große Bilder nur verkleinern, nicht vergrößern
  }
  
  // External URLs über Cloudinary Fetch API optimieren
  if (src.startsWith('http')) {
    const encodedSrc = encodeURIComponent(src);
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/fetch/${transform}/${encodedSrc}`;
  }
  
  // Cloudinary Upload API für eigene Assets
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transform}/${src}`;
}