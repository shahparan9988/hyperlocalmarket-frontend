import { Beef, Fish, Pill, Store } from "lucide-react";

function getIcon(iconType) {
  switch (iconType) {
    case "fish":
      return Fish;
    case "beef":
      return Beef;
    case "pill":
      return Pill;
    default:
      return Store;
  }
}

function getMarkerColor(markerColor) {
  switch (markerColor) {
    case "teal":
      return "bg-teal-600";
    case "rose":
      return "bg-rose-500";
    case "cyan":
      return "bg-cyan-600";
    default:
      return "bg-emerald-600";
  }
}

export default function MapStorePopup({ store, isSelected, onSelect }) {
  const Icon = getIcon(store.iconType);
  const markerColor = getMarkerColor(store.markerColor);

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: store.mapX, top: store.mapY }}
    >
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={onSelect}
          className={`rounded-full border-4 border-white p-2.5 text-white shadow-lg transition hover:scale-105 ${markerColor} ${
            isSelected ? "ring-4 ring-white/70" : ""
          }`}
        >
          <Store className="h-5 w-5" />
        </button>

        {isSelected && (
          <div className="min-w-[180px] max-w-[220px] rounded-2xl border border-stone-200 bg-white px-3 py-3 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-emerald-700">
                <Icon className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-stone-800">
                  {store.name}
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-stone-600">
                  <div className="text-amber-400">★★★★★</div>
                  <span className="font-medium">{store.rating}</span>
                </div>
                <div className="mt-1 text-xs text-stone-500">
                  {store.distance} away
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}