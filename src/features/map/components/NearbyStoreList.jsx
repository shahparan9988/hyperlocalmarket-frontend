import { MapPinOff, RefreshCw, Store } from "lucide-react";
import StoreCard from "../../stores/components/StoreCard";

function StoreListSkeleton() {
  return (
    <div className="space-y-3" aria-label="Loading nearby stores">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-32 animate-pulse rounded-2xl bg-stone-100"
        />
      ))}
    </div>
  );
}

export default function NearbyStoreList({
  stores,
  selectedStoreId,
  isLoading,
  error,
  locationLabel,
  radiusKm,
  onSelectStore,
  onRetry,
}) {
  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden border-r border-stone-200 bg-white">
      <div className="shrink-0 border-b border-stone-200 px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-stone-500">
              Within {radiusKm} km of {locationLabel}
            </p>
            <h1 className="mt-1 text-xl font-bold text-stone-900">
              Stores near you
            </h1>
          </div>
          {!isLoading && !error && (
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              {stores.length}
            </span>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-scroll overscroll-contain p-3 sm:p-4 [scrollbar-gutter:stable]">
        {isLoading && <StoreListSkeleton />}

        {!isLoading && error && (
          <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
            <MapPinOff className="h-9 w-9 text-red-500" />
            <h2 className="mt-3 text-sm font-semibold text-stone-900">
              Could not load nearby stores
            </h2>
            <p className="mt-1 text-xs leading-5 text-stone-600">{error}</p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-stone-300 px-3 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </div>
        )}

        {!isLoading && !error && stores.length === 0 && (
          <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
            <Store className="h-9 w-9 text-stone-400" />
            <h2 className="mt-3 text-sm font-semibold text-stone-900">
              No stores match these filters
            </h2>
            <p className="mt-1 text-xs leading-5 text-stone-600">
              Increase the distance or remove a filter to see more stores.
            </p>
          </div>
        )}

        {!isLoading && !error && stores.length > 0 && (
          <div className="space-y-3">
            {stores.map((store) => (
              <StoreCard
                key={store.id}
                store={store}
                isSelected={store.id === selectedStoreId}
                onSelect={onSelectStore}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

