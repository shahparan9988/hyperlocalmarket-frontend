// These limits mirror Product.MaximumOptionCount and ProductOptionSet in the API.
export const MAX_OPTIONS = 10;
export const MAX_COMBINATIONS = 1000;
export const MAX_VALUES_PER_OPTION = MAX_COMBINATIONS;
export const MAX_VARIANT_NAME = 500;
export const newId = () => crypto.randomUUID();
export const newVariant = (name = "Standard", selections = []) => ({
  id: newId(), name, selections, isOffered: true, sku: "", price: "", compareAtPrice: "",
  inventory: { onHandQuantity: "0", reservedQuantity: 0, version: null },
});
export const newOption = (name = "") => ({ id: newId(), name, values: [] });
export const offeredVariants = (product) => product.variants.filter((v) => v.isOffered !== false);

export function selectionKey(selections = []) {
  return JSON.stringify(selections.map((s) => [s.optionId, s.valueId]).sort((a, b) => a[0].localeCompare(b[0])));
}

// Labels and display order can change without creating new variant identities.
export function optionShape(options) {
  return JSON.stringify(options.map((o) => [o.id, o.values.map((v) => v.id).sort()])
    .sort((a, b) => a[0].localeCompare(b[0])));
}

export function variantName(options, selections = [], fallback = "Standard") {
  if (!options.length) return fallback;
  const parts = options.map((o) => o.values.find((v) =>
    v.id === selections.find((s) => s.optionId === o.id)?.valueId)?.value.trim());
  return parts.every(Boolean) ? parts.join(" / ") : fallback;
}

export function combinationCount(options) {
  if (!options.length) return 1;
  let count = 1;
  for (const option of options) {
    count *= option.values.length;
    if (count > MAX_COMBINATIONS) return MAX_COMBINATIONS + 1;
  }
  return count;
}

export function validateOptions(options) {
  const errors = {};
  if (options.length > MAX_OPTIONS) errors.options = `Use up to ${MAX_OPTIONS} options.`;
  const names = new Set();
  const optionIds = new Set();
  const valueIds = new Set();
  for (const option of options) {
    const key = `option-${option.id}`;
    const name = option.name.trim().toLowerCase();
    if (!name || name.length > 50 || names.has(name)) errors[key] = "Use a unique option name of 1–50 characters.";
    names.add(name);
    if (optionIds.has(option.id)) errors[key] = "Option IDs must be unique.";
    optionIds.add(option.id);
    if (!option.values.length || option.values.length > MAX_VALUES_PER_OPTION)
      errors[key] = `Add 1–${MAX_VALUES_PER_OPTION} values.`;
    const texts = new Set();
    for (const value of option.values) {
      const text = value.value.trim().toLowerCase();
      if (!text || text.length > 100 || texts.has(text)) errors[key] = "Use unique values of 1–100 characters within this option.";
      texts.add(text);
      if (valueIds.has(value.id)) errors[key] = "Value IDs must be unique.";
      valueIds.add(value.id);
    }
  }
  if (combinationCount(options) > MAX_COMBINATIONS)
    errors.options = `These options exceed ${MAX_COMBINATIONS.toLocaleString()} combinations. Remove some values.`;
  return errors;
}

export function hasStock(variant) {
  return Number(variant.savedOnHandQuantity || 0) > 0 || Number(variant.inventory?.onHandQuantity || 0) > 0 || Number(variant.inventory?.reservedQuantity || 0) > 0;
}

export function generateVariants(options, previous) {
  const errors = validateOptions(options);
  if (Object.keys(errors).length) throw new Error(Object.values(errors)[0]);
  let combinations = [[]];
  for (const option of options)
    combinations = combinations.flatMap((selection) => option.values.map((value) =>
      [...selection, { optionId: option.id, valueId: value.id }]));

  const existing = new Map(previous.map((variant) => [selectionKey(variant.selections), variant]));
  const next = combinations.map((selections) => {
    const old = existing.get(selectionKey(selections));
    const name = variantName(options, selections);
    if (name.length > MAX_VARIANT_NAME) throw new Error(`A combination name cannot exceed ${MAX_VARIANT_NAME} characters.`);
    // Preserve IDs, prices, SKU, Offer, and all inventory/version fields for matching combinations.
    return old ? { ...old, name, selections } : newVariant(name, selections);
  });
  const keptIds = new Set(next.map((v) => v.id));
  const removedWithStock = previous.find((v) => !keptIds.has(v.id) && hasStock(v));
  if (removedWithStock)
    throw new Error(`"${removedWithStock.name}" still has stock. Keep its option values and uncheck Offer, or adjust its stock before generating different combinations.`);
  return next;
}

// Convert products from the previous flat editor in memory. Persist on the next save.
// Each old variant retains its ID, price, SKU and inventory. No database backfill is needed.
export function normalizeVariantEditor(product) {
  let options = structuredClone(product.options || []);
  let variants = product.variants.map((v) => ({
    ...v, savedOnHandQuantity: Number(v.inventory?.onHandQuantity || 0), selections: structuredClone(v.selections || []), isOffered: v.isOffered !== false,
    price: v.price ?? "", compareAtPrice: v.compareAtPrice ?? "", sku: v.sku ?? "",
    inventory: { onHandQuantity: "0", reservedQuantity: 0, version: null, ...v.inventory },
  }));
  if (!options.length && (product.variantOptionName || variants.length > 1)) {
    if (variants.some((v) => v.selections.length))
      throw new Error("This product has saved selections but no available option definitions. Reload it after the options API is deployed.");
    const optionId = product.id || newId();
    options = [{ id: optionId, name: product.variantOptionName || "Option", values: variants.map((v) => ({ id: v.id, value: v.name })) }];
    variants = variants.map((v) => ({ ...v, selections: [{ optionId, valueId: v.id }] }));
  }
  return { options, variants, hasVariants: options.length > 0, generatedOptionShape: optionShape(options) };
}
