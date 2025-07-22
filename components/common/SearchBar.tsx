import { useState, useRef, useId } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { trackSearch } from '@/lib/analytics';
import { announceToScreenReader } from '@/lib/accessibility';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export function SearchBar({ 
  onSearch, 
  placeholder = "Produkte suchen...", 
  className = "",
  autoFocus = false 
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchId = useId();
  const resultId = useId();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  const performSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      onSearch(searchQuery);
      announceToScreenReader(`Suche nach ${searchQuery} gestartet`);
      
      // Simulate search completion (in real app, this would be when results load)
      setTimeout(() => {
        setIsSearching(false);
        announceToScreenReader(`Suchergebnisse für ${searchQuery} geladen`);
      }, 1000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    // Debounced search for live results
    const timeoutId = setTimeout(() => {
      if (value.length >= 2) {
        onSearch(value);
      }
    }, 300);

    // Track search events (debounced for performance)
    if (value.length >= 3) {
      trackSearch({
        search_string: value,
        content_category: 'products'
      });
    }

    return () => clearTimeout(timeoutId);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
    inputRef.current?.focus();
    announceToScreenReader('Suche geleert');
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`} role="search">
      <label htmlFor={searchId} className="sr-only">
        Produktsuche
      </label>
      
      <Search 
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" 
        aria-hidden="true" 
      />
      
      <Input
        id={searchId}
        ref={inputRef}
        type="search"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-10 pr-10 w-full"
        aria-label="Produktsuche"
        aria-describedby={`${searchId}-help`}
        aria-expanded={false}
        aria-autocomplete="list"
        autoComplete="off"
        autoFocus={autoFocus}
        disabled={isSearching}
      />
      
      {/* Hidden helper text for screen readers */}
      <div id={`${searchId}-help`} className="sr-only">
        Geben Sie mindestens 2 Zeichen ein, um die Suche zu starten. 
        Drücken Sie Enter oder warten Sie kurz für Suchergebnisse.
      </div>
      
      {/* Clear button */}
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Suche löschen"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      )}
      
      {/* Loading indicator */}
      {isSearching && (
        <div 
          className="absolute right-8 top-1/2 transform -translate-y-1/2"
          aria-label="Suche läuft"
          role="status"
        >
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      )}
      
      {/* Live region for search results announcements */}
      <div id={resultId} aria-live="polite" aria-atomic="true" className="sr-only">
        {isSearching ? 'Suche läuft...' : ''}
      </div>
    </form>
  );
}
