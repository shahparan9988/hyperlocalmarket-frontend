import { PackageSearch } from "lucide-react";
import StoreProductGroupCard from "./StoreProductGroupCard";

export default function ProductSearchResultsList({
  query,
  storeGroups,
  selectedStoreId,
  onSelectStore,
  onViewMatches,
  onVisitStore,
  onViewProduct,
}) {
  return (
    <aside className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden border-r border-stone-200 bg-white">
      <div className="shrink-0 border-b border-stone-200 px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-stone-500">Grouped by nearby store</p>
            <h1 className="mt-1 text-xl font-bold text-stone-900">
              {query || "Products"} near you
            </h1>
          </div>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            {storeGroups.length} stores
          </span>
        </div>
      </div>

      <div className="hlm-results-scroll min-h-0 flex-1 overflow-y-scroll overscroll-y-contain p-3 [scrollbar-gutter:stable] sm:p-4">
        {storeGroups.length === 0 ? (
          <div className="grid min-h-64 place-items-center px-6 text-center">
            <div>
              <PackageSearch className="mx-auto h-9 w-9 text-stone-400" />
              <h2 className="mt-3 text-sm font-semibold text-stone-900">
                No matching products
              </h2>
              <p className="mt-1 text-xs leading-5 text-stone-600">
                Try another product name, brand, or model.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {storeGroups.map((group) => (
              <StoreProductGroupCard
                key={group.store.id}
                group={group}
                isSelected={group.store.id === String(selectedStoreId)}
                onSelectStore={onSelectStore}
                onViewMatches={onViewMatches}
                onVisitStore={onVisitStore}
                onViewProduct={onViewProduct}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

