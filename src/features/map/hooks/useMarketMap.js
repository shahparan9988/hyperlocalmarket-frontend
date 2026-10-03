import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { DHAKA_FALLBACK_LOCATION } from "../constants/discoveryDefaults";
import { getDirections } from "../services/mapboxService";
import {
  buildRouteBounds,
  buildStoreBounds,
  formatRouteDistance,
  formatRouteDuration,
  hasValidCoordinates,
} from "../utils/mapHelpers";

const ROUTE_SOURCE_ID = "hlm-route-source";
const ROUTE_LAYER_ID = "hlm-route-layer";

// function createPopupContent(store) {
//   const root = document.createElement("div");
//   root.className = "hlm-map-popup";

//   const title = document.createElement("strong");
//   title.textContent = store.name;

//   const category = document.createElement("span");
//   category.textContent = `${store.businessType} · ${store.distanceText}`;

//   const status = document.createElement("span");
//   status.textContent = store.isOpen ? "Open now" : "Currently closed";
//   status.className = store.isOpen
//     ? "hlm-map-popup__open"
//     : "hlm-map-popup__closed";

//   root.append(title, category, status);
//   return root;
// }

function removeRoute(map) {
  if (map.getLayer(ROUTE_LAYER_ID)) {
    map.removeLayer(ROUTE_LAYER_ID);
  }

  if (map.getSource(ROUTE_SOURCE_ID)) {
    map.removeSource(ROUTE_SOURCE_ID);
  }
}

function getMarkerPriceText(store) {
  if (store.markerPriceText) {
    return store.markerPriceText;
  }

  if (store.price !== null && store.price !== undefined) {
    const price = Number(store.price);

    if (Number.isFinite(price)) {
      return `৳${price.toLocaleString("en-BD")}`;
    }
  }

  const startingPrice =
    store.lowestProductPrice ?? store.startingPrice;

  if (startingPrice !== null && startingPrice !== undefined) {
    const price = Number(startingPrice);

    if (Number.isFinite(price)) {
      return `From ৳${price.toLocaleString("en-BD")}`;
    }
  }

  return "";
}

