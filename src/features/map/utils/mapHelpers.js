const EARTH_RADIUS_KM = 6371;

function toRadians(value) {
  return (value * Math.PI) / 180;
}

export function isValidCoordinate(value) {
  return typeof value === "number" && Number.isFinite(value);
}

export function hasValidCoordinates(location) {
  return (
    location &&
    isValidCoordinate(location.latitude) &&
    isValidCoordinate(location.longitude) &&
    location.latitude >= -90 &&
    location.latitude <= 90 &&
    location.longitude >= -180 &&
    location.longitude <= 180
  );
}

export function calculateDistanceKm(origin, destination) {
  if (!hasValidCoordinates(origin) || !hasValidCoordinates(destination)) {
    return null;
  }

  const latitudeDifference = toRadians(
    destination.latitude - origin.latitude
  );
  const longitudeDifference = toRadians(
    destination.longitude - origin.longitude
  );

  const originLatitude = toRadians(origin.latitude);
  const destinationLatitude = toRadians(destination.latitude);

  const haversine =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(originLatitude) *
      Math.cos(destinationLatitude) *
      Math.sin(longitudeDifference / 2) ** 2;

  const centralAngle =
    2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

  return EARTH_RADIUS_KM * centralAngle;
}

export function formatDistanceKm(distanceKm) {
  if (typeof distanceKm !== "number" || !Number.isFinite(distanceKm)) {
    return "Distance unavailable";
  }

  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }

  return `${distanceKm.toFixed(1)} km`;
}

export function formatRouteDistance(distanceInMeters) {
  if (typeof distanceInMeters !== "number") return "";

  if (distanceInMeters < 1000) {
    return `${Math.round(distanceInMeters)} m`;
  }

  return `${(distanceInMeters / 1000).toFixed(1)} km`;
}

export function formatRouteDuration(durationInSeconds) {
  if (typeof durationInSeconds !== "number") return "";

  const minutes = Math.max(1, Math.round(durationInSeconds / 60));

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes > 0
    ? `${hours} hr ${remainingMinutes} min`
    : `${hours} hr`;
}

export function buildStoreBounds(mapboxgl, stores, userLocation) {
  const bounds = new mapboxgl.LngLatBounds();

  stores.forEach((store) => {
    if (hasValidCoordinates(store)) {
      bounds.extend([store.longitude, store.latitude]);
    }
  });

  if (hasValidCoordinates(userLocation)) {
    bounds.extend([userLocation.longitude, userLocation.latitude]);
  }

  return bounds;
}

export function buildRouteBounds(mapboxgl, coordinates) {
  const bounds = new mapboxgl.LngLatBounds();

  coordinates.forEach(([longitude, latitude]) => {
    bounds.extend([longitude, latitude]);
  });

  return bounds;
}

