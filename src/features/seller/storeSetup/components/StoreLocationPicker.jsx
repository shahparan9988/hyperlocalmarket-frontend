import {
  AlertTriangle,
  LocateFixed,
  LoaderCircle,
  MapPin,
  Search,
} from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  MAPBOX_ACCESS_TOKEN,
  MAPBOX_STYLE_URL,
  reverseGeocodeMapbox,
  searchMapboxAddresses,
} from "../services/mapboxGeocoding";

const COUNTRY_CENTERS = {
  BD: [90.4125, 23.8103],
  AU: [151.2093, -33.8688],
};

function validLngLat(coordinates) {
  if (
    String(coordinates?.latitude ?? "").trim() === "" ||
    String(coordinates?.longitude ?? "").trim() === ""
  ) {
    return null;
  }

  const latitude = Number(coordinates.latitude);
  const longitude = Number(coordinates.longitude);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return [longitude, latitude];
}

function coordinateText(coordinates) {
  const lngLat = validLngLat(coordinates);
  return lngLat
    ? `${lngLat[1].toFixed(5)}, ${lngLat[0].toFixed(5)}`
    : "Pin not confirmed";
}

function addressText(address) {
  return [
    address?.addressLine1,
    address?.locality,
    address?.region,
    address?.postcode,
  ]
    .filter(Boolean)
    .join(", ");
}

