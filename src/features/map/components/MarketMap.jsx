import { LocateFixed, MapPinned } from "lucide-react";
import { useMarketMap } from "../hooks/useMarketMap";
import RouteControls from "./RouteControls";
import SelectedStorePanel from "./SelectedStorePanel";

export default function MarketMap({
  stores,
  selectedStore,
  userLocation,
  routeMode,
  routeRequested,
  onStoreSelect,
  onCloseSelectedStore,
  onRequestRoute,
  onClearRoute,
  onRouteModeChange,
  onViewStore,
}) {
  const {
    mapContainerRef,
    isMapReady,
    mapError,
    routeInfo,
    routeError,
    isRouteLoading,
    recenterOnUser,
  } = useMarketMap({
    stores,
    selectedStore,
    userLocation,
    routeMode,
    routeRequested,
    onStoreSelect,
  });

  return (
    <section className="relative h-full min-h-0 overflow-hidden bg-white">
      <div ref={mapContainerRef} className="absolute inset-0 h-full w-full" />

      {!isMapReady && !mapError && (
        <div className="absolute inset-0 grid place-items-center bg-stone-100">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-700" />
            <p className="mt-3 text-sm text-stone-600">Loading map...</p>
          </div>
        </div>
      )}

      {mapError && (
        <div className="absolute inset-0 grid place-items-center bg-stone-100 p-6">
          <div className="max-w-md text-center">
            <MapPinned className="mx-auto h-10 w-10 text-red-500" />
            <h2 className="mt-3 text-base font-semibold text-stone-900">
              The map could not be displayed
            </h2>
            <p className="mt-1 text-sm leading-6 text-stone-600">{mapError}</p>
          </div>
        </div>
      )}

      {isMapReady && routeRequested && (
        <RouteControls
          routeMode={routeMode}
          routeInfo={routeInfo}
          routeError={routeError}
          isLoading={isRouteLoading}
          onRouteModeChange={onRouteModeChange}
          onClear={onClearRoute}
        />
      )}

      {isMapReady && (
        <button
          type="button"
          onClick={recenterOnUser}
          className="absolute bottom-4 right-4 z-10 inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 shadow-lg hover:bg-stone-50"
        >
          <LocateFixed className="h-4 w-4 text-emerald-700" />
          My location
        </button>
      )}

      {isMapReady && selectedStore && (
        <SelectedStorePanel
          store={selectedStore}
          routeRequested={routeRequested}
          onRequestRoute={onRequestRoute}
          onClearRoute={onClearRoute}
          onViewStore={onViewStore}
          onClose={onCloseSelectedStore}
        />
      )}
    </section>
  );
}
