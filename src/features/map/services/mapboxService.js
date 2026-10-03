const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const MAPBOX_DIRECTIONS_BASE_URL =
  "https://api.mapbox.com/directions/v5/mapbox";

const SUPPORTED_PROFILES = new Set([
  "driving",
  "driving-traffic",
  "walking",
  "cycling",
]);

function resolveProfile(routeMode) {
  return SUPPORTED_PROFILES.has(routeMode) ? routeMode : "driving";
}

export async function getDirections({
  origin,
  destination,
  routeMode = "driving",
  signal,
}) {
  if (!MAPBOX_TOKEN) {
    throw new Error("Missing VITE_MAPBOX_TOKEN in the environment file.");
  }

  if (!origin || !destination) {
    throw new Error("Origin and destination are required.");
  }

  const profile = resolveProfile(routeMode);
  const coordinates = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;
  const query = new URLSearchParams({
    access_token: MAPBOX_TOKEN,
    geometries: "geojson",
    overview: "full",
    steps: "false",
  });

  const response = await fetch(
    `${MAPBOX_DIRECTIONS_BASE_URL}/${profile}/${coordinates}?${query}`,
    { signal }
  );

  if (!response.ok) {
    throw new Error(`Directions request failed (${response.status}).`);
  }

  const data = await response.json();
  const route = data.routes?.[0];

  if (!route) {
    throw new Error("No route was found for this store.");
  }

  return {
    geometry: route.geometry,
    distanceInMeters: route.distance,
    durationInSeconds: route.duration,
  };
}

