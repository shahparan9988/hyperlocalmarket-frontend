import { useCallback, useEffect, useState } from "react";
import { fetchNearbyStores } from "../services/discoveryApi";
import { mapNearbyStoreResponse } from "../utils/discoveryMappers";

export function useNearbyStores({ location, filters, searchTerm }) {
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadVersion, setReloadVersion] = useState(0);

  const reload = useCallback(() => {
    setReloadVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadStores() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetchNearbyStores(
          {
            latitude: location.latitude,
            longitude: location.longitude,
            radiusKm: filters.radiusKm,
            category: filters.category,
            openNow: filters.openNow,
            deliveryAvailable: filters.deliveryAvailable,
            pickupAvailable: filters.pickupAvailable,
            query: searchTerm,
          },
          controller.signal
        );

        if (!controller.signal.aborted) {
          setStores(mapNearbyStoreResponse(response, location));
        }
      } catch (requestError) {
        if (requestError.name !== "CanceledError" && requestError.name !== "AbortError") {
          setError(requestError.message || "Failed to load nearby stores.");
          setStores([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadStores();
    return () => controller.abort();
  }, [
    location,
    filters.radiusKm,
    filters.category,
    filters.openNow,
    filters.deliveryAvailable,
    filters.pickupAvailable,
    searchTerm,
    reloadVersion,
  ]);

  return {
    stores,
    isLoading,
    error,
    reload,
  };
}

