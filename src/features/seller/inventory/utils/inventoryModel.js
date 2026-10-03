import { productError } from "../../products/utils/productModel";

export const PAGE_SIZES = [20, 50, 100];
export const MAX_PAGE = 1000000;
export const STOCK_FILTERS = [
  { value: "", label: "All items", key: "all", tone: "neutral" },
  { value: "InStock", label: "In stock", key: "inStock", tone: "green" },
  { value: "LowStock", label: "Low stock", key: "lowStock", tone: "amber" },
  { value: "OutOfStock", label: "Out of stock", key: "outOfStock", tone: "red" },
  { value: "BackorderAvailable", label: "Backorder available", key: "backorderAvailable", tone: "blue" },
  { value: "TrackingOff", label: "Tracking off", key: "trackingOff", tone: "neutral" },
  { value: "NeedsReview", label: "Needs review", key: "needsReview", tone: "red" },
];

const quantities = new Intl.NumberFormat("en", { maximumFractionDigits: 3 });

export function formatQuantity(value) {
  return value == null ? "—" : quantities.format(value);
}

export function stockLabel(value) {
  return STOCK_FILTERS.find((option) => option.value === value) ?? {
    label: "Unknown status", tone: "neutral",
  };
}

export function readInventoryFilters(params) {
  const page = Number(params.get("page"));
  const pageSize = Number(params.get("pageSize"));
  const status = params.get("stockStatus") || "";
  const tracking = params.get("trackInventory") || "";

  return {
    search: (params.get("search") || "").trim().slice(0, 150),
    categoryId: (params.get("categoryId") || "").trim(),
    trackInventory: ["true", "false"].includes(tracking) ? tracking : "",
    stockStatus: STOCK_FILTERS.some((item) => item.value === status) ? status : "",
    includeArchived: params.get("includeArchived") !== "false",
    page: Number.isInteger(page) && page >= 1 && page <= MAX_PAGE ? page : 1,
    pageSize: PAGE_SIZES.includes(pageSize) ? pageSize : 20,
  };
}

export function toInventoryParams(filters) {
  return {
    search: filters.search || undefined,
    categoryId: filters.categoryId || undefined,
    trackInventory: filters.trackInventory === "" ? undefined : filters.trackInventory === "true",
    stockStatus: filters.stockStatus || undefined,
    includeArchived: filters.includeArchived,
    page: filters.page,
    pageSize: filters.pageSize,
  };
}

export function hasInventoryFilters(filters) {
  return Boolean(filters.search || filters.categoryId || filters.stockStatus ||
    filters.trackInventory !== "" || !filters.includeArchived);
}

export function inventoryError(error) {
  const status = error?.response?.status;
  if (status === 401) return "Your session has expired. Sign in again to view inventory.";
  if (status === 403 || status === 404) return "This store is unavailable or you do not have access to it.";
  if (status >= 500) return "Inventory could not be loaded. Please try again.";
  return productError(error);
}
