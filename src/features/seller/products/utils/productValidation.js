import { MAX_COMBINATIONS, MAX_VARIANT_NAME, optionShape, selectionKey, validateOptions, variantName } from "./variantOptions.js";

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_IMAGES = 8;
const MONEY = /^\d+(?:\.\d{1,2})?$/;
const QUANTITY = /^\d+(?:\.\d{1,3})?$/;
const blank = (v) => v === "" || v == null;
export const validMoney = (v) => !blank(v) && MONEY.test(String(v)) && Number(v) <= 999999999.99;
export const validQuantity = (v) => !blank(v) && QUANTITY.test(String(v)) && Number(v) <= 999999999;

export function validateProduct(form, status, context) {
  const errors = {};
  if (!form.name.trim() || form.name.trim().length > 150) errors.name = "Enter a name of 1–150 characters.";
  if (form.description.length > 5000) errors.description = "Use no more than 5,000 characters.";
  if (!["Product", "Service"].includes(form.type)) errors.type = "Choose a product or service.";
  if (!["Available", "Unavailable"].includes(form.manualAvailability)) errors.availability = "Choose an availability.";
  if (form.storeCategoryId && !context.storeCategories.some((c) => c.id === form.storeCategoryId)) errors.storeCategoryId = "Choose an existing store category.";
  if (form.marketplaceCategoryId && !context.marketplaceCategories.some((c) => c.id === form.marketplaceCategoryId)) errors.marketplaceCategoryId = "Choose an existing marketplace category.";
  Object.assign(errors, validateOptions(form.options));
  if (form.hasVariants && !form.options.length) errors.options = "Add an option or turn off variants.";
  if (form.generatedOptionShape !== optionShape(form.options)) errors.options = "Generate variants after changing the option values.";
  if (!form.variants.length || form.variants.length > MAX_COMBINATIONS) errors.variants = `Supply 1–${MAX_COMBINATIONS} variants.`;
  if (status === "Published" && !form.variants.some((v) => v.isOffered !== false)) errors.variants = "Offer at least one variant before publishing.";
  const signatures = new Set();
  const skus = new Set();
  form.variants.forEach((v) => {
    const key = `variant-${v.id}`;
    const selections = v.selections || [];
    if (selections.length !== form.options.length || form.options.some((o) =>
      selections.filter((s) => s.optionId === o.id).length !== 1 ||
      !o.values.some((value) => value.id === selections.find((s) => s.optionId === o.id)?.valueId)))
      errors[key] = "Generate a valid combination for every row.";
    const signature = selectionKey(selections);
    if (signatures.has(signature)) errors[key] = "This option combination is repeated.";
    signatures.add(signature);
    if (variantName(form.options, selections, v.name).length > MAX_VARIANT_NAME) errors[key] = `Use a combination name up to ${MAX_VARIANT_NAME} characters.`;
    const sku = v.sku.trim().toLowerCase();
    if (sku && skus.has(sku)) errors[key] = "Each SKU must be unique.";
    if (sku) skus.add(sku);
    if (v.isOffered === false && Number(v.inventory.reservedQuantity) > 0) errors[key] = "Resolve reserved stock before turning off Offer.";
    if (v.sku.length > 100) errors[key] = "SKU cannot exceed 100 characters.";
    if ((!blank(v.price) || (status === "Published" && v.isOffered !== false)) && !validMoney(v.price)) errors[key] = "Enter a price from 0 to 999,999,999.99, with at most two decimals.";
    if (!blank(v.compareAtPrice) && (!validMoney(v.compareAtPrice) || blank(v.price) || Number(v.compareAtPrice) <= Number(v.price))) errors[key] = "The original price must be greater than the selling price.";
    if (form.type === "Product" && form.trackInventory && (!validQuantity(v.inventory.onHandQuantity) || Number(v.inventory.onHandQuantity) < Number(v.inventory.reservedQuantity))) errors[key] = "Stock must be a non-negative number, at least the reserved quantity (up to three decimals).";
  });
  if (form.images.some((image) => image.status !== "Ready")) errors.images = "Wait for photos to finish, or remove unsuccessful uploads.";
  if (form.images.length > MAX_IMAGES) errors.images = `Use up to ${MAX_IMAGES} photos.`;
  if (form.type === "Product") {
    if (form.isPickupAvailable && !context.store.isPickupAvailable) errors.delivery = "Enable pickup in Store setup first, or turn it off here.";
    const active = new Set(context.deliveryOptions.filter((o) => o.isActive).map((o) => o.id));
    if (form.deliveryOptionIds.length && (!context.store.isDeliveryAvailable || form.deliveryOptionIds.some((id) => !active.has(id)))) errors.delivery = "Remove unavailable delivery methods or enable them in Store setup.";
  }
  return errors;
}

export function validatePhoto(file) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return "Choose a JPEG, PNG or WebP image.";
  if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) return "Each photo must be between 1 byte and 10 MB.";
  return null;
}
