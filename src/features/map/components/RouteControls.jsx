import { LoaderCircle, Navigation, X } from "lucide-react";
import { ROUTE_MODES } from "../constants/discoveryDefaults";

export default function RouteControls({
  routeMode,
  routeInfo,
  routeError,
  isLoading,
  onRouteModeChange,
  onClear,
}) {
  return (
    <section className="absolute left-4 top-4 z-10 max-w-[calc(100%_-_2rem)] rounded-2xl border border-stone-200 bg-white/95 p-3 shadow-xl backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <Navigation className="h-4 w-4 text-emerald-700" />
          <div>
            <h2 className="text-sm font-semibold text-stone-900">Route</h2>
            {isLoading && (
              <span className="mt-0.5 flex items-center gap-1.5 text-xs text-stone-500">
                <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                Finding the best route...
              </span>
            )}
            {!isLoading && routeInfo && (
              <p className="mt-0.5 text-xs text-stone-600">
                {routeInfo.distanceText} · {routeInfo.durationText}
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
          aria-label="Clear route"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {ROUTE_MODES.map((mode) => (
          <button
            key={mode.value}
            type="button"
            onClick={() => onRouteModeChange(mode.value)}
            aria-pressed={routeMode === mode.value}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
              routeMode === mode.value
                ? "bg-emerald-700 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {routeError && (
        <p className="mt-2 max-w-xs text-xs leading-5 text-red-600">
          {routeError}
        </p>
      )}
    </section>
  );
}
