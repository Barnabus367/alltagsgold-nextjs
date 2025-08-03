// Mobile-optimierte Touch-Targets und Responsive Design

import { useState, useEffect } from 'react';
import { ChevronDown, Filter, X, Search } from '@/lib/icons';
import { Button } from '@/components/ui/button';

interface MobileFilterBarProps {
  categories: string[];
  selectedCategories: string[];
  onCategoryChange: (category: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalProducts: number;
}

export function MobileFilterBar({
  categories,
  selectedCategories,
  onCategoryChange,
  sortBy,
  onSortChange,
  searchQuery,
  onSearchChange,
  totalProducts
}: MobileFilterBarProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // Touch-optimierte Konstanten
  const TOUCH_TARGET_SIZE = 'min-h-[44px] min-w-[44px]'; // Apple/Google Guidelines
  const FILTER_HEIGHT = 'max-h-[70vh]'; // Verhindert Viewport-Overflow

  const sortOptions = [
    { value: 'relevance', label: 'Relevanz' },
    { value: 'price-low-high', label: 'Preis: Niedrig bis Hoch' },
    { value: 'price-high-low', label: 'Preis: Hoch bis Niedrig' },
    { value: 'newest', label: 'Neueste zuerst' },
    { value: 'best-selling', label: 'Bestseller' }
  ];

  // Scroll-Lock bei geöffneten Modals
  useEffect(() => {
    if (isFilterOpen || isSortOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isFilterOpen, isSortOpen]);

  const clearAllFilters = () => {
    selectedCategories.forEach(category => onCategoryChange(category));
    onSearchChange('');
    setIsFilterOpen(false);
  };

  const activeFiltersCount = selectedCategories.length + (searchQuery ? 1 : 0);

  return (
    <>
      {/* Sticky Filter Bar */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-200 px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          {/* Search Toggle - Touch-optimiert */}
          <button
            className={`${TOUCH_TARGET_SIZE} flex items-center justify-center rounded-lg border border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors ${isSearchExpanded ? 'bg-blue-50 border-blue-300' : ''}`}
            onClick={() => setIsSearchExpanded(!isSearchExpanded)}
            aria-label="Suche öffnen"
          >
            <Search className="w-5 h-5 text-gray-600" />
          </button>

          {/* Filter Button */}
          <button
            className={`${TOUCH_TARGET_SIZE} flex-1 flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors ${activeFiltersCount > 0 ? 'bg-blue-50 border-blue-300' : ''}`}
            onClick={() => setIsFilterOpen(true)}
          >
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              Filter {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </span>
          </button>

          {/* Sort Button */}
          <button
            className={`${TOUCH_TARGET_SIZE} flex-1 flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors`}
            onClick={() => setIsSortOpen(true)}
          >
            <span className="text-sm font-medium text-gray-700 truncate">
              {sortOptions.find(opt => opt.value === sortBy)?.label || 'Sortieren'}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
          </button>
        </div>

        {/* Expandable Search */}
        {isSearchExpanded && (
          <div className="mt-3 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Produkte suchen..."
              className="w-full h-12 pl-10 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              autoFocus
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            )}
          </div>
        )}

        {/* Results Count */}
        <div className="mt-2 text-sm text-gray-600">
          {totalProducts} {totalProducts === 1 ? 'Produkt' : 'Produkte'} gefunden
        </div>
      </div>

      {/* Filter Modal */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsFilterOpen(false)}
          />
          
          {/* Modal */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Filter</h3>
              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-blue-600 hover:text-blue-700 px-3 py-1"
                  >
                    Alle löschen
                  </button>
                )}
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className={`${TOUCH_TARGET_SIZE} flex items-center justify-center rounded-lg hover:bg-gray-100`}
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Filter Content */}
            <div className={`p-4 overflow-y-auto ${FILTER_HEIGHT}`}>
              {/* Kategorien */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Kategorien</h4>
                <div className="space-y-2">
                  {categories.map(category => (
                    <label
                      key={category}
                      className="flex items-center gap-3 cursor-pointer py-2"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => onCategoryChange(category)}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-gray-700 text-base">{category}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <Button
                onClick={() => setIsFilterOpen(false)}
                className="w-full h-12 text-base font-medium"
              >
                Filter anwenden ({totalProducts} Produkte)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Sort Modal */}
      {isSortOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsSortOpen(false)}
          />
          
          {/* Modal */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Sortieren</h3>
              <button
                onClick={() => setIsSortOpen(false)}
                className={`${TOUCH_TARGET_SIZE} flex items-center justify-center rounded-lg hover:bg-gray-100`}
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Sort Options */}
            <div className="p-4">
              <div className="space-y-1">
                {sortOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onSortChange(option.value);
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left p-4 rounded-lg hover:bg-gray-50 transition-colors ${
                      sortBy === option.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
