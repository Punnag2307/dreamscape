'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
// Use core library, Map component, and hooks
import { APIProvider, Map, useMapsLibrary, useMap, ControlPosition } from '@vis.gl/react-google-maps';
import { PlaceAutocompleteClassic } from '@/components/place-autocomplete-classic'; // Use the classic autocomplete

// --- Constants ---
const DEFAULT_CENTER = { lat: 40.7128, lng: -74.0060 }; // Default to NYC
const DEFAULT_ZOOM = 12;
const YOUR_GOOGLE_MAPS_API_KEY = "AIzaSyB_q3ScfT-IQYf-SPF5LIguvWCjBPY3TZU";
const YOUR_MAP_ID = "87daf4c26094152d"; // Use for Vector maps & styling

// --- Main Page Component ---
export default function PortalToSurrealPage() {
  const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  // --- Effects ---
  // Effect to update map center when a place is selected
  useEffect(() => {
    if (selectedPlace && selectedPlace.geometry?.location && mapRef.current) {
      const newCenter = selectedPlace.geometry.location;
      console.log('[PlaceSelectedEffect] Setting map center to:', newCenter.toJSON());
      mapRef.current.panTo(newCenter);
      mapRef.current.setZoom(DEFAULT_ZOOM + 3); // Zoom in closer
    }
  }, [selectedPlace]);

  // --- Child Component for Map Initialization & Controls ---
  const MapControls = () => {
    const map = useMap();
    const mapsLibrary = useMapsLibrary('maps');

    // Store map instance in ref
    useEffect(() => {
      if (map && !mapRef.current) {
          console.log('[MapControls] Map instance captured.');
          mapRef.current = map;
      }
    }, [map]);

    // Add Autocomplete control to the map
    useEffect(() => {
        if (!map || !mapsLibrary) return;

        // Find the div holding the autocomplete component
        const controlDiv = document.getElementById('autocomplete-container');
        if (controlDiv && map.controls[ControlPosition.TOP_LEFT].getLength() === 0) {
            console.log('[MapControls] Adding Autocomplete to TOP_LEFT.');
            map.controls[ControlPosition.TOP_LEFT].push(controlDiv);
        }

        // Cleanup if component unmounts (optional, but good practice)
        return () => {
            // Find and remove the control if it exists
            const controls = map.controls[ControlPosition.TOP_LEFT];
            for (let i = 0; i < controls.getLength(); i++) {
                if (controls.getAt(i) === controlDiv) {
                    controls.removeAt(i);
                    break;
                }
            }
        };
    }, [map, mapsLibrary]);

    return null;
  };

  const handlePlaceSelect = useCallback((place: google.maps.places.PlaceResult | null) => {
      console.log('[handlePlaceSelect] Place selected:', place);
      setSelectedPlace(place);
      setError(null);
      // Clear previous error if selection is successful
      if (place) {
          setError(null);
      }
  }, []);

  // --- Render ---
  return (
    <APIProvider apiKey={YOUR_GOOGLE_MAPS_API_KEY} libraries={['maps', 'places', 'streetView']}> {/* Ensure all needed libs */} 
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#222' }}>
         {/* Header (Optional - Keep or remove if Autocomplete is on map) */} 
         <div style={{ padding: '0.5rem 1rem', background: '#111', color: 'white', zIndex: 10, textAlign: 'center' }}>
           <h1 style={{ margin: 0, fontSize: '1.2rem' }}>Portal to Surreal</h1>
           {error && <div style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.2rem' }}>Error: {error}</div>}
         </div>

         {/* Autocomplete Input - Hidden initially, moved onto map by MapControls */} 
         <div id="autocomplete-container" style={{ padding: '8px', zIndex: 5 }}>
            <PlaceAutocompleteClassic onPlaceSelect={handlePlaceSelect} />
         </div>

         {/* Full Screen Map Container */} 
         <div style={{ flexGrow: 1, position: 'relative' }}>
              <Map
                  defaultCenter={DEFAULT_CENTER}
                  defaultZoom={DEFAULT_ZOOM}
                  mapId={YOUR_MAP_ID} // REQUIRED for vector maps & potential styling
                  streetViewControl={true} // Enable Pegman (key for built-in Street View)
                  zoomControl={true}
                  mapTypeControl={false} // Optional: disable map type switch
                  fullscreenControl={false} // Optional: disable fullscreen button
                  style={{width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
                  // gestureHandling: 'greedy' // Optional: improve touch interactions
               >
                  <MapControls /> {/* Component to get map instance & add controls */} 
               </Map>
         </div>
      </div>
    </APIProvider>
  );
} 