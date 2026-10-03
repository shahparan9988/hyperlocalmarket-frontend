const GEOCODING_BASE_URL = "https://api.mapbox.com/search/geocode/v6";

export const MAPBOX_ACCESS_TOKEN =
  import.meta.env.VITE_MAPBOX_TOKEN?.trim() ?? "";

export const MAPBOX_STYLE_URL =
  import.meta.env.VITE_MAPBOX_STYLE_URL?.trim() ||
  "mapbox://styles/mapbox/streets-v12";

const usesPermanentGeocoding =
  import.meta.env.VITE_MAPBOX_GEOCODING_PERMANENT === "true";

function requireToken() {
  if (!MAPBOX_ACCESS_TOKEN) {
    throw new Error("VITE_MAPBOX_TOKEN is missing from the frontend environment.");
  }
}

async function getJson(path, parameters, signal) {
  requireToken();

  const searchParameters = new URLSearchParams({
    ...parameters,
    access_token: MAPBOX_ACCESS_TOKEN,
  });

  if (usesPermanentGeocoding) {
    searchParameters.set("permanent", "true");
  }

  const response = await fetch(
    `${GEOCODING_BASE_URL}/${path}?${searchParameters.toString()}`,
    { signal }
  );

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(
      body?.message || `Mapbox geocoding failed with status ${response.status}.`
    );
  }

  return response.json();
}

function ownOrContext(properties, featureType) {
  if (properties.feature_type === featureType) return properties;
  return properties.context?.[featureType] ?? null;
}

export function normalizeMapboxFeature(feature) {
  const properties = feature?.properties ?? {};
  const featureCoordinates = properties.coordinates ?? {};
  const longitude = Number(
    featureCoordinates.longitude ?? feature?.geometry?.coordinates?.[0]
  );
  const latitude = Number(
    featureCoordinates.latitude ?? feature?.geometry?.coordinates?.[1]
  );

  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return null;

  const address = ownOrContext(properties, "address");
  const street = ownOrContext(properties, "street");
  const neighborhood = ownOrContext(properties, "neighborhood");
  const locality = ownOrContext(properties, "locality");
  const place = ownOrContext(properties, "place");
  const district = ownOrContext(properties, "district");
  const postcode = ownOrContext(properties, "postcode");
  const region = ownOrContext(properties, "region");
  const country = ownOrContext(properties, "country");
  const countryCode = country?.country_code?.toUpperCase() ?? "";
  const regionName =
    countryCode === "AU"
      ? region?.region_code || region?.name || ""
      : region?.name || region?.region_code || "";
  const localityName =
    neighborhood?.name || locality?.name || place?.name || "";
  const addressLine1 =
    address?.name ||
    (properties.feature_type === "address" ? properties.name : "") ||
    street?.name ||
    properties.name ||
    "";
  const label =
    properties.full_address ||
    [properties.name, properties.place_formatted].filter(Boolean).join(", ");

  return {
    id: properties.mapbox_id || feature.id,
    title: properties.name || addressLine1,
    subtitle: properties.place_formatted || "",
    label,
    countryCode,
    coordinates: {
      latitude: latitude.toFixed(6),
      longitude: longitude.toFixed(6),
    },
    address: {
      addressLine1,
      addressLine2: "",
      locality: localityName,
      region: regionName,
      postcode: postcode?.name || "",
      landmark: "",
    },
    adminArea: {
      level1Id: null,
      level2Id: null,
      level3Id: null,
      level1: regionName,
      level2: district?.name || place?.name || "",
      level3: locality?.name || neighborhood?.name || "",
      level4: null,
    },
  };
}

export async function searchMapboxAddresses(
  query,
  { signal, proximity } = {}
) {
  const parameters = {
    q: query.trim().slice(0, 256),
    autocomplete: "true",
    limit: "5",
    language: "en",
    types: "address,street,postcode,place,locality,neighborhood",
  };

  if (proximity) {
    parameters.proximity = `${proximity.longitude},${proximity.latitude}`;
  }

  const result = await getJson("forward", parameters, signal);
  return (result.features ?? [])
    .map(normalizeMapboxFeature)
    .filter(Boolean);
}

export async function reverseGeocodeMapbox(
  { latitude, longitude },
  { signal } = {}
) {
  // Preserve the exact position selected by dragging/clicking.
  const exactPinCoordinates = {
    latitude: Number(latitude).toFixed(6),
    longitude: Number(longitude).toFixed(6),
  };
  
  const result = await getJson(
    "reverse",
    {
      latitude: String(exactPinCoordinates.latitude),
      longitude: String(exactPinCoordinates.longitude),
      language: "en",
    },
    signal
  );

  const mostSpecificFeature = (result.features ?? [])
    .map(normalizeMapboxFeature)
    .find(Boolean);

  if (!mostSpecificFeature) return null;


// Use Mapbox for address details, but retain the seller's pin position.
  return {
    ...mostSpecificFeature,
    coordinates: exactPinCoordinates,
  };
}
