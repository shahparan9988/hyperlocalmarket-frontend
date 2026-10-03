import { Search, SlidersHorizontal, X } from "lucide-react";
import DiscoveryFilters from "./DiscoveryFilters";
import LocationSelector from "./LocationSelector";
import MapListToggle from "./MapListToggle";

export default function MapToolbar({
  location,
  isUsingFallback,
  isLocating,
  searchTerm,
  filters,
  viewMode,
  isFiltersOpen,
  onRequestLocation,
  onSearchTermChange,
  onUpdateFilter,
  onResetFilters,
  onViewModeChange,
  onToggleFilters,
  onCloseFilters,
}) {
  const activeFilterCount = [
    filters.category !== "All categories",
    filters.openNow,
    filters.deliveryAvailable,
    filters.pickupAvailable,
  ].filter(Boolean).length;

  return (
    <>
      <div className="border-b border-stone-200 bg-white px-3 py-3 sm:px-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-2 rounded-2xl border border-stone-200 bg-white p-1.5 shadow-sm sm:flex-row sm:items-center">
            <LocationSelector
              location={location}
              isUsingFallback={isUsingFallback}
              isLocating={isLocating}
              onRequestLocation={onRequestLocation}
            />

            <div className="hidden h-7 w-px bg-stone-200 sm:block" />

            <label className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                value={searchTerm}
                onChange={(event) => onSearchTermChange(event.target.value)}
                className="h-11 w-full rounded-xl border-0 bg-transparent pl-9 pr-10 text-sm text-stone-800 outline-none placeholder:text-stone-400"
                placeholder="Search nearby stores or business types"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => onSearchTermChange("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-stone-400 hover:bg-stone-100"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </label>

            <button
              type="button"
              onClick={onToggleFilters}
              aria-expanded={isFiltersOpen}
              className={`flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-semibold ${
                isFiltersOpen || activeFilterCount > 0
                  ? "border-emerald-700 bg-emerald-50 text-emerald-800"
                  : "border-stone-200 text-stone-700 hover:bg-stone-50"
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-700 px-1 text-[11px] text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          <MapListToggle
            viewMode={viewMode}
            onChange={onViewModeChange}
          />
        </div>
      </div>

      {isFiltersOpen && (
        <DiscoveryFilters
          filters={filters}
          onUpdateFilter={onUpdateFilter}
          onReset={onResetFilters}
          onClose={onCloseFilters}
        />
      )}
    </>
  );
}

