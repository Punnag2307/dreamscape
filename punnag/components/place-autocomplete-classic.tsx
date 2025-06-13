'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { Input } from '@/components/ui/input'; // Use your Input component

interface PlaceAutocompleteClassicProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void;
  initialValue?: string;
}

export function PlaceAutocompleteClassic({
  onPlaceSelect,
  initialValue = '',
}: PlaceAutocompleteClassicProps) {
  const [inputValue, setInputValue] = useState<string>(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const placesLibrary = useMapsLibrary('places');

  useEffect(() => {
    if (!placesLibrary || !inputRef.current) return;

    console.log('[Autocomplete] Initializing Places Autocomplete...');
    const options: google.maps.places.AutocompleteOptions = {
      // types: ['geocode'], // Restrict to geocoding results (cities, addresses)
      fields: ['geometry.location', 'name', 'formatted_address', 'place_id'], // Specify fields to fetch
    };

    try {
        autocompleteRef.current = new placesLibrary.Autocomplete(inputRef.current, options);

        // Add listener for place selection
        autocompleteRef.current.addListener('place_changed', () => {
          if (autocompleteRef.current) {
            const place = autocompleteRef.current.getPlace();
            if (place.geometry?.location) {
              console.log('[Autocomplete] Place selected:', place);
              onPlaceSelect(place);
              setInputValue(inputRef.current?.value || place.formatted_address || place.name || '');
            } else {
              console.warn('[Autocomplete] Selected place has no geometry:', place);
              onPlaceSelect(null);
              // Potentially show an error to the user
            }
          }
        });
        console.log('[Autocomplete] Places Autocomplete initialized.');

    } catch(e) {
        console.error('[Autocomplete] Error initializing Places Autocomplete:', e);
        // Handle error, maybe show a message
    }

    // Cleanup function (optional but good practice)
    return () => {
        if (autocompleteRef.current) {
            // google.maps.event.clearInstanceListeners(autocompleteRef.current); // Not needed if instance is destroyed
            // Consider removing the pac-container if needed, though it usually gets cleaned up
        }
    };
  }, [placesLibrary, onPlaceSelect]);

  // Handle input changes directly
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    // Optionally clear selection if user types after selecting?
    // onPlaceSelect(null);
  };

  return (
    <Input
      ref={inputRef}
      value={inputValue}
      onChange={handleChange}
      placeholder="Enter a location"
      className="bg-white/80 border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500 shadow-sm w-64"
      style={{ transition: 'width 0.3s ease-in-out' }} // Smooth width transition
      onFocus={(e) => e.target.style.width = '300px'} // Expand on focus
      onBlur={(e) => e.target.style.width = '256px'} // Shrink on blur (256px = w-64)
    />
  );
} 