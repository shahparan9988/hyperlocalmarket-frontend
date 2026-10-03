import { RefreshCw, Search } from "lucide-react";
import { formatQuantity, hasInventoryFilters, STOCK_FILTERS } from "../utils/inventoryModel";

const primaryKeys = ["all", "lowStock", "outOfStock", "trackingOff"];
const primaryStatuses = STOCK_FILTERS.filter((item) => primaryKeys.includes(item.key));
const extraStatuses = STOCK_FILTERS.filter((item) => !primaryKeys.includes(item.key));

export default function InventoryFilters({
  filters, categories, categoriesLoading, categoriesError, summary,
  onChange, onReset, onRefresh, refreshing,
}) {
  const missingCategory = filters.categoryId &&
    !categories.some((item) => item.id === filters.categoryId);
  const extraStatus = extraStatuses.some((item) => item.value === filters.stockStatus)
    ? filters.stockStatus : "";

  return (
    <div className="hlmi-filters">
      <div className="hlmi-filter-toolbar">
        <form className="hlmi-search" role="search" onSubmit={(event) => {
          event.preventDefault();
          const search = new FormData(event.currentTarget).get("search");
          onChange("search", String(search || "").trim());
        }}>
          <label className="hlmi-sr-only" htmlFor="hlmi-search">Search inventory</label>
          <div className="hlmi-search-control">
            <button type="submit" className="hlmi-search-submit" aria-label="Search inventory">
              <Search size={18} aria-hidden="true" />
            </button>
            <input id="hlmi-search" name="search" type="search" key={filters.search}
              defaultValue={filters.search} maxLength={150}
              aria-describedby="hlmi-search-help"
              placeholder="Search products, variants or SKU" />
          </div>
          <span id="hlmi-search-help" className="hlmi-sr-only">
            Press Enter or select the search icon to apply your search.
          </span>
        </form>

        <label className="hlmi-category-filter">
          <span className="hlmi-sr-only">Store category</span>
          <select className="hlmi-control" value={filters.categoryId}
            disabled={categoriesLoading || Boolean(categoriesError)}
            title="Selecting a category includes all its subcategories"
            onChange={(event) => onChange("categoryId", event.target.value)}>
            <option value="">{categoriesLoading ? "Loading categories…" : "All categories"}</option>
            {missingCategory && <option value={filters.categoryId}>Selected category (unavailable)</option>}
            {categories.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </label>

        <label className="hlmi-tracking-filter">
          <span className="hlmi-sr-only">Stock tracking</span>
          <select className="hlmi-control" value={filters.trackInventory}
            onChange={(event) => onChange("trackInventory", event.target.value)}>
            <option value="">Tracking: All</option>
            <option value="true">Tracking: On</option>
            <option value="false">Tracking: Off</option>
          </select>
        </label>

        <div className="hlmi-status-filters" role="group" aria-label="Filter by stock status">
          {primaryStatuses.map((option) => (
            <button type="button" key={option.key}
              aria-pressed={filters.stockStatus === option.value}
              className={`hlmi-status-filter is-${option.tone}${filters.stockStatus === option.value ? " is-selected" : ""}`}
              onClick={() => onChange("stockStatus", option.value)}>
              {option.key === "all" ? "All" : option.label}
              <span>{formatQuantity(summary?.[option.key])}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="hlmi-filter-extras">
        <div className="hlmi-actions">
          <label className="hlmi-checkbox-label">
            <input className="hlmi-checkbox" type="checkbox" checked={filters.includeArchived}
              onChange={(event) => onChange("includeArchived", String(event.target.checked))} />
            Include archived
          </label>
          <label>
            <span className="hlmi-sr-only">Additional stock statuses</span>
            <select className="hlmi-control hlmi-extra-status" value={extraStatus}
              onChange={(event) => onChange("stockStatus", event.target.value)}>
              <option value="">More statuses</option>
              {extraStatuses.map((option) => <option key={option.key} value={option.value}>
                {option.label} ({formatQuantity(summary?.[option.key])})
              </option>)}
            </select>
          </label>
        </div>
        <div className="hlmi-actions">
          <button type="button" className="hlmi-text-button"
            disabled={!hasInventoryFilters(filters)} onClick={onReset}>Clear filters</button>
          <button type="button" className="hlmi-icon-button" aria-label="Refresh inventory"
            title="Refresh inventory" disabled={refreshing} onClick={onRefresh}>
            <RefreshCw size={15} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
