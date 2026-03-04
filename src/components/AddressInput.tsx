import React, { useState, useRef, useEffect } from 'react';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

interface GoogleSuggestion {
  place_id: string;
  description: string;
}

interface AddressInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: () => void;
  placeholder?: string;
  className?: string;
  bgClass?: string;
}

export const AddressInput: React.FC<AddressInputProps> = ({ value, onChange, onSelect, placeholder, className, bgClass = 'bg-white' }) => {
  const [suggestions, setSuggestions] = useState<GoogleSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      setIsApiLoaded(true);
      return;
    }
    
    // Check if script is already injecting
    if (document.getElementById('google-maps-script')) {
      // Poll until it's loaded
      const interval = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          setIsApiLoaded(true);
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsApiLoaded(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (isApiLoaded && !autocompleteService.current) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
    }
  }, [isApiLoaded]);

  const fetchSuggestions = (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    if (!autocompleteService.current) return;

    setIsSearching(true);
    
    // Default bias to current general area logic or remove bias. We'll just search globally but with google's smart defaults.
    autocompleteService.current.getPlacePredictions(
      { input: query },
      (predictions, status) => {
        setIsSearching(false);
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(
            predictions.map(p => ({
              place_id: p.place_id,
              description: p.description
            }))
          );
        } else {
          setSuggestions([]);
        }
      }
    );
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    onChange(val);
    setShowSuggestions(true);
    
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchSuggestions(val);
    }, 500);
  };

  const selectAddress = (suggestion: GoogleSuggestion) => {
    onChange(suggestion.description);
    setShowSuggestions(false);
    if (onSelect) onSelect();
  };

  return (
    <div className="relative">
      <span className="material-symbols-outlined absolute left-3 top-3.5 text-slate-400 text-xl z-10">location_on</span>
      <textarea
        value={value}
        onChange={handleAddressChange}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={placeholder}
        rows={2}
        className={`${bgClass} border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm resize-none relative z-0 ${className || 'w-full'}`}
      />
      {isSearching && <span className="absolute right-3 top-4 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin z-10" />}
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-slate-100 z-50 overflow-hidden max-h-48 overflow-y-auto w-full">
          {suggestions.map((s) => (
            <button
              key={s.place_id}
              type="button"
              onMouseDown={(e) => e.preventDefault()} // to prevent onBlur of textarea
              onClick={() => selectAddress(s)}
              className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 border-b border-slate-50 last:border-0"
            >
              <span className="material-symbols-outlined text-slate-400 text-[16px] align-middle mr-2">location_on</span>
              {s.description}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
