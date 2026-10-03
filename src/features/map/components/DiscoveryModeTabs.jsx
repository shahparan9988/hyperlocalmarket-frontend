import { PackageSearch, Store } from "lucide-react";

export default function DiscoveryModeTabs({ value, onChange }) {
  return (
    <div className="shrink-0 border-b border-stone-200 bg-white px-3 py-2 sm:px-4">
      <div className="inline-flex rounded-xl border border-stone-200 bg-stone-50 p-1">
        <button
          type="button"
          onClick={() => onChange("products")}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition ${
            value === "products"
              ? "bg-emerald-700 text-white shadow-sm"
              : "text-stone-600 hover:bg-white"
          }`}
        >
          <PackageSearch className="h-4 w-4" />
          Products
        </button>
        <button
          type="button"
          onClick={() => onChange("stores")}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition ${
            value === "stores"
              ? "bg-emerald-700 text-white shadow-sm"
              : "text-stone-600 hover:bg-white"
          }`}
        >
          <Store className="h-4 w-4" />
          Stores
        </button>
      </div>
    </div>
  );
}

