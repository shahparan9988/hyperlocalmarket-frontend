import {
  calculateDistanceKm,
  formatDistanceKm,
  hasValidCoordinates,
} from "./mapHelpers";

function readCoordinates(store) {
  const coordinates = store.location?.coordinates ?? store.coordinates ?? {};

  return {
    latitude:
      store.latitude ?? coordinates.latitude ?? coordinates.lat ?? null,
    longitude:
      store.longitude ?? coordinates.longitude ?? coordinates.lng ?? null,
  };
}

function readAddress(store) {
  const address = store.location?.address ?? store.address;

  if (typeof address === "string") return address;

  if (!address) return "Address unavailable";

  return [
    address.addressLine1,
    address.locality,
    address.city,
  ]
    .filter(Boolean)
    .join(", ");
}

export function mapStoreForDiscovery(store, userLocation) {
  const coordinates = readCoordinates(store);
  const distanceKm = hasValidCoordinates(coordinates)
    ? calculateDistanceKm(userLocation, coordinates)
    : null;

  return {
    id: store.id,
    slug: store.slug ?? String(store.id),
    name: store.name ?? "Unnamed store",
    businessType: store.businessType ?? store.category ?? "Local store",
    category: store.category ?? store.businessType ?? "Local store",
    description: store.description ?? "",
    address: readAddress(store),
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    rating: Number(store.rating ?? 0),
    reviewCount: Number(store.reviewCount ?? store.reviews ?? 0),
    logoUrl: store.logoUrl ?? null,
    isOpen: store.isOpen ?? true,
    isDeliveryAvailable:
      store.isDeliveryAvailable ?? store.deliveryAvailable ?? false,
    isPickupAvailable:
      store.isPickupAvailable ?? store.pickupAvailable ?? false,
    deliveryFee: store.deliveryFee ?? null,
    minimumOrderAmount: store.minimumOrderAmount ?? null,
    distanceKm,
    distanceText: formatDistanceKm(distanceKm),
    lowestProductPrice: store.lowestProductPrice,
    markerPriceText: store.markerPriceText,
  };
}

export function mapNearbyStoreResponse(response, userLocation) {
  const records = Array.isArray(response)
    ? response
    : response?.items ?? response?.stores ?? response?.data ?? [];

  return records
    .map((store) => mapStoreForDiscovery(store, userLocation))
    .filter((store) => hasValidCoordinates(store))
    .sort((first, second) => {
      if (first.distanceKm === null) return 1;
      if (second.distanceKm === null) return -1;
      return first.distanceKm - second.distanceKm;
    });
}