export function useMarketMap({
  stores,
  selectedStore,
  userLocation,
  routeMode,
  routeRequested,
  onStoreSelect,
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const storeMarkersRef = useRef(new Map());
  const userMarkerRef = useRef(null);
  const onStoreSelectRef = useRef(onStoreSelect);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapError, setMapError] = useState("");
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeError, setRouteError] = useState("");
  const [isRouteLoading, setIsRouteLoading] = useState(false);

  useEffect(() => {
    onStoreSelectRef.current = onStoreSelect;
  }, [onStoreSelect]);

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container || mapRef.current) return undefined;

    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!token) {
      setMapError("Add VITE_MAPBOX_TOKEN to the .env file to display the map.");
      return undefined;
    }

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container,
      style: "mapbox://styles/mapbox/standard",
      center: [
        DHAKA_FALLBACK_LOCATION.longitude,
        DHAKA_FALLBACK_LOCATION.latitude,
      ],
      zoom: 12,
    });

    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    let resizeFrameId;

    const resizeMap = () => {
      cancelAnimationFrame(resizeFrameId);

      resizeFrameId = requestAnimationFrame(() => {
        map.resize();
      });
    };

    const resizeObserver = new ResizeObserver(resizeMap);
    resizeObserver.observe(container);

    const handleLoad = () => {
      map.resize();
      setIsMapReady(true);
      setMapError("");
    };

    const handleError = (event) => {
      console.error("Mapbox error:", event?.error ?? event);
      if (event?.error?.message) {
        setMapError(event.error.message);
      }
    };

    map.on("load", handleLoad);
    map.on("error", handleError);

    // Resize once after React completes the current layout.
    resizeFrameId = requestAnimationFrame(() => {
      map.resize();
    });

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(resizeFrameId);

      map.off("load", handleLoad);
      map.off("error", handleError);
      storeMarkersRef.current.forEach(({ marker }) => marker.remove());
      storeMarkersRef.current.clear();
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      map.remove();
      mapRef.current = null;
      setIsMapReady(false);
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady) return;

    storeMarkersRef.current.forEach(({ marker }) => marker.remove());
    storeMarkersRef.current.clear();

    stores.forEach((store) => {
      const markerWrapper = document.createElement("div");
      markerWrapper.className = "hlm-map-marker-wrapper";

      const priceText = getMarkerPriceText(store);
      let priceTag = null;

      if (priceText) {
        priceTag = document.createElement("div");
        priceTag.className = "hlm-map-price-tag";
        priceTag.textContent = priceText;

        markerWrapper.append(priceTag);
      }
      const markerButton = document.createElement("button");
      markerButton.type = "button";
      markerButton.className = "hlm-map-marker";
      markerButton.setAttribute("aria-label", `Select ${store.name}${priceText ? `, ${priceText}` : ""}`);
      markerButton.dataset.storeId = String(store.id);

      const markerDot = document.createElement("span");
      markerDot.setAttribute("aria-hidden", "true");
      markerButton.append(markerDot);
      markerWrapper.append(markerButton);
      markerButton.addEventListener("click", () => {
        onStoreSelectRef.current?.(store.id);
      });

      markerButton.addEventListener("click", () => {
        onStoreSelectRef.current?.(store.id);
      });

      // const popup = new mapboxgl.Popup({
      //   offset: 28,
      //   closeButton: false,
      //   closeOnClick: false,
      // }).setDOMContent(createPopupContent(store));


      console.log("MAP MARKER:", {
        name: store.name,
        price: store.price,
        lowestProductPrice: store.lowestProductPrice,
        markerPriceText: store.markerPriceText,
        generatedText: getMarkerPriceText(store), 
      });

      const marker = new mapboxgl.Marker({
        element: markerWrapper,
        anchor: "bottom",
      })
        .setLngLat([store.longitude, store.latitude])
        //.setPopup(popup)
        .addTo(map);

      storeMarkersRef.current.set(String(store.id), {
        marker,
        element: markerButton,
        priceTag,
      });
    });

    if (stores.length > 0) {
      const bounds = buildStoreBounds(mapboxgl, stores, userLocation);
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, {
          padding: { top: 80, right: 80, bottom: 80, left: 80 },
          maxZoom: 14,
          duration: 700,
        });
      }
    }


    
  }, [stores, userLocation, isMapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady || !hasValidCoordinates(userLocation)) return;

    userMarkerRef.current?.remove();

    const element = document.createElement("div");
    element.className = "hlm-user-marker";
    element.setAttribute("aria-label", "Your location");

    userMarkerRef.current = new mapboxgl.Marker({ element })
      .setLngLat([userLocation.longitude, userLocation.latitude])
      .addTo(map);
  }, [userLocation, isMapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady) return;

    storeMarkersRef.current.forEach(({ element, priceTag }, storeId) => {
      const isSelected = String(selectedStore?.id) === storeId;
      element.classList.toggle("hlm-map-marker--selected", isSelected);

      // const popup = marker.getPopup();
      // if (isSelected && !popup.isOpen()) {
      //   marker.togglePopup();
      // } else if (!isSelected && popup.isOpen()) {
      //   marker.togglePopup();
      // }

      // if (priceTag) {
      //   priceTag.hidden = isSelected;
      // }
    });

    if (selectedStore) {
      map.easeTo({
        center: [selectedStore.longitude, selectedStore.latitude],
        zoom: Math.max(map.getZoom(), 14),
        duration: 650,
        essential: true,
      });
    }
  }, [selectedStore, isMapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady) return undefined;

    const controller = new AbortController();

    async function drawRoute() {
      if (!routeRequested || !selectedStore || !userLocation) {
        removeRoute(map);
        setRouteInfo(null);
        setRouteError("");
        setIsRouteLoading(false);
        return;
      }

      setIsRouteLoading(true);
      setRouteError("");

      try {
        const route = await getDirections({
          origin: userLocation,
          destination: selectedStore,
          routeMode,
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        const routeFeature = {
          type: "Feature",
          properties: {},
          geometry: route.geometry,
        };

        removeRoute(map);
        map.addSource(ROUTE_SOURCE_ID, {
          type: "geojson",
          data: routeFeature,
        });
        map.addLayer({
          id: ROUTE_LAYER_ID,
          type: "line",
          source: ROUTE_SOURCE_ID,
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#047857",
            "line-width": 5,
            "line-opacity": 0.9,
          },
        });

        const bounds = buildRouteBounds(
          mapboxgl,
          route.geometry.coordinates
        );
        map.fitBounds(bounds, {
          padding: { top: 100, right: 80, bottom: 160, left: 80 },
          maxZoom: 16,
          duration: 800,
        });

        setRouteInfo({
          distanceText: formatRouteDistance(route.distanceInMeters),
          durationText: formatRouteDuration(route.durationInSeconds),
        });
      } catch (error) {
        if (error.name === "AbortError") return;
        removeRoute(map);
        setRouteInfo(null);
        setRouteError(error.message || "Failed to load directions.");
      } finally {
        if (!controller.signal.aborted) {
          setIsRouteLoading(false);
        }
      }
    }

    drawRoute();

    return () => controller.abort();
  }, [
    routeRequested,
    routeMode,
    selectedStore,
    userLocation,
    isMapReady,
  ]);

  const recenterOnUser = () => {
    if (!mapRef.current || !hasValidCoordinates(userLocation)) return;

    mapRef.current.easeTo({
      center: [userLocation.longitude, userLocation.latitude],
      zoom: 14,
      duration: 650,
      essential: true,
    });
  };

  return {
    mapContainerRef,
    isMapReady,
    mapError,
    routeInfo,
    routeError,
    isRouteLoading,
    recenterOnUser,
  };
}
