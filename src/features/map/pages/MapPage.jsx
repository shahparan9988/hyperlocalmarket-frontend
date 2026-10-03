import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import LocationPermissionPrompt from "../components/LocationPermissionPrompt";
import MapToolbar from "../components/MapToolbar";
import MarketMap from "../components/MarketMap";
import NearbyStoreList from "../components/NearbyStoreList";
import { useNearbyStores } from "../hooks/useNearbyStores";
import { useUserLocation } from "../hooks/useUserLocation";
import { useDiscoveryStore } from "../state/useDiscoveryStore";
import DiscoveryModeTabs from "../components/DiscoveryModeTabs";
import ProductSearchResultsList from "../../products/components/ProductSearchResultsList";
import { useDemoProductSearch } from "../../products/hooks/useDemoProductSearch";

export default function MapPage() {
  const navigate = useNavigate();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [showLocationNotice, setShowLocationNotice] = useState(true);
  const [searchMode, setSearchMode] = useState("products");

  const {
    location,
    isUsingFallback,
    permissionStatus,
    isLocating,
    locationError,
    requestLocation,
  } = useUserLocation();

  const selectedStoreId = useDiscoveryStore(
    (state) => state.selectedStoreId
  );
  const searchTerm = useDiscoveryStore((state) => state.searchTerm);
  const viewMode = useDiscoveryStore((state) => state.viewMode);
  const filters = useDiscoveryStore((state) => state.filters);
  const routeMode = useDiscoveryStore((state) => state.routeMode);
  const routeRequested = useDiscoveryStore(
    (state) => state.routeRequested
  );

  const selectStore = useDiscoveryStore((state) => state.selectStore);
  const clearSelectedStore = useDiscoveryStore(
    (state) => state.clearSelectedStore
  );
  const setSearchTerm = useDiscoveryStore((state) => state.setSearchTerm);
  const setViewMode = useDiscoveryStore((state) => state.setViewMode);
  const updateFilter = useDiscoveryStore((state) => state.updateFilter);
  const resetFilters = useDiscoveryStore((state) => state.resetFilters);
  const setRouteMode = useDiscoveryStore((state) => state.setRouteMode);
  const requestRoute = useDiscoveryStore((state) => state.requestRoute);
  const clearRoute = useDiscoveryStore((state) => state.clearRoute);

  const { stores, isLoading, error, reload } = useNearbyStores({
    location,
    filters,
    searchTerm,
  });

  const { storeGroups, mapStores: productMapStores } =
    useDemoProductSearch(searchTerm);

  const visibleMapStores =
    searchMode === "products" ? productMapStores : stores;
  

  const selectedStore = useMemo(
    () =>
      visibleMapStores.find(
        (store) => String(store.id) === String(selectedStoreId)
      ) ?? null,
    [visibleMapStores, selectedStoreId]
  );

  // const selectedStore = useMemo(
  //   () => stores.find((store) => store.id === selectedStoreId) ?? null,
  //   [stores, selectedStoreId]
  // );



  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchTerm("");
    }
  }, [searchTerm, setSearchTerm]);

  useEffect(() => {
    if (selectedStoreId && !isLoading && !selectedStore) {
      clearSelectedStore();
    }
  }, [
    selectedStoreId,
    selectedStore,
    isLoading,
    clearSelectedStore,
  ]);

  const handleSelectStore = (storeId) => {
    selectStore(storeId);

    if (window.matchMedia("(max-width: 767px)").matches) {
      setViewMode("map");
    }

    requestAnimationFrame(() => {
      document.getElementById("map-workspace")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };


  const handleRequestRoute = () => {
    requestRoute();

    requestAnimationFrame(() => {
      document.getElementById("map-workspace")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const handleViewStore = (store) => {
    navigate(`/stores/${store.slug}`);
  };

  const listVisibility =
    viewMode === "list" ? "block" : "hidden md:block";
  const mapVisibility =
    viewMode === "map" ? "block" : "hidden md:block";

  return (
    <div className="bg-white">
      <MapToolbar
        location={location}
        isUsingFallback={isUsingFallback}
        isLocating={isLocating}
        searchTerm={searchTerm}
        filters={filters}
        viewMode={viewMode}
        isFiltersOpen={isFiltersOpen}
        onRequestLocation={requestLocation}
        onSearchTermChange={setSearchTerm}
        onUpdateFilter={updateFilter}
        onResetFilters={resetFilters}
        onViewModeChange={setViewMode}
        onToggleFilters={() => setIsFiltersOpen((current) => !current)}
        onCloseFilters={() => setIsFiltersOpen(false)}
      />

      <DiscoveryModeTabs
        value={searchMode}
        onChange={(mode) => {
          setSearchMode(mode);
          clearSelectedStore();
          clearRoute();
        }}
      />

      {showLocationNotice && (isUsingFallback || locationError) && (
        <div className="shrink-0">
          <LocationPermissionPrompt
            permissionStatus={permissionStatus}
            locationError={locationError}
            isUsingFallback={isUsingFallback}
            onRequestLocation={requestLocation}
            onDismiss={() => setShowLocationNotice(false)}
          />
        </div>
      )}

      <main
      id ="map-workspace" 
      // className="grid h-[calc(100dvh_-_2rem)] min-h-0 overflow-hidden md:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[380px_minmax(0,1fr)]">
      className="grid h-[calc(100dvh_-_2rem)] min-h-0 shrink-0 overflow-hidden md:grid-cols-2"> 
        <div className={`${listVisibility} h-full min-h-0 min-w-0 overflow-hidden`}>
          {searchMode === "products" ? (
            <ProductSearchResultsList
              query={searchTerm}
              storeGroups={storeGroups}
              selectedStoreId={selectedStoreId}
              onSelectStore={handleSelectStore}
              onViewMatches={(group) =>
                navigate(
                  `/stores/${group.store.slug}?search=${encodeURIComponent(searchTerm)}`
                )
              }
              onVisitStore={(store) => navigate(`/stores/${store.slug}`)}
              onViewProduct={(group, product) =>
                navigate(`/stores/${group.store.slug}/products/${product.slug}`)
              }
            />
          ) : (
            <NearbyStoreList
              stores={visibleMapStores}
              selectedStoreId={selectedStoreId}
              isLoading={isLoading}
              error={error}
              locationLabel={location.label}
              radiusKm={filters.radiusKm}
              onSelectStore={handleSelectStore}
              onRetry={reload}
            />
          )}
        </div>

        <div className={`${mapVisibility} h-full min-h-0 min-w-0 overflow-hidden`}>
          <MarketMap
            stores={visibleMapStores}
            selectedStore={selectedStore}
            userLocation={location}
            routeMode={routeMode}
            routeRequested={routeRequested}
            onStoreSelect={handleSelectStore}
            onCloseSelectedStore={clearSelectedStore}
            onRequestRoute={requestRoute}
            onClearRoute={clearRoute}
            onRouteModeChange={setRouteMode}
            onViewStore={handleViewStore}
          />
        </div>
      </main>
    </div>
  );
}

