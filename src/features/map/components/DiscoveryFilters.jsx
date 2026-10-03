import { RotateCcw, X } from "lucide-react";
import {
  DISTANCE_OPTIONS_KM,
  STORE_CATEGORIES,
} from "../constants/discoveryDefaults";

export default function DiscoveryFilters({
  filters,
  onUpdateFilter,
  onReset,
  onClose,
}) {
  return (
    <section className="border-b border-stone-200 bg-stone-50 px-4 py-4">
      <div className="mx-auto flex max-w-[1460px] flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-stone-900">
              Discovery filters
            </h2>
            <p className="mt-0.5 text-xs text-stone-500">
              Results update automatically when a filter changes.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-stone-500 hover:bg-stone-200"
            aria-label="Close filters"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_170px_auto] lg:items-end">
          <label className="grid gap-1.5 text-xs font-medium text-stone-700">
            Business type
            <select
              value={filters.category}
              onChange={(event) =>
                onUpdateFilter("category", event.target.value)
              }
              className="h-11 rounded-xl border border-stone-300 bg-white px-3 text-sm outline-none focus:border-emerald-700"
            >
              {STORE_CATEGORIES.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5 text-xs font-medium text-stone-700">
            Distance
            <select
              value={filters.radiusKm}
              onChange={(event) =>
                onUpdateFilter("radiusKm", Number(event.target.value))
              }
              className="h-11 rounded-xl border border-stone-300 bg-white px-3 text-sm outline-none focus:border-emerald-700"
            >
              {DISTANCE_OPTIONS_KM.map((distance) => (
                <option key={distance} value={distance}>
                  Within {distance} km
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-wrap gap-x-5 gap-y-3 sm:col-span-2 lg:col-span-1 lg:pb-2.5">
            <label className="flex items-center gap-2 text-sm text-stone-700">
              <input
                type="checkbox"
                checked={filters.openNow}
                onChange={(event) =>
                  onUpdateFilter("openNow", event.target.checked)
                }
                className="h-4 w-4 accent-emerald-700"
              />
              Open now
            </label>
            <label className="flex items-center gap-2 text-sm text-stone-700">
              <input
                type="checkbox"
                checked={filters.deliveryAvailable}
                onChange={(event) =>
                  onUpdateFilter(
                    "deliveryAvailable",
                    event.target.checked
                  )
                }
                className="h-4 w-4 accent-emerald-700"
              />
              Delivery
            </label>
            <label className="flex items-center gap-2 text-sm text-stone-700">
              <input
                type="checkbox"
                checked={filters.pickupAvailable}
                onChange={(event) =>
                  onUpdateFilter("pickupAvailable", event.target.checked)
                }
                className="h-4 w-4 accent-emerald-700"
              />
              Pickup
            </label>
          </div>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex w-fit items-center gap-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset filters
        </button>
      </div>
    </section>
  );
}

