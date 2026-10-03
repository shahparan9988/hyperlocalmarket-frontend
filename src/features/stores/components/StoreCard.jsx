import {
  Clock3,
  MapPin,
  ShoppingBag,
  Star,
  Store,
  Truck,
} from "lucide-react";

export default function StoreCard({ store, isSelected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(store.id)}
      aria-pressed={isSelected}
      className={`w-full rounded-2xl border p-3 text-left transition sm:p-4 ${
        isSelected
          ? "border-emerald-700 bg-emerald-50 shadow-sm ring-1 ring-emerald-700"
          : "border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm"
      }`}
    >
      <div className="flex gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-emerald-100 text-emerald-700">
          {store.logoUrl ? (
            <img
              src={store.logoUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <Store className="h-6 w-6" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-stone-900">
                {store.name}
              </div>
              <div className="mt-0.5 text-xs text-stone-600">
                {store.businessType}
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-stone-100 px-2 py-1 text-xs font-medium text-stone-700">
              {store.distanceText}
            </span>
          </div>

          <div className="mt-2 flex items-center gap-1 text-xs text-stone-500">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{store.address}</span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span className="flex items-center gap-1 font-medium text-stone-700">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {store.rating > 0 ? store.rating.toFixed(1) : "New"}
            </span>
            <span
              className={`flex items-center gap-1 font-medium ${
                store.isOpen ? "text-emerald-700" : "text-stone-500"
              }`}
            >
              <Clock3 className="h-3.5 w-3.5" />
              {store.isOpen ? "Open" : "Closed"}
            </span>
            {store.isDeliveryAvailable && (
              <span className="flex items-center gap-1 text-stone-600">
                <Truck className="h-3.5 w-3.5" />
                Delivery
              </span>
            )}
            {store.isPickupAvailable && (
              <span className="flex items-center gap-1 text-stone-600">
                <ShoppingBag className="h-3.5 w-3.5" />
                Pickup
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

