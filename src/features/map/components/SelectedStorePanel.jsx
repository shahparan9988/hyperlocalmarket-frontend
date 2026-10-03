import {
  Clock3,
  MapPin,
  Navigation,
  ShoppingBag,
  Star,
  Store,
  Truck,
  X,
} from "lucide-react";

export default function SelectedStorePanel({
  store,
  routeRequested,
  onRequestRoute,
  onClearRoute,
  onViewStore,
  onClose,
}) {
  if (!store) return null;

  return (
    <article className="absolute bottom-4 left-4 right-4 z-10 max-w-sm rounded-2xl border border-stone-200 bg-white/95 p-4 shadow-xl backdrop-blur sm:right-auto">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-2 top-2 rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
        aria-label="Close selected store"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex gap-3 pr-8">
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
        <div className="min-w-0">
          <h2 className="truncate text-base font-bold text-stone-900">
            {store.name}
          </h2>
          <p className="mt-0.5 text-xs text-stone-600">
            {store.businessType} · {store.distanceText}
          </p>
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
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-start gap-2 text-xs text-stone-600">
        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>{store.address}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs text-stone-600">
        {store.isDeliveryAvailable && (
          <span className="flex items-center gap-1 rounded-lg bg-stone-100 px-2 py-1">
            <Truck className="h-3.5 w-3.5" />
            Delivery
            {store.deliveryFee != null && ` ৳${store.deliveryFee}`}
          </span>
        )}
        {store.isPickupAvailable && (
          <span className="flex items-center gap-1 rounded-lg bg-stone-100 px-2 py-1">
            <ShoppingBag className="h-3.5 w-3.5" />
            Pickup
          </span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onViewStore(store)}
          className="rounded-xl border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50"
        >
          View store
        </button>
        <button
          type="button"
          onClick={routeRequested ? onClearRoute : onRequestRoute}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
        >
          <Navigation className="h-3.5 w-3.5" />
          {routeRequested ? "Clear route" : "Directions"}
        </button>
      </div>
    </article>
  );
}

