export const DHAKA_FALLBACK_LOCATION = Object.freeze({
  latitude: 23.8103,
  longitude: 90.4125,
  label: "Dhaka",
  source: "fallback",
});

export const DISTANCE_OPTIONS_KM = Object.freeze([1, 3, 5, 10, 20]);

export const STORE_CATEGORIES = Object.freeze([
  "All categories",
  "Grocery",
  "Fresh food",
  "Pharmacy",
  "Fashion",
  "Electronics",
  "Home and garden",
]);

export const ROUTE_MODES = Object.freeze([
  { value: "driving", label: "Driving" },
  { value: "walking", label: "Walking" },
  { value: "cycling", label: "Cycling" },
]);

export const DEFAULT_DISCOVERY_FILTERS = Object.freeze({
  radiusKm: 5,
  category: "All categories",
  openNow: false,
  deliveryAvailable: false,
  pickupAvailable: false,
});

export const DEFAULT_MAP_VIEW = "map";
export const DEFAULT_ROUTE_MODE = "driving";

