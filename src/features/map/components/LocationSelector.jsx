import { LocateFixed, LoaderCircle, MapPin } from "lucide-react";

export default function LocationSelector({
  location,
  isUsingFallback,
  isLocating,
  onRequestLocation,
}) {
  return (
    <button
      type="button"
      onClick={onRequestLocation}
      disabled={isLocating}
      className="flex h-11 min-w-0 items-center gap-2 rounded-xl px-3 text-left text-sm font-medium text-stone-700 hover:bg-stone-100 disabled:cursor-wait disabled:opacity-70"
      aria-label={
        isUsingFallback
          ? "Using Dhaka. Use my current location"
          : `Using ${location.label}`
      }
    >
      {isLocating ? (
        <LoaderCircle className="h-4 w-4 shrink-0 animate-spin text-emerald-700" />
      ) : isUsingFallback ? (
        <MapPin className="h-4 w-4 shrink-0 text-emerald-700" />
      ) : (
        <LocateFixed className="h-4 w-4 shrink-0 text-emerald-700" />
      )}
      <span className="max-w-28 truncate">
        {isLocating ? "Locating..." : location.label}
      </span>
      {isUsingFallback && (
        <span className="hidden text-xs text-stone-400 xl:inline">
          Use my location
        </span>
      )}
    </button>
  );
}