export default function StoreLocationPicker({
  countryCode,
  coordinates,
  address,
  errors = {},
  onCoordinatesChange,
  onLocationResolved,
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const reverseControllerRef = useRef(null);
  const pinInteractionRef = useRef(null);
  const onCoordinatesChangeRef = useRef(onCoordinatesChange);
  const onLocationResolvedRef = useRef(onLocationResolved);
  const suppressSearchQueryRef = useRef("");
  const queryInitializedRef = useRef(Boolean(address?.addressLine1));
  const initialCoordinatesRef = useRef(coordinates);
  const initialCountryCodeRef = useRef(countryCode);
  const coordinatesRef = useRef(coordinates);
  const [query, setQuery] = useState(() => addressText(address));
  const [suggestions, setSuggestions] = useState([]);
  const [isSuggestionsOpen, setSuggestionsOpen] = useState(false);
  const [isSearching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [isMapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState("");
  const [locationMessage, setLocationMessage] = useState("");
  const [isResolvingPin, setResolvingPin] = useState(false);
  const searchInputId = useId();
  const isAddressSearchActiveRef = useRef(false);

  useEffect(() => {
    onCoordinatesChangeRef.current = onCoordinatesChange;
    onLocationResolvedRef.current = onLocationResolved;
  }, [onCoordinatesChange, onLocationResolved]);

  useEffect(() => {
    coordinatesRef.current = coordinates;
  }, [coordinates]);

  useEffect(() => {
    if (!queryInitializedRef.current && address?.addressLine1) {
      queryInitializedRef.current = true;
      setQuery(addressText(address));
    }
  }, [address]);

  const placeMarker = useCallback((longitude, latitude) => {
    const map = mapRef.current;
    if (!map) return;

    if (!markerRef.current) {
      const marker = new mapboxgl.Marker({
        color: "#00875f",
        draggable: true,
      })
        .setLngLat([longitude, latitude])
        .addTo(map);

      marker.on("dragend", () => {
        const point = marker.getLngLat();
        pinInteractionRef.current?.(point.lng, point.lat, {
          centerMap: false,
          reverseGeocode: true,
        });
      });
      markerRef.current = marker;
    } else {
      markerRef.current.setLngLat([longitude, latitude]);
    }
  }, []);

  const handlePinInteraction = useCallback(
    async (
      longitude,
      latitude,
      { centerMap = false, reverseGeocode = true } = {}
    ) => {
      const nextCoordinates = {
        latitude: Number(latitude).toFixed(6),
        longitude: Number(longitude).toFixed(6),
      };

      placeMarker(longitude, latitude);
      onCoordinatesChangeRef.current?.(nextCoordinates);

      if (centerMap) {
        mapRef.current?.flyTo({
          center: [longitude, latitude],
          zoom: 17,
          essential: true,
        });
      }

      if (!reverseGeocode) return;

      reverseControllerRef.current?.abort();
      const controller = new AbortController();
      reverseControllerRef.current = controller;
      setResolvingPin(true);
      setLocationMessage("Checking the address at this pin…");

      try {
        const location = await reverseGeocodeMapbox(nextCoordinates, {
          signal: controller.signal,
        });

        if (location) {
          suppressSearchQueryRef.current = location.label;
          setQuery(location.label);
          onLocationResolvedRef.current?.(location);
          setLocationMessage("Pin and structured address updated.");
        } else {
          setLocationMessage("Pin updated. Please complete the address manually.");
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          setLocationMessage(
            error.message || "Pin updated, but its address could not be found."
          );
        }
      } finally {
        if (!controller.signal.aborted) setResolvingPin(false);
      }
    },
    [placeMarker]
  );

  useEffect(() => {
    pinInteractionRef.current = handlePinInteraction;
  }, [handlePinInteraction]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return undefined;

    if (!MAPBOX_ACCESS_TOKEN) {
      setMapError("VITE_MAPBOX_TOKEN is missing from your .env file.");
      return undefined;
    }

    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
    const initialCoordinates = initialCoordinatesRef.current;
    const initialCountryCode = initialCountryCodeRef.current;
    const initialLngLat =
      validLngLat(initialCoordinates) ||
      COUNTRY_CENTERS[initialCountryCode] ||
      COUNTRY_CENTERS.BD;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: MAPBOX_STYLE_URL,
      center: initialLngLat,
      zoom: validLngLat(initialCoordinates) ? 16 : 11,
      attributionControl: true,
    });
    mapRef.current = map;
    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "top-right"
    );

    map.on("load", () => {
      setMapReady(true);
      map.resize();
    });
    map.on("click", ({ lngLat }) => {
      pinInteractionRef.current?.(lngLat.lng, lngLat.lat, {
        centerMap: false,
        reverseGeocode: true,
      });
    });
    map.on("error", (event) => {
      if (!map.loaded()) {
        setMapError(event.error?.message || "The Mapbox map could not be loaded.");
      }
    });

    resizeObserverRef.current = new ResizeObserver(() => map.resize());
    resizeObserverRef.current.observe(mapContainerRef.current);

    return () => {
      reverseControllerRef.current?.abort();
      resizeObserverRef.current?.disconnect();
      markerRef.current?.remove();
      markerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;

    // Wait until the map is ready.
    if (!isMapReady || !map) return;

    // These are the coordinates passed from your location form,
    // populated using the saved API data.
    const lngLat = validLngLat({
      latitude: coordinates?.latitude,
      longitude: coordinates?.longitude,
    });

    // No valid coordinates: remove any previous marker.
    if (!lngLat) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }

    const currentPosition = markerRef.current?.getLngLat();

    // Check BEFORE moving the marker.
    const positionChanged =
      !currentPosition ||
      Math.abs(currentPosition.lng - lngLat[0]) > 0.000001 ||
      Math.abs(currentPosition.lat - lngLat[1]) > 0.000001;

    // Create or update the marker using saved longitude and latitude.
    placeMarker(lngLat[0], lngLat[1]);

    // Bring the saved marker into view.
    if (positionChanged) {
      map.stop();

      map.jumpTo({
        center: lngLat,
        zoom: 16,
      });
    }
  }, [
    coordinates?.latitude,
    coordinates?.longitude,
    isMapReady,
    placeMarker,
  ]);

  useEffect(() => {
    if (!isMapReady || validLngLat(coordinates)) return;
    const center = COUNTRY_CENTERS[countryCode];
    if (center) mapRef.current?.easeTo({ center, zoom: 11 });
  }, [coordinates, countryCode, isMapReady]);

  useEffect(() => {
    if (!isAddressSearchActiveRef.current) {
      setSuggestions([]);
      setSuggestionsOpen(false);
      setSearching(false);
      return undefined;
    }

    const trimmedQuery = query.trim();

    if (suppressSearchQueryRef.current) {
      if (suppressSearchQueryRef.current === query) {
        suppressSearchQueryRef.current = "";
        setSuggestions([]);
        setSuggestionsOpen(false);
        return undefined;
      }
      suppressSearchQueryRef.current = "";
    }

    if (trimmedQuery.length < 3) {
      setSuggestions([]);
      setSuggestionsOpen(false);
      setSearching(false);
      return undefined;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      if (
        controller.signal.aborted ||
        !isAddressSearchActiveRef.current
      ) {
        return;
      }
      setSearching(true);
      setSearchError("");

      try {
        const lngLat = validLngLat(coordinatesRef.current);
        const result = await searchMapboxAddresses(trimmedQuery, {
          signal: controller.signal,
          proximity: lngLat
            ? { longitude: lngLat[0], latitude: lngLat[1] }
            : undefined,
        });
        if (
          controller.signal.aborted ||
          !isAddressSearchActiveRef.current
        ) {
          return;
        }

        setSuggestions(result);
        setSuggestionsOpen(true);
      } catch (error) {
        if (error.name !== "AbortError") {
          setSuggestions([]);
          setSuggestionsOpen(false);
          setSearchError(error.message || "Address suggestions are unavailable.");
        }
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 400);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const selectSuggestion = (location) => {
    suppressSearchQueryRef.current = location.label;
    setQuery(location.label);
    setSuggestions([]);
    setSuggestionsOpen(false);
    setSearchError("");
    onLocationResolvedRef.current?.(location);

    const longitude = Number(location.coordinates.longitude);
    const latitude = Number(location.coordinates.latitude);
    placeMarker(longitude, latitude);
    mapRef.current?.flyTo({
      center: [longitude, latitude],
      zoom: 17,
      essential: true,
    });
    setLocationMessage("Address selected. Drag the pin to confirm the entrance.");
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage("Location access is not available in this browser.");
      return;
    }

    setLocationMessage("Finding your location…");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        pinInteractionRef.current?.(coords.longitude, coords.latitude, {
          centerMap: true,
          reverseGeocode: true,
        });
      },
      () => setLocationMessage("We could not access your current location."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <section className="hlm-store-location-picker">
      <div className="hlm-field">
        <label htmlFor={searchInputId}>Find the store address</label>
        <div className="hlm-location-search-row">
          <div className="hlm-location-search-box">
            <div className="hlm-location-search-input">
              <Search size={17} aria-hidden="true" />
              <input
                id={searchInputId}
                value={query}
                onChange={(event) => {
                  isAddressSearchActiveRef.current = true;
                  queryInitializedRef.current = true;

                  setQuery(event.target.value);
                  setSuggestions([]);
                  setSuggestionsOpen(false);
                  setSearchError("");
                }}
                onBlur={() => {
                  isAddressSearchActiveRef.current = false;
                  setSearching(false);
                
                  // Allow a suggestion click to finish before hiding the dropdown.
                  window.setTimeout(() => {
                    setSuggestionsOpen(false);
                  }, 150);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    isAddressSearchActiveRef.current = false;
                    setSuggestionsOpen(false);
                    setSearching(false);
                  }
                }}
              
                onFocus={() => {
                  if (suggestions.length) setSuggestionsOpen(true);
                }}
                placeholder="Search road, area or building"
                autoComplete="off"
                aria-autocomplete="list"
                aria-expanded={isSuggestionsOpen}
              />
              {isSearching && <LoaderCircle className="hlm-spin" size={17} />}
            </div>

            {isSuggestionsOpen && (
              <div className="hlm-location-suggestions" role="listbox">
                {suggestions.length ? (
                  suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id || suggestion.label}
                      type="button"
                      role="option"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => selectSuggestion(suggestion)}
                    >
                      <MapPin size={16} />
                      <span>
                        <strong>{suggestion.title}</strong>
                        <small>{suggestion.subtitle}</small>
                      </span>
                    </button>
                  ))
                ) : (
                  <p>No matching addresses found.</p>
                )}
              </div>
            )}
          </div>

          <button
            className="hlm-btn hlm-btn-secondary"
            type="button"
            onClick={useCurrentLocation}
          >
            <LocateFixed size={17} /> Use my location
          </button>
        </div>
        <span className="hlm-field-help">
          Choose a suggestion, click the map, or drag the pin to the customer entrance.
        </span>
        {searchError && <span className="hlm-field-error">{searchError}</span>}
      </div>

      <div className="hlm-location-map">
        <div ref={mapContainerRef} className="hlm-location-map-canvas" />

        {!isMapReady && !mapError && (
          <div className="hlm-location-map-status">
            <LoaderCircle className="hlm-spin" size={22} />
            <span>Loading map…</span>
          </div>
        )}

        {mapError && (
          <div className="hlm-location-map-status is-error">
            <AlertTriangle size={22} />
            <span>{mapError}</span>
          </div>
        )}

        <div className="hlm-location-map-confirmation">
          <div>
            <strong>Confirm the customer entrance</strong>
            <span>Click the map or drag the marker to adjust the exact pin.</span>
          </div>
          <span>{coordinateText(coordinates)}</span>
        </div>
      </div>

      {(errors.latitude || errors.longitude || locationMessage) && (
        <div className="hlm-location-map-message">
          {(errors.latitude || errors.longitude) && (
            <span className="hlm-field-error">
              {errors.latitude || errors.longitude}
            </span>
          )}
          {locationMessage && (
            <span className="hlm-field-help">
              {isResolvingPin && <LoaderCircle className="hlm-spin" size={12} />}
              {locationMessage}
            </span>
          )}
        </div>
      )}
    </section>
  );
}
