import React from 'react';
import Link from 'next/link';
import { ShopifyCollection } from '@/types/shopify';

interface InternalLinkingProps {
  collections: ShopifyCollection[];
  currentPath?: string;
}

export function InternalLinking({ collections, currentPath }: InternalLinkingProps) {
  // Filter top collections for footer
  const topCollections = collections
    .filter(c => c.products?.edges?.length > 0)
    .sort((a, b) => (b.products?.edges?.length || 0) - (a.products?.edges?.length || 0))
    .slice(0, 6);
    
  return (
    <div className="grid md:grid-cols-3 gap-8">
      {/* Kategorien */}
      <div>
        <h3 className="font-bold text-lg mb-4">Top Kategorien</h3>
        <ul className="space-y-2">
          {topCollections.map(collection => (
            <li key={collection.id}>
              <Link 
                href={`/collections/${collection.handle}`}
                className="text-gray-600 hover:text-primary transition-colors"
              >
                {collection.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Informationen */}
      <div>
        <h3 className="font-bold text-lg mb-4">Informationen</h3>
        <ul className="space-y-2">
          <li>
            <Link href="/ueber-uns" className="text-gray-600 hover:text-primary transition-colors">
              Über AlltagsGold
            </Link>
          </li>
          <li>
            <Link href="/collections" className="text-gray-600 hover:text-primary transition-colors">
              Alle Kategorien
            </Link>
          </li>
          <li>
            <Link href="/products" className="text-gray-600 hover:text-primary transition-colors">
              Alle Produkte
            </Link>
          </li>
          <li>
            <Link href="/blog" className="text-gray-600 hover:text-primary transition-colors">
              Blog & Ratgeber
            </Link>
          </li>
        </ul>
      </div>
      
      {/* Service */}
      <div>
        <h3 className="font-bold text-lg mb-4">Kundenservice</h3>
        <ul className="space-y-2">
          <li>
            <Link href="/contact" className="text-gray-600 hover:text-primary transition-colors">
              Kontakt
            </Link>
          </li>
          <li>
            <Link href="/agb" className="text-gray-600 hover:text-primary transition-colors">
              AGB
            </Link>
          </li>
          <li>
            <Link href="/impressum" className="text-gray-600 hover:text-primary transition-colors">
              Impressum
            </Link>
          </li>
          <li>
            <Link href="/datenschutz" className="text-gray-600 hover:text-primary transition-colors">
              Datenschutz
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}