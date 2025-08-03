import { useState } from 'react';
import Image from 'next/image';
import { Camera, MapPin, Users, Package } from '@/lib/icons';

interface LocalImage {
  url: string;
  caption: string;
  type: 'product' | 'lifestyle' | 'warehouse' | 'team';
}

interface LocalProductGalleryProps {
  productHandle: string;
  productTitle: string;
  shopifyImages: Array<{ url: string; altText?: string }>;
}

// Simulierte lokale Bilder - in Produktion würden diese aus einer Datenbank kommen
const getLocalImages = (productHandle: string): LocalImage[] => {
  // Vorerst deaktiviert bis echte Bilder vorhanden sind
  return [];
  
  // Beispiel-Mapping für Demo-Zwecke (später aktivieren)
  const localImageMap: Record<string, LocalImage[]> = {
    'default': [
      {
        url: '/images/local/warehouse-overview.jpg',
        caption: 'Unser Lager in der Schweiz',
        type: 'warehouse'
      },
      {
        url: '/images/local/team-packing.jpg',
        caption: 'Sorgfältige Verpackung durch unser Team',
        type: 'team'
      }
    ]
  };

  return localImageMap[productHandle] || localImageMap['default'] || [];
};

export function LocalProductGallery({ 
  productHandle, 
  productTitle,
  shopifyImages 
}: LocalProductGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showLocalImages, setShowLocalImages] = useState(false);
  
  const localImages = getLocalImages(productHandle);
  const hasLocalImages = localImages.length > 0;
  
  // Kombiniere Shopify-Bilder mit lokalen Bildern
  const allImages = [
    ...shopifyImages.map(img => ({
      ...img,
      isLocal: false,
      type: 'product' as const,
      caption: undefined
    })),
    ...localImages.map(img => ({
      url: img.url,
      altText: img.caption,
      caption: img.caption,
      isLocal: true,
      type: img.type
    }))
  ];

  const currentImage = allImages[selectedImageIndex];

  return (
    <div className="space-y-4">
      {/* Hauptbild mit Kennzeichnung */}
      <div className="relative aspect-square overflow-hidden bg-gray-50 rounded-lg">
        {currentImage && (
          <>
            <Image
              src={currentImage.url}
              alt={currentImage.altText || productTitle}
              width={800}
              height={800}
              className="w-full h-full object-cover"
              priority={selectedImageIndex === 0}
            />
            
            {/* Badge für lokale Bilder */}
            {currentImage.isLocal && (
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3">
                <div className="flex items-center gap-2 text-sm">
                  {currentImage.type === 'warehouse' && (
                    <>
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-gray-900">Aus unserem Lager</span>
                    </>
                  )}
                  {currentImage.type === 'team' && (
                    <>
                      <Users className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-gray-900">Unser Team</span>
                    </>
                  )}
                  {currentImage.type === 'lifestyle' && (
                    <>
                      <Camera className="w-4 h-4 text-purple-600" />
                      <span className="font-medium text-gray-900">Im Einsatz</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Bildunterschrift für lokale Bilder */}
            {currentImage.isLocal && currentImage.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-white text-sm font-medium">
                  {currentImage.caption}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Toggle für lokale Bilder */}
      {hasLocalImages && (
        <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-700" />
            <span className="text-sm font-medium text-gray-900">
              Echte Fotos aus unserem Schweizer Lager
            </span>
          </div>
          <button
            onClick={() => setShowLocalImages(!showLocalImages)}
            className="text-sm text-amber-700 hover:text-amber-800 font-medium underline"
          >
            {showLocalImages ? 'Produktbilder' : 'Lagerfotos ansehen'}
          </button>
        </div>
      )}

      {/* Thumbnail-Galerie */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {allImages.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImageIndex(index)}
            className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
              selectedImageIndex === index 
                ? 'border-black ring-2 ring-offset-2 ring-black' 
                : 'border-gray-200 hover:border-gray-400'
            }`}
          >
            <Image
              src={image.url}
              alt={`${productTitle} Bild ${index + 1}`}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
            
            {/* Mini-Badge für lokale Bilder in Thumbnails */}
            {image.isLocal && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <div className="bg-white/90 rounded-full p-1">
                  {image.type === 'warehouse' && <MapPin className="w-3 h-3 text-blue-600" />}
                  {image.type === 'team' && <Users className="w-3 h-3 text-green-600" />}
                  {image.type === 'lifestyle' && <Camera className="w-3 h-3 text-purple-600" />}
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Info-Text */}
      <div className="text-xs text-gray-600 italic">
        <Camera className="w-3 h-3 inline mr-1" />
        Alle mit diesem Symbol gekennzeichneten Bilder wurden von uns in der Schweiz aufgenommen
      </div>
    </div>
  );
}