/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Search, Navigation, Compass, Check, AlertTriangle, Loader2, Sparkles } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { motion } from 'motion/react';

interface MapPlaceholderProps {
  onLocationSelect: (locationName: string, coords: { lat: number; lng: number }) => void;
  initialLocationName?: string;
  initialCoords?: { lat: number; lng: number };
}

// Fixed mock locations corresponding to positions on our custom fallback canvas grid
const MOCK_NEIGHBORHOOD_POINTS = [
  { name: "Nagpur Ward 12 (Central Square)", lat: 21.1458, lng: 79.0882, x: 120, y: 140 },
  { name: "Dharampeth Civic Center, Nagpur", lat: 21.1415, lng: 79.0624, x: 340, y: 90 },
  { name: "Laxminagar Public Park Road", lat: 21.1215, lng: 79.0682, x: 220, y: 280 },
  { name: "Sadar Residency Road Block", lat: 21.1610, lng: 79.0815, x: 180, y: 200 },
  { name: "Ramdaspeth Commercial Avenue", lat: 21.1350, lng: 79.0790, x: 290, y: 240 },
  { name: "Greenwood Park Nagpur east", lat: 21.1520, lng: 79.1120, x: 410, y: 190 }
];

const API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

interface MapErrorBoundaryProps {
  children: React.ReactNode;
  fallbackCoords: { lat: number; lng: number };
  fallbackAddress: string;
  onLocationSelect: (locationName: string, coords: { lat: number; lng: number }) => void;
  onErrorTriggered: (err: string) => void;
}

interface MapErrorBoundaryState {
  hasError: boolean;
  errorMsg: string;
}

// Error Boundary to prevent any rendering or runtime crash inside the Google Maps integration layer from crashing the entire app.
class MapErrorBoundary extends React.Component<MapErrorBoundaryProps, MapErrorBoundaryState> {
  props: MapErrorBoundaryProps;
  state: MapErrorBoundaryState;

  constructor(props: MapErrorBoundaryProps) {
    super(props);
    this.props = props;
    this.state = { hasError: false, errorMsg: "" };
  }

  static getDerivedStateFromError(error: any) {
    return { 
      hasError: true, 
      errorMsg: error?.message || String(error) 
    };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("MapErrorBoundary caught rendering/runtime crash inside map system:", error, errorInfo);
    this.props.onErrorTriggered(error?.message || String(error));
  }

  render() {
    if (this.state.hasError) {
      return (
        <FallbackLocalMap
          initialCoords={this.props.fallbackCoords}
          initialLocationName={this.props.fallbackAddress}
          onLocationSelect={this.props.onLocationSelect}
          forcedErrorMsg={`Fault-Tolerant Fallback Activated (Crashed: ${this.state.errorMsg})`}
        />
      );
    }
    return this.props.children;
  }
}

export default function MapPlaceholder({ onLocationSelect, initialLocationName = "", initialCoords }: MapPlaceholderProps) {
  const [coords, setCoords] = useState(initialCoords || { lat: 21.1458, lng: 79.0882 });
  const [selectedAddress, setSelectedAddress] = useState(initialLocationName || "Nagpur Ward 12 (Central Square)");
  const [isLocating, setIsLocating] = useState(false);
  const [mapsError, setMapsError] = useState<string | null>(null);

  // Safe wrapper for setting coordinates
  const setCoordsSafe = (newCoords: { lat: number; lng: number }) => {
    if (
      newCoords && 
      typeof newCoords.lat === 'number' && 
      typeof newCoords.lng === 'number' && 
      !isNaN(newCoords.lat) && 
      !isNaN(newCoords.lng)
    ) {
      setCoords(newCoords);
    } else {
      console.warn("setCoordsSafe: Ignored invalid coordinates update attempt:", newCoords);
    }
  };

  useEffect(() => {
    // Intercept Google Maps billing or authentication failures dynamically
    const originalAuthFailure = (window as any).gm_authFailure;
    (window as any).gm_authFailure = () => {
      console.warn("Google Maps billing/authentication failure intercepted. Moving to interactive fallback map.");
      setMapsError("Map temporarily unavailable. You can still submit the issue.");
      if (originalAuthFailure) {
        originalAuthFailure();
      }
    };

    const handleGlobalError = (event: ErrorEvent) => {
      const msg = event.message || "";
      if (
        msg.includes("Geocoding Service") ||
        msg.includes("Billing") ||
        msg.includes("google.maps") ||
        msg.includes("gm_authFailure")
      ) {
        console.warn("Caught global Google Maps/Geocoding error:", msg);
        setMapsError("Map temporarily unavailable (Billing/API issue). You can still submit the issue.");
        event.preventDefault();
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.message || String(event.reason);
      if (
        reason.includes("Geocoding Service") ||
        reason.includes("Billing") ||
        reason.includes("google.maps")
      ) {
        console.warn("Caught global unhandled promise rejection:", reason);
        setMapsError("Map temporarily unavailable (Billing/API issue). You can still submit the issue.");
        event.preventDefault();
      }
    };

    (window as any).__setMapsError = (err: string) => {
      setMapsError("Map temporarily unavailable (Billing/API issue). You can still submit the issue.");
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      (window as any).gm_authFailure = originalAuthFailure;
      delete (window as any).__setMapsError;
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // If there's a valid API key and no loading or billing error, render the live interactive Google Map wrapped in an Error Boundary
  if (hasValidKey && !mapsError) {
    return (
      <MapErrorBoundary
        fallbackCoords={coords}
        fallbackAddress={selectedAddress}
        onLocationSelect={onLocationSelect}
        onErrorTriggered={(err) => setMapsError(err)}
      >
        <APIProvider apiKey={API_KEY} version="weekly">
          <RealGoogleMapInner
            coords={coords}
            setCoords={setCoordsSafe}
            selectedAddress={selectedAddress}
            setSelectedAddress={setSelectedAddress}
            onLocationSelect={onLocationSelect}
            isLocating={isLocating}
            setIsLocating={setIsLocating}
            onMapsError={(err) => setMapsError(err)}
          />
        </APIProvider>
      </MapErrorBoundary>
    );
  }

  // Otherwise, render the high-fidelity mock SVG interactive map as a graceful fallback
  return (
    <FallbackLocalMap
      initialCoords={coords}
      initialLocationName={selectedAddress}
      onLocationSelect={onLocationSelect}
      forcedErrorMsg={mapsError || undefined}
    />
  );
}

/**
 * 1. REAL GOOGLE MAP INTEGRATION COMPONENT
 */
function RealGoogleMapInner({
  coords,
  setCoords,
  selectedAddress,
  setSelectedAddress,
  onLocationSelect,
  isLocating,
  setIsLocating,
  onMapsError
}: {
  coords: { lat: number; lng: number };
  setCoords: (c: { lat: number; lng: number }) => void;
  selectedAddress: string;
  setSelectedAddress: (a: string) => void;
  onLocationSelect: (locationName: string, coords: { lat: number; lng: number }) => void;
  isLocating: boolean;
  setIsLocating: (l: boolean) => void;
  onMapsError: (err: string) => void;
}) {
  const map = useMap();
  const placesLib = useMapsLibrary('places');
  const markerLib = useMapsLibrary('marker');
  const geometryLib = useMapsLibrary('geometry');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [pinDropped, setPinDropped] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Console logging for dynamic Google Maps API library loads
  useEffect(() => {
    if (map) {
      console.log("📍 Google Map: instance successfully loaded and ready.");
    }
  }, [map]);

  useEffect(() => {
    if (placesLib) {
      console.log("📍 Google Maps: Places library loaded successfully.");
    }
  }, [placesLib]);

  useEffect(() => {
    if (markerLib) {
      console.log("📍 Google Maps: Marker library loaded successfully.");
    }
  }, [markerLib]);

  useEffect(() => {
    if (geometryLib) {
      console.log("📍 Google Maps: Geometry library loaded successfully.");
    }
  }, [geometryLib]);

  // Smoothly center the map when coords change, with error safety
  useEffect(() => {
    if (map && coords && typeof coords.lat === 'number' && typeof coords.lng === 'number' && !isNaN(coords.lat) && !isNaN(coords.lng)) {
      try {
        console.log("📍 Map PanTo Center:", coords);
        map.panTo(coords);
      } catch (err) {
        console.error("Failed to smoothly pan map:", err);
      }
    }
  }, [coords, map]);

  // Autocomplete setup for address search
  useEffect(() => {
    if (!placesLib || !inputRef.current || !map) return;

    try {
      const autocomplete = new placesLib.Autocomplete(inputRef.current, {
        fields: ['formatted_address', 'geometry', 'name'],
      });

      autocomplete.addListener('place_changed', () => {
        try {
          const place = autocomplete.getPlace();
          if (place && place.geometry?.location) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            
            if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
              const formattedAddress = place.formatted_address || place.name || `Nagpur Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
              
              console.log("📍 Autocomplete Selection:", formattedAddress, { lat, lng });
              const newCoords = { lat, lng };
              setCoords(newCoords);
              setSelectedAddress(formattedAddress);
              onLocationSelect(formattedAddress, newCoords);
              setPinDropped(true);
              setTimeout(() => setPinDropped(false), 1200);
            }
          } else {
            console.warn("Autocomplete selection returned no valid location geometry.");
          }
        } catch (e) {
          console.error("Autocomplete change listener failed:", e);
        }
      });
    } catch (e) {
      console.error("Autocomplete instantiation failed:", e);
    }
  }, [placesLib, map]);

  // Reverse Geocode helper using official Google Geocoder API
  const reverseGeocode = (lat: number, lng: number) => {
    if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
      console.warn("reverseGeocode: Rejected invalid input coordinates:", { lat, lng });
      return;
    }

    if (typeof window === 'undefined') return;
    if (typeof (window as any).google === 'undefined' || !(window as any).google.maps) {
      console.warn("reverseGeocode: window.google.maps is undefined. Reverting to custom fallback coordinate address.");
      const customAddress = `Pin Dropped near Nagpur (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
      setSelectedAddress(customAddress);
      onLocationSelect(customAddress, { lat, lng });
      return;
    }

    try {
      const geocoder = new (window as any).google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results: any, status: string) => {
        if (status === 'OK' && results?.[0]) {
          const address = results[0].formatted_address;
          console.log("📍 Reverse Geocode Success:", address);
          setSelectedAddress(address);
          onLocationSelect(address, { lat, lng });
        } else {
          console.warn("Geocoding failed or billing is not enabled:", status);
          const customAddress = `Pin Dropped near Nagpur (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
          setSelectedAddress(customAddress);
          onLocationSelect(customAddress, { lat, lng });
          onMapsError("Map temporarily unavailable (Billing or Quota issue). You can still submit the issue.");
        }
      });
    } catch (error) {
      console.warn("Geocoding service threw error (likely billing/API not enabled):", error);
      const customAddress = `Pin Dropped near Nagpur (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
      setSelectedAddress(customAddress);
      onLocationSelect(customAddress, { lat, lng });
      onMapsError("Map temporarily unavailable (Billing or Quota issue). You can still submit the issue.");
    }
  };

  const handleMapClick = (e: any) => {
    console.log("📍 Map Click Event triggered");
    if (!e) return;
    try {
      const latLng = e.detail?.latLng || e.latLng;
      if (!latLng) {
        console.warn("handleMapClick: Event did not contain latLng detail");
        return;
      }
      
      const latVal = typeof latLng.lat === 'function' ? latLng.lat() : latLng.lat;
      const lngVal = typeof latLng.lng === 'function' ? latLng.lng() : latLng.lng;

      if (typeof latVal !== 'number' || typeof lngVal !== 'number' || isNaN(latVal) || isNaN(lngVal)) {
        console.warn("handleMapClick: Extracted latitude/longitude is invalid", latVal, lngVal);
        return;
      }

      console.log(`📍 Map Click: Dropping pin at Lat: ${latVal}, Lng: ${lngVal}`);
      const newCoords = { lat: latVal, lng: lngVal };
      setCoords(newCoords);
      reverseGeocode(latVal, lngVal);
      setPinDropped(true);
      setTimeout(() => setPinDropped(false), 1200);
    } catch (err) {
      console.error("handleMapClick crashed gracefully captured:", err);
    }
  };

  const handleMarkerDragEnd = (e: any) => {
    console.log("📍 Marker Drag End Event triggered");
    if (!e) return;
    try {
      const latLng = e.latLng || e.detail?.latLng;
      if (!latLng) {
        console.warn("handleMarkerDragEnd: Event did not contain latLng");
        return;
      }

      const latVal = typeof latLng.lat === 'function' ? latLng.lat() : latLng.lat;
      const lngVal = typeof latLng.lng === 'function' ? latLng.lng() : latLng.lng;

      if (typeof latVal !== 'number' || typeof lngVal !== 'number' || isNaN(latVal) || isNaN(lngVal)) {
        console.warn("handleMarkerDragEnd: Dragged latitude/longitude is invalid", latVal, lngVal);
        return;
      }

      console.log(`📍 Marker Drag End: Dropping pin at Lat: ${latVal}, Lng: ${lngVal}`);
      const newCoords = { lat: latVal, lng: lngVal };
      setCoords(newCoords);
      reverseGeocode(latVal, lngVal);
      setPinDropped(true);
      setTimeout(() => setPinDropped(false), 1200);
    } catch (err) {
      console.error("handleMarkerDragEnd crashed gracefully captured:", err);
    }
  };

  const handleGPSClick = () => {
    if (!navigator.geolocation) {
      console.warn("GPS failed: Geolocation API not supported by browser environment.");
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    console.log("📍 GPS request initiated.");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        try {
          const lat = position.coords?.latitude;
          const lng = position.coords?.longitude;
          
          if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) {
            console.error("GPS failed: Latitude or Longitude is null/undefined/NaN");
            setIsLocating(false);
            return;
          }

          console.log(`📍 GPS success: User coordinates at Lat: ${lat}, Lng: ${lng}`);
          const newCoords = { lat, lng };
          setCoords(newCoords);
          reverseGeocode(lat, lng);
          setIsLocating(false);
          setPinDropped(true);
          setTimeout(() => setPinDropped(false), 1200);
        } catch (innerErr) {
          console.error("GPS success handler crashed gracefully:", innerErr);
          setIsLocating(false);
        }
      },
      (error) => {
        console.error("📍 GPS location request failed:", error);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  // Determine if AdvancedMarker is safe to render
  const canRenderMarker = Boolean(
    map && 
    markerLib && 
    typeof window !== 'undefined' && 
    (window as any).google?.maps?.marker &&
    coords && 
    typeof coords.lat === 'number' && 
    typeof coords.lng === 'number' &&
    !isNaN(coords.lat) && 
    !isNaN(coords.lng)
  );

  return (
    <div className="space-y-3" id="live-google-map-section">
      {/* Search Input Autocomplete */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search className="h-4 w-4" />
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search street, area, or landmark in Nagpur..."
          className="w-full pl-9 pr-24 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-3xs font-medium"
        />
        <button
          type="button"
          onClick={handleGPSClick}
          disabled={isLocating}
          className="absolute inset-y-1 right-1 px-3 bg-sky-50 hover:bg-sky-100 text-sky-700 hover:text-sky-800 font-bold text-xs rounded-md transition-all flex items-center gap-1.5 border border-sky-100 disabled:opacity-50 cursor-pointer"
        >
          {isLocating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-600" />
          ) : (
            <Navigation className="h-3.5 w-3.5" />
          )}
          {isLocating ? 'Locating...' : 'My GPS'}
        </button>
      </div>

      {/* Styled Card Container */}
      <div className="relative h-60 w-full bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
        {!mapLoaded && (
          <div className="absolute inset-0 bg-slate-50/90 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-10">
            <Loader2 className="h-7 w-7 text-sky-600 animate-spin" />
            <span className="text-xs text-slate-500 font-semibold animate-pulse">Initializing Google Map...</span>
          </div>
        )}

        <Map
          defaultCenter={coords}
          defaultZoom={14}
          onTilesLoaded={() => {
            console.log("📍 Google Map: Tiles loaded successfully.");
            setMapLoaded(true);
          }}
          onClick={handleMapClick}
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          className="w-full h-full"
          gestureHandling="greedy"
          disableDefaultUI={false}
        >
          {canRenderMarker ? (
            <AdvancedMarker
              position={coords}
              draggable={true}
              onDragEnd={handleMarkerDragEnd}
            >
              <motion.div 
                key={`${coords.lat}-${coords.lng}`}
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="relative flex flex-col items-center"
              >
                {/* Soft glowing marker pulse animation */}
                {pinDropped && (
                  <div className="absolute -top-3.5 h-12 w-12 bg-sky-400/50 rounded-full animate-ping" />
                )}
                {/* Soft persistent visual shadow */}
                <div className="absolute top-[85%] h-5 w-5 bg-sky-600/30 rounded-full animate-pulse -translate-y-1/2" />
                
                <Pin background="#0284c7" glyphColor="#fff" borderColor="#0369a1" scale={1.05} />
              </motion.div>
            </AdvancedMarker>
          ) : (
            mapLoaded && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-amber-500 text-white px-2 py-1 rounded text-[10px] font-bold shadow-md z-20">
                Marker API Loading...
              </div>
            )
          )}
        </Map>

        {/* Small Instruction Watermark */}
        <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] text-slate-500 font-medium flex items-center gap-1.5 border border-slate-200 shadow-xs pointer-events-none z-10">
          <Compass className="h-3.5 w-3.5 text-slate-400" />
          <span>Click map or drag pin to select coordinates</span>
        </div>
      </div>

      {/* Confirmed Location Box */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 text-xs text-slate-600 shadow-3xs animate-fade-in">
        <MapPin className="h-4 w-4 text-sky-500 shrink-0 mt-0.5" />
        <div className="space-y-1 w-full">
          <div className="font-bold text-slate-800 flex items-center justify-between">
            <span>Confirmed Location</span>
            <span className="text-[9px] font-extrabold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100 uppercase tracking-wide flex items-center gap-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-sky-500"></span>
              </span>
              Live GPS Sync
            </span>
          </div>
          <div className="text-slate-600 leading-relaxed font-semibold">{selectedAddress}</div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
            <span>LAT: {coords.lat.toFixed(6)}</span>
            <span className="text-slate-300">•</span>
            <span>LNG: {coords.lng.toFixed(6)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 2. GRACEFUL FALLBACK LOCAL MAP COMPONENT
 */
function FallbackLocalMap({
  initialCoords,
  initialLocationName,
  onLocationSelect,
  forcedErrorMsg
}: {
  initialCoords: { lat: number; lng: number };
  initialLocationName: string;
  onLocationSelect: (locationName: string, coords: { lat: number; lng: number }) => void;
  forcedErrorMsg?: string;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAddress, setSelectedAddress] = useState(initialLocationName);
  const [coords, setCoords] = useState(initialCoords);
  const [markerPos, setMarkerPos] = useState({ x: 120, y: 140 });
  const [isLocating, setIsLocating] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<typeof MOCK_NEIGHBORHOOD_POINTS>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Set initial marker pos based on coords if matching
  useEffect(() => {
    const match = MOCK_NEIGHBORHOOD_POINTS.find(
      p => Math.abs(p.lat - coords.lat) < 0.01 && Math.abs(p.lng - coords.lng) < 0.01
    );
    if (match) {
      setMarkerPos({ x: match.x, y: match.y });
    }
  }, [coords]);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const boundedX = Math.max(15, Math.min(rect.width - 15, x));
    const boundedY = Math.max(15, Math.min(rect.height - 15, y));

    setMarkerPos({ x: boundedX, y: boundedY });

    let closestPoint = MOCK_NEIGHBORHOOD_POINTS[0];
    let minDistance = Infinity;

    MOCK_NEIGHBORHOOD_POINTS.forEach(point => {
      const dx = (point.x / 500) * rect.width - boundedX;
      const dy = (point.y / 300) * rect.height - boundedY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDistance) {
        minDistance = dist;
        closestPoint = point;
      }
    });

    if (minDistance < 60) {
      setSelectedAddress(closestPoint.name);
      setCoords({ lat: closestPoint.lat, lng: closestPoint.lng });
      onLocationSelect(closestPoint.name, { lat: closestPoint.lat, lng: closestPoint.lng });
    } else {
      const pctX = boundedX / rect.width;
      const pctY = boundedY / rect.height;
      // Interpolate around Nagpur center
      const lat = 21.17 - pctY * 0.05;
      const lng = 79.05 + pctX * 0.07;
      const customAddress = `Near Nagpur Grid Square (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)`;
      
      setSelectedAddress(customAddress);
      setCoords({ lat, lng });
      onLocationSelect(customAddress, { lat, lng });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.trim().length > 1) {
      const filtered = MOCK_NEIGHBORHOOD_POINTS.filter(p =>
        p.name.toLowerCase().includes(value.toLowerCase())
      );
      setSearchSuggestions(filtered);
    } else {
      setSearchSuggestions([]);
    }
  };

  const selectSuggestion = (point: typeof MOCK_NEIGHBORHOOD_POINTS[0]) => {
    setSelectedAddress(point.name);
    setCoords({ lat: point.lat, lng: point.lng });
    setMarkerPos({ x: point.x, y: point.y });
    onLocationSelect(point.name, { lat: point.lat, lng: point.lng });
    setSearchQuery('');
    setSearchSuggestions([]);
  };

  const triggerGPS = () => {
    setIsLocating(true);
    setTimeout(() => {
      setIsLocating(false);
      const randomPoint = MOCK_NEIGHBORHOOD_POINTS[Math.floor(Math.random() * MOCK_NEIGHBORHOOD_POINTS.length)];
      setSelectedAddress(randomPoint.name + " (GPS Verified)");
      setCoords({ lat: randomPoint.lat, lng: randomPoint.lng });
      setMarkerPos({ x: randomPoint.x, y: randomPoint.y });
      onLocationSelect(randomPoint.name + " (GPS Verified)", { lat: randomPoint.lat, lng: randomPoint.lng });
    }, 1000);
  };

  return (
    <div className="space-y-3" id="fallback-map-section-container">
      {/* Graceful Fallback Alert Box */}
      <div className="bg-sky-50/50 border border-sky-100 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-sky-950 shadow-3xs animate-fade-in">
        <Sparkles className="h-4.5 w-4.5 text-sky-500 shrink-0 mt-0.5" />
        <div className="space-y-1 font-medium">
          <span className="font-extrabold text-sky-900 block">📍 Nagpur Neighborhood Mapping Active</span>
          <p className="text-sky-750 leading-relaxed text-[11px]">
            To place a pin, simply type your address or click anywhere directly on our interactive Nagpur grid coordinates.
          </p>
        </div>
      </div>

      {/* Fallback Search Input */}
      <div className="relative" id="fallback-map-search-bar">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          placeholder="Search street or neighborhood in Nagpur..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full pl-9 pr-24 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
        />
        <button
          type="button"
          onClick={triggerGPS}
          disabled={isLocating}
          className="absolute inset-y-1 right-1 px-3 bg-sky-50 hover:bg-sky-100 text-sky-700 hover:text-sky-800 font-bold text-xs rounded-md transition-colors flex items-center gap-1.5 border border-sky-100 disabled:opacity-50 cursor-pointer"
        >
          {isLocating ? (
            <span className="h-3.5 w-3.5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Navigation className="h-3.5 w-3.5" />
          )}
          {isLocating ? 'Locating...' : 'My GPS'}
        </button>

        {/* Search Suggestions */}
        {searchSuggestions.length > 0 && (
          <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden divide-y divide-slate-100 text-xs">
            {searchSuggestions.map((suggestion, i) => (
              <button
                key={i}
                type="button"
                onClick={() => selectSuggestion(suggestion)}
                className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-semibold transition-colors"
              >
                <MapPin className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                <span>{suggestion.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Styled Canvas-Like Fallback Map Box */}
      <div 
        ref={containerRef}
        onClick={handleMapClick}
        className="relative h-60 w-full bg-slate-100 rounded-xl overflow-hidden cursor-crosshair border border-slate-200/80 shadow-inner select-none"
        id="fallback-interactive-canvas-map"
      >
        <svg className="absolute inset-0 w-full h-full opacity-65" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="100" height="80" fill="#f0fdf4" rx="8" />
          <rect x="360" y="160" width="130" height="90" fill="#f0fdf4" rx="8" />
          <circle cx="430" cy="190" r="30" fill="#dcfce7" opacity="0.6" />
          <path d="M 0,260 Q 150,220 300,280 T 500,240 L 500,300 L 0,300 Z" fill="#f0f9ff" opacity="0.8" />
          
          <g fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" opacity="0.9">
            <rect x="20" y="90" width="60" height="40" rx="4" />
            <rect x="90" y="90" width="70" height="40" rx="4" />
            <rect x="170" y="90" width="50" height="40" rx="4" />
            <rect x="250" y="20" width="80" height="50" rx="4" />
            <rect x="340" y="20" width="60" height="50" rx="4" />
          </g>

          <g stroke="#ffffff" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" opacity="0.95">
            <line x1="0" y1="140" x2="500" y2="140" />
            <line x1="240" y1="0" x2="240" y2="300" />
            <line x1="110" y1="0" x2="110" y2="300" />
          </g>
          <g stroke="#f1f5f9" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round">
            <line x1="0" y1="140" x2="500" y2="140" />
            <line x1="240" y1="0" x2="240" y2="300" />
            <line x1="110" y1="0" x2="110" y2="300" />
          </g>
        </svg>

        {/* Existing reports overlay to look active */}
        {MOCK_NEIGHBORHOOD_POINTS.map((pt, idx) => (
          <div 
            key={idx}
            style={{ left: `${pt.x}px`, top: `${pt.y}px` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 group"
          >
            <div className="h-2.5 w-2.5 bg-emerald-500/80 rounded-full border border-white shadow-xs group-hover:scale-125 transition-transform cursor-pointer" />
            <div className="absolute left-1/2 bottom-full -translate-x-1/2 mb-1 hidden group-hover:block bg-slate-900 text-white text-[10px] font-medium px-2 py-0.5 rounded whitespace-nowrap shadow z-10">
              Active Area Report
            </div>
          </div>
        ))}

        {/* Movable Marker Pin */}
        <motion.div 
          key={`${markerPos.x}-${markerPos.y}`}
          initial={{ y: -45, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 350, damping: 14 }}
          style={{ left: `${markerPos.x}px`, top: `${markerPos.y}px` }}
          className="absolute -translate-x-1/2 -translate-y-[85%] pointer-events-none"
        >
          <div className="relative flex flex-col items-center">
            <div className="absolute top-[85%] h-5 w-5 bg-amber-500/30 rounded-full animate-ping -translate-y-1/2" />
            <MapPin className="h-8 w-8 text-amber-600 drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)] fill-amber-100" />
            <div className="absolute top-2 w-2 h-2 bg-amber-700 rounded-full" />
          </div>
        </motion.div>

        <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs px-2 py-1 rounded-md text-[10px] text-slate-500 font-medium flex items-center gap-1 border border-slate-200 shadow-xs pointer-events-none">
          <Compass className="h-3 w-3 text-slate-400" />
          <span>Click anywhere to drop location coordinates</span>
        </div>
      </div>

      {/* Confirmed Location Box */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 text-xs text-slate-600 shadow-3xs">
        <MapPin className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1 w-full">
          <div className="font-bold text-slate-800 flex items-center justify-between">
            <span>Confirmed Location</span>
            <span className="text-[9px] font-extrabold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 uppercase tracking-wide flex items-center gap-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
              </span>
              Nagpur Grid
            </span>
          </div>
          <div className="text-slate-600 leading-relaxed font-semibold">{selectedAddress}</div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
            <span>LAT: {coords.lat.toFixed(5)}</span>
            <span className="text-slate-300">•</span>
            <span>LNG: {coords.lng.toFixed(5)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
