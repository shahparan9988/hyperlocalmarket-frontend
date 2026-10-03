import { newVariant, normalizeVariantEditor, offeredVariants, optionShape, variantName } from "./variantOptions.js";
export { newId, newVariant } from "./variantOptions.js";

export function newProduct(currencyCode = "BDT") {
  return {
    id: null, version: null, name: "", description: "", type: "Product",
    status: "Draft", currencyCode, storeCategoryId: null, marketplaceCategoryId: null,
    trackInventory: false, manualAvailability: "Available", hasVariants: false, variantOptionName: "", options: [], generatedOptionShape: optionShape([]),
    variants: [newVariant()], images: [], isPickupAvailable: false, deliveryOptionIds: [],
  };
}

export function toProductForm(product) {
  return {
    ...structuredClone(product),
    ...normalizeVariantEditor(product),
    images: product.images.map((image) => ({ ...image, localId: image.assetId, status: "Ready" })),
  };
}

const nullable = (value) => value === "" || value == null ? null : Number(value);

export function toProductPayload(form, status) {
  const physical = form.type === "Product";
  const tracked = physical && form.trackInventory;
  return {
    expectedVersion: form.version, name: form.name.trim(), description: form.description.trim(),
    type: form.type, status, currencyCode: form.currencyCode,
    storeCategoryId: form.storeCategoryId || null, marketplaceCategoryId: form.marketplaceCategoryId || null,
    trackInventory: tracked, manualAvailability: form.manualAvailability,
    variantOptionName: form.options.length === 1 ? form.options[0].name.trim() : form.options.length ? "Options" : "",
    options: form.options.map((option) => ({ id: option.id, name: option.name.trim(),
      values: option.values.map((value) => ({ id: value.id, value: value.value.trim() })) })),
    variants: form.variants.map((v) => ({
      id: v.id, name: variantName(form.options, v.selections), sku: v.sku.trim(), price: nullable(v.price),
      isOffered: v.isOffered !== false, selections: v.selections.map((s) => ({ optionId: s.optionId, valueId: s.valueId })),
      compareAtPrice: nullable(v.compareAtPrice),
      // Stock writes have their own version; a details edit cannot silently undo a sale.
      inventory: tracked ? {
        expectedVersion: v.inventory.version,
        onHandQuantity: Number(v.inventory.onHandQuantity),
      } : null,
    })),
    imageAssetIds: form.images.filter((image) => image.status === "Ready").map((image) => image.assetId),
    isPickupAvailable: physical && form.isPickupAvailable,
    deliveryOptionIds: physical ? [...new Set(form.deliveryOptionIds)] : [],
  };
}

export function availableQuantity(product) {
  return offeredVariants(product).reduce((total, v) => total + Math.max(0,
    Number(v.inventory?.onHandQuantity || 0) - Number(v.inventory?.reservedQuantity || 0)), 0);
}

export function money(value, currencyCode = "BDT") {
  return new Intl.NumberFormat("en", { style: "currency", currency: currencyCode, maximumFractionDigits: 2 }).format(value);
}

export function priceLabel(product) {
  const prices = offeredVariants(product).map((v) => v.price).filter((v) => v !== "" && v != null).map(Number).filter(Number.isFinite);
  if (!prices.length) return "Price not set";
  const lowest = Math.min(...prices);
  return `${prices.some((p) => p !== lowest) ? "From " : ""}${money(lowest, product.currencyCode)}`;
}

export function productError(error) {
  if (error?.response?.status === 409) return "This item changed in another session. Your edits are still here. Reload the latest version before trying again.";
  const data = error?.response?.data;
  const details = data?.errors && Object.values(data.errors).flat().filter((value) => typeof value === "string").join(" ");
  return details || data?.detail || data?.message || error?.message || "Something went wrong. Please try again.";
}
