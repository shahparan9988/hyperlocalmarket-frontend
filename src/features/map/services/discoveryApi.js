import { apiClient }from "../../../shared/api/apiClient";

const DEMO_STORES = Object.freeze([
  {
    id: "fa7c0868-c45e-4f5d-829d-freshmart0001",
    slug: "fresh-mart-dhanmondi",
    name: "Fresh Mart",
    businessType: "Grocery",
    latitude: 23.8108,
    longitude: 90.4117,
    address: "Dhanmondi, Dhaka",
    rating: 4.9,
    reviewCount: 320,
    isOpen: true,
    isDeliveryAvailable: true,
    isPickupAvailable: true,
    deliveryFee: 60,
    lowestProductPrice: 150,
    markerPriceText: "৳30-৳130",
  },
  {
    id: "11ad9671-c2f0-4eb5-a8ac-fishcorner002",
    slug: "fresh-fish-corner",
    name: "Fresh Fish Corner",
    businessType: "Fresh food",
    latitude: 23.8152,
    longitude: 90.425,
    address: "Mohammadpur, Dhaka",
    rating: 4.7,
    reviewCount: 255,
    isOpen: true,
    isDeliveryAvailable: true,
    isPickupAvailable: false,
    deliveryFee: 80,
    lowestProductPrice: 200,
    markerPriceText: "৳50-৳200",
  },
  {
    id: "5594882e-d8ca-47ba-9d7b-pharmacy0003",
    slug: "javed-pharmacy",
    name: "Javed Pharmacy",
    businessType: "Pharmacy",
    latitude: 23.8045,
    longitude: 90.4188,
    address: "New Market, Dhaka",
    rating: 4.8,
    reviewCount: 201,
    isOpen: true,
    isDeliveryAvailable: false,
    isPickupAvailable: true,
    lowestProductPrice: 100,
    markerPriceText: "৳20-৳100",
  },
  {
    id: "b2ca710d-f2a3-4f44-898b-electronics04",
    slug: "dhaka-electronics",
    name: "Dhaka Electronics",
    businessType: "Electronics",
    latitude: 23.8073,
    longitude: 90.401,
    address: "Kalabagan, Dhaka",
    rating: 4.5,
    reviewCount: 118,
    isOpen: false,
    isDeliveryAvailable: true,
    isPickupAvailable: true,
    deliveryFee: 100,
    lowestProductPrice: 150,
    markerPriceText: "৳150-৳250",
  },
  {
    id: "b2ca710d-f2a3-4f44-898b-electronics05",
    slug: "Munshi-traders",
    name: "Munshi Traders",
    businessType: "construction",
    latitude: 23.8273,
    longitude: 90.421,
    address: "Munshi Lane, Dhaka",
    rating: 4.1,
    reviewCount: 218,
    isOpen: false,
    isDeliveryAvailable: true,
    isPickupAvailable: true,
    deliveryFee: 100,
    lowestProductPrice: 150,
    markerPriceText: "৳150-৳250",
  },
  {
    id: "b2ca710d-f2a3-4f44-898b-electronics06",
    slug: "imran-electronics",
    name: "Imran Electronics",
    businessType: "electronics",
    latitude: 23.8173,
    longitude: 90.411,
    address: "Imran Lane, Dhaka",
    rating: 4.1,
    reviewCount: 218,
    isOpen: false,
    isDeliveryAvailable: true,
    isPickupAvailable: true,
    deliveryFee: 90,
    lowestProductPrice: 130,
    markerPriceText: "৳130-৳230",
  },
  {
    id: "b2ca710d-f2a3-4f44-898b-electronics07",
    slug: "paran-traders",
    name: "Paran Traders",
    businessType: "construction",
    latitude: 23.8193,
    longitude: 90.413,
    address: "Paran Lane, Dhaka",
    rating: 4.1,
    reviewCount: 218,
    isOpen: false,
    isDeliveryAvailable: true,
    isPickupAvailable: true,
    deliveryFee: 100,
    lowestProductPrice: 180,
    markerPriceText: "৳180-৳280",
  },
]);

function useDemoStores() {
  return import.meta.env.VITE_USE_DEMO_STORES !== "false";
}

function filterDemoStores(params) {
  const normalizedQuery = params.query?.trim().toLowerCase() ?? "";

  return DEMO_STORES.filter((store) => {
    const matchesQuery =
      !normalizedQuery ||
      store.name.toLowerCase().includes(normalizedQuery) ||
      store.businessType.toLowerCase().includes(normalizedQuery);

    const matchesCategory =
      !params.category ||
      params.category === "All categories" ||
      store.businessType === params.category;

    const matchesOpen = !params.openNow || store.isOpen;
    const matchesDelivery =
      !params.deliveryAvailable || store.isDeliveryAvailable;
    const matchesPickup =
      !params.pickupAvailable || store.isPickupAvailable;

    return (
      matchesQuery &&
      matchesCategory &&
      matchesOpen &&
      matchesDelivery &&
      matchesPickup
    );
  });
}

export async function fetchNearbyStores(params, signal) {
  if (useDemoStores()) {
    await new Promise((resolve) => window.setTimeout(resolve, 250));
    return filterDemoStores(params);
  }

  const response = await apiClient.get("/stores/nearby", {
    params: {
      latitude: params.latitude,
      longitude: params.longitude,
      radiusKm: params.radiusKm,
      query: params.query || undefined,
      category:
        params.category === "All categories" ? undefined : params.category,
      openNow: params.openNow || undefined,
      deliveryAvailable: params.deliveryAvailable || undefined,
      pickupAvailable: params.pickupAvailable || undefined,
    },
    signal,
  });

  return response.data;
}


