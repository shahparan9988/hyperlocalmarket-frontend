import { Info, LocateFixed, MapPinOff, X } from "lucide-react";

export default function LocationPermissionPrompt({
  permissionStatus,
  locationError,
  isUsingFallback,
  onRequestLocation,
  onDismiss,
}) {
  if (!isUsingFallback && !locationError) return null;

  const isDenied = permissionStatus === "denied";

  return (
    <div
      className={`flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${
        isDenied || locationError
          ? "border-amber-200 bg-amber-50"
          : "border-sky-200 bg-sky-50"
      }`}
      role="status"
    >
      <div className="flex min-w-0 items-start gap-3">
        {isDenied ? (
          <MapPinOff className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
        ) : (
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-sky-700" />
        )}
        <div>
          <p className="text-sm font-semibold text-stone-900">
            {isDenied
              ? "Location access is blocked"
              : "Find stores around your actual location"}
          </p>
          <p className="mt-0.5 text-xs leading-5 text-stone-600">
            {locationError ||
              "The page is currently showing demo stores around Dhaka."}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 pl-8 sm:pl-0">
        {!isDenied && (
          <button
            type="button"
            onClick={onRequestLocation}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
          >
            <LocateFixed className="h-4 w-4" />
            Use my location
          </button>
        )}
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-lg p-2 text-stone-500 hover:bg-black/5"
          aria-label="Dismiss location notice"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

