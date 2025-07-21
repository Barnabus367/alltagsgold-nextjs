import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ShoppingBag, Home, Utensils, Shirt, Heart, Gamepad2, Lightbulb, Coffee, Sofa, Car, Baby } from 'lucide-react';
import { ShopifyCollection } from '../../types/shopify';
import { getCategoryImage } from '../../lib/categoryImages';

interface CategoryCardProps {
  collection: ShopifyCollection;
  className?: string;
}

// Funktion für passende Icons basierend auf Collection-Namen
const getCategoryIcon = (collectionHandle: string, collectionTitle: string) => {
  const handle = collectionHandle.toLowerCase();
  const title = collectionTitle.toLowerCase();
  
  if (handle.includes('kitchen') || handle.includes('küche') || title.includes('küche') || title.includes('kitchen')) {
    return Utensils;
  } else if (handle.includes('home') || handle.includes('haus') || title.includes('haus') || title.includes('home') || title.includes('haushalt')) {
    return Home;
  } else if (handle.includes('fashion') || handle.includes('mode') || title.includes('mode') || title.includes('clothing') || title.includes('kleid')) {
    return Shirt;
  } else if (handle.includes('beauty') || handle.includes('schön') || title.includes('beauty') || title.includes('kosmetik')) {
    return Heart;
  } else if (handle.includes('gaming') || handle.includes('spiel') || title.includes('spiel') || title.includes('game')) {
    return Gamepad2;
  } else if (handle.includes('light') || handle.includes('lamp') || title.includes('licht') || title.includes('lampe')) {
    return Lightbulb;
  } else if (handle.includes('coffee') || handle.includes('kaffee') || title.includes('kaffee') || title.includes('coffee')) {
    return Coffee;
  } else if (handle.includes('furniture') || handle.includes('möbel') || title.includes('möbel') || title.includes('sofa')) {
    return Sofa;
  } else if (handle.includes('auto') || handle.includes('car') || title.includes('auto') || title.includes('fahrzeug')) {
    return Car;
  } else if (handle.includes('baby') || handle.includes('kind') || title.includes('baby') || title.includes('kinder')) {
    return Baby;
  } else {
    return ShoppingBag;
  }
};

export function CategoryCard({ collection, className = '' }: CategoryCardProps) {
  const categoryImage = getCategoryImage(collection.title, collection.handle);
  const IconComponent = getCategoryIcon(collection.handle, collection.title);
  
  // Prüfe ob ein echtes Bild verfügbar ist (nicht Unsplash-Fallback)
  const hasRealImage = categoryImage && !categoryImage.includes('unsplash.com');
  
  return (
    <Link href={`/collections/${collection.handle}`} className={`group block ${className}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden">
        {/* Image Container */}
        <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          {hasRealImage ? (
            <>
              <Image
                src={categoryImage}
                alt={`${collection.title} - AlltagsGold Produktkategorien`}
                width={600}
                height={400}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
            </>
          ) : (
            <>
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-gray-200 group-hover:to-gray-300 transition-colors duration-300">
                <IconComponent className="h-16 w-16 text-gray-400 group-hover:text-gray-600 transition-colors duration-300" />
              </div>
            </>
          )}
          
          {/* Overlay Content */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 group-hover:bg-white transition-colors duration-300">
              <h3 className="font-semibold text-gray-900 text-lg mb-1">
                {collection.title}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-2">
                {collection.description || 'Entdecken Sie unsere kuratierte Auswahl'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600">
              <ShoppingBag className="h-4 w-4" />
              <span className="text-sm">Sortiment entdecken</span>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
          </div>
        </div>
      </div>
    </Link>
  );
}

// Alternative: Kompakte Kachel-Version
export function CompactCategoryCard({ collection, className = '' }: CategoryCardProps) {
  const categoryImage = getCategoryImage(collection.title, collection.handle);
  const IconComponent = getCategoryIcon(collection.handle, collection.title);
  const hasRealImage = categoryImage && !categoryImage.includes('unsplash.com');
  
  return (
    <Link href={`/collections/${collection.handle}`} className={`group block ${className}`}>
      <div className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 overflow-hidden">
        <div className="aspect-square relative bg-gradient-to-br from-gray-100 to-gray-200">
          {hasRealImage ? (
            <>
              <Image
                src={categoryImage}
                alt={`${collection.title} - AlltagsGold Produktkategorien`}
                width={600}
                height={400}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-gray-200 group-hover:to-gray-300 transition-colors duration-300">
              <IconComponent className="h-12 w-12 text-gray-400 group-hover:text-gray-600 transition-colors duration-300" />
            </div>
          )}
          
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h3 className="font-semibold text-lg mb-1 drop-shadow-sm">
              {collection.title}
            </h3>
            <div className="flex items-center gap-1 text-white/90 text-sm">
              <span>Entdecken</span>
              <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform duration-200" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Hero-Style große Kategorie-Karte
export function HeroCategoryCard({ collection, className = '' }: CategoryCardProps) {
  const categoryImage = getCategoryImage(collection.title, collection.handle);
  const IconComponent = getCategoryIcon(collection.handle, collection.title);
  const hasRealImage = categoryImage && !categoryImage.includes('unsplash.com');
  
  return (
    <Link href={`/collections/${collection.handle}`} className={`group block ${className}`}>
      <div className="relative h-64 md:h-80 bg-gray-900 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
        {hasRealImage ? (
          <>
            <Image
              src={categoryImage}
              alt={`${collection.title} - AlltagsGold Produktkategorien`}
              width={600}
              height={400}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900 group-hover:from-gray-600 group-hover:to-gray-800 transition-colors duration-300">
            <IconComponent className="h-20 w-20 text-gray-300 group-hover:text-white transition-colors duration-300" />
          </div>
        )}
        
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <h2 className="text-2xl md:text-3xl font-light mb-2 drop-shadow-lg">
            {collection.title}
          </h2>
          <p className="text-white/90 mb-4 line-clamp-2 drop-shadow-sm">
            {collection.description || 'Entdecken Sie unsere exklusive Auswahl'}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium">
              <ShoppingBag className="h-4 w-4" />
              <span>Jetzt entdecken</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-2 group-hover:bg-white/20 transition-colors duration-300">
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}