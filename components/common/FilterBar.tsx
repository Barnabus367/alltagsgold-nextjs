import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShopifyCollection } from '@/types/shopify';

interface FilterBarProps {
  collections: ShopifyCollection[];
  selectedCollection: string;
  onCollectionChange: (collection: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  productCount: number;
}

export function FilterBar({
  collections,
  selectedCollection,
  onCollectionChange,
  sortBy,
  onSortChange,
  productCount,
}: FilterBarProps) {
  return (
    <div className="bg-white py-8 border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Category Filters */}
          <div className="flex flex-wrap gap-3">
            <Button
              size="sm"
              variant={selectedCollection === 'all' ? 'default' : 'outline'}
              onClick={() => onCollectionChange('all')}
              className={`rounded-full text-sm ${
                selectedCollection === 'all' 
                  ? 'bg-gray-900 text-white hover:bg-gray-800' 
                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              Alle
            </Button>
            {collections.map((collection) => (
              <Button
                key={collection.id}
                size="sm"
                variant={selectedCollection === collection.handle ? 'default' : 'outline'}
                onClick={() => onCollectionChange(collection.handle)}
                className={`rounded-full text-sm ${
                  selectedCollection === collection.handle 
                    ? 'bg-gray-900 text-white hover:bg-gray-800' 
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                {collection.title}
              </Button>
            ))}
          </div>

          {/* Sort and Count */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {productCount} Produkte
            </span>
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sortieren nach" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Beliebtheit</SelectItem>
                <SelectItem value="price-asc">Preis: Niedrig bis Hoch</SelectItem>
                <SelectItem value="price-desc">Preis: Hoch bis Niedrig</SelectItem>
                <SelectItem value="title-asc">Name: A-Z</SelectItem>
                <SelectItem value="title-desc">Name: Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
