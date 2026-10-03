import { List, Map } from "lucide-react";

export default function MapListToggle({ viewMode, onChange }) {
  return (
    <div className="flex rounded-xl border border-stone-200 bg-white p-1">
      <button
        type="button"
        onClick={() => onChange("list")}
        aria-pressed={viewMode === "list"}
        className={`flex h-9 flex-1 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium sm:flex-none ${
          viewMode === "list"
            ? "bg-emerald-700 text-white"
            : "text-stone-600 hover:bg-stone-100"
        }`}
      >
        <List className="h-4 w-4" />
        List
      </button>
      <button
        type="button"
        onClick={() => onChange("map")}
        aria-pressed={viewMode === "map"}
        className={`flex h-9 flex-1 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium sm:flex-none ${
          viewMode === "map"
            ? "bg-emerald-700 text-white"
            : "text-stone-600 hover:bg-stone-100"
        }`}
      >
        <Map className="h-4 w-4" />
        Map
      </button>
    </div>
  );
}

