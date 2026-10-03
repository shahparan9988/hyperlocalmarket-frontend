import { transactDemo } from "./demoDatabase";
import { createCategoryIndex, descendantIds } from "../utils/categoryTree";
import { newId, newProduct, toProductForm } from "../utils/productModel";
import { validateProduct, validQuantity } from "../utils/productValidation";

function fail(message, status = 400) {
  const error = new Error(message);
  error.response = { status, data: { message } };
  throw error;
}
const matchVersion = (actual, expected) => {
  if (actual !== expected) fail("This record changed in another session.", 409);
};
const checkSignal = (signal) => { if (signal?.aborted) throw new DOMException("Aborted", "AbortError"); };

function seedCatalog(storeId, existing) {
  const store = existing?.id === storeId ? { ...existing } : {
    id: storeId, name: "Your demo store", status: "Draft", logoUrl: null, coverImageUrl: null,
    isPickupAvailable: true, isDeliveryAvailable: true,
  };
  const currencyCode = store.countryCode === "AU" ? "AUD" : "BDT";
  const category = (id, name, parentId = null) => ({ id, name, parentId, storeId, sortOrder: 0, version: 1 });
  const storeCategories = [
    category("electronics", "Electronics"), category("audio", "Audio", "electronics"),
    category("headphones", "Headphones", "audio"), category("wireless", "Wireless", "headphones"),
    category("over-ear", "Over-ear", "wireless"), category("accessories", "Accessories", "electronics"),
    category("services", "Services"), category("home-services", "Home services", "services"),
  ];
  const marketplaceCategories = [
    category("hlm-goods", "Goods"), category("hlm-electronics", "Electronics", "hlm-goods"),
    category("hlm-services", "Services"), category("hlm-home", "Home services", "hlm-services"),
  ].map((node) => ({ id: node.id, name: node.name, parentId: node.parentId, sortOrder: node.sortOrder }));
  const deliveryOptions = [
    { id: "same-city", name: "Inside the same city", coverageDescription: "Within the city", estimatedTimeDescription: "Next day", feeType: "Fixed", feeAmount: 60, currencyCode, isActive: true },
    { id: "nearby", name: "Nearby express", coverageDescription: "Within 500 m", estimatedTimeDescription: "About 1 hour, by arrangement", feeType: "ContactSeller", feeAmount: null, currencyCode, isActive: true },
  ];
  const item = (name, price, categoryId, extra = {}) => {
    const base = newProduct(currencyCode);
    const variant = { ...base.variants[0], price, compareAtPrice: null,
      inventory: { onHandQuantity: 8, reservedQuantity: 0, version: 1 } };
    return { ...base, id: newId(), storeId, version: 1, name, description: "", status: "Published",
      storeCategoryId: categoryId, marketplaceCategoryId: "hlm-electronics", variants: [variant],
      isPickupAvailable: Boolean(store.isPickupAvailable), ...extra };
  };
  const headphones = item("Wireless headphones", 1850, "over-ear", { trackInventory: true, variantOptionName: "Color" });
  headphones.variants = [
    { ...headphones.variants[0], name: "Black", inventory: { onHandQuantity: 16, reservedQuantity: 0, version: 1 } },
    { ...headphones.variants[0], id: newId(), name: "White", price: 1990, inventory: { onHandQuantity: 8, reservedQuantity: 0, version: 1 } },
  ];
  const speaker = item("Portable Bluetooth speaker", 1250, "audio", { trackInventory: true });
  speaker.variants[0].inventory.onHandQuantity = 3;
  const keyboard = item("Mechanical keyboard", 3200, "accessories", { trackInventory: true });
  keyboard.variants[0].inventory.onHandQuantity = 0;
  return {
    store, currencyCode, storeCategories, marketplaceCategories, deliveryOptions, assets: {}, requests: {},
    products: [headphones, speaker, item("USB-C charging cable", 250, "accessories"), keyboard,
      item("AC servicing", 800, "home-services", { type: "Service", marketplaceCategoryId: "hlm-home", isPickupAvailable: false }),
      item("Adjustable phone stand", 350, "accessories", { status: "Draft" })],
  };
}

export function createDemoProductApi({ storeId, actorId, store }) {
  if (!actorId) throw new Error("Sign in before using the Products demo.");
  const key = JSON.stringify([String(actorId), storeId]);
  const run = (work, signal) => {
    checkSignal(signal);
    return transactDemo(key, () => seedCatalog(storeId, store), (catalog) => {
      checkSignal(signal);
      return structuredClone(work(catalog));
    }).then((result) => { checkSignal(signal); return result; });
  };
  const find = (catalog, id) => catalog.products.find((p) => p.id === id) || fail("Product was not found.", 404);
  const once = (catalog, requestId, payload, work) => {
    const signature = JSON.stringify(payload);
    const previous = catalog.requests[requestId];
    if (previous) {
      if (previous.signature !== signature) fail("This request key has already been used with different values.", 409);
      return previous.result;
    }
    const result = work();
    catalog.requests[requestId] = { signature, result: structuredClone(result) };
    return result;
  };
  return {
    isDemo: true,
    bootstrap: (signal) => run((c) => {
      if (store?.id === storeId) c.store = { ...c.store, ...store };
      return { store: c.store, currencyCode: c.currencyCode,
        storeCategories: c.storeCategories, marketplaceCategories: c.marketplaceCategories, deliveryOptions: c.deliveryOptions };
    }, signal),
    list: ({ search = "", categoryId = "", status = "Current", page = 1, pageSize = 20 }, signal) => run((c) => {
      const descendants = categoryId ? descendantIds(createCategoryIndex(c.storeCategories), categoryId) : null;
      const items = c.products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) &&
        (!descendants || descendants.has(p.storeCategoryId)) &&
        (status === "Current" ? p.status !== "Archived" : p.status === status));
      return { items: items.slice((page - 1) * pageSize, page * pageSize), totalCount: items.length, page, pageSize };
    }, signal),
    get: (id, signal) => run((c) => find(c, id), signal),
    createCategory: (payload, requestId) => run((c) => once(c, requestId, payload, () => {
      const name = payload.name.trim();
      if (!name || name.length > 100) fail("Enter a category name of 1–100 characters.");
      if (payload.parentId && !c.storeCategories.some((node) => node.id === payload.parentId)) fail("The parent category no longer exists.");
      if (c.storeCategories.some((node) => node.parentId === (payload.parentId || null) && node.name.toLowerCase() === name.toLowerCase())) fail("That name is already used inside this category.");
      const node = { id: newId(), storeId, name, parentId: payload.parentId || null, sortOrder: 0, version: 1 };
      c.storeCategories.push(node);
      return node;
    })),
    save: (id, payload, requestId) => run((c) => {
      const save = () => {
        const existing = id ? find(c, id) : null;
        if (existing?.status === "Archived") fail("Restore the archived listing before editing it.");
        if (existing) matchVersion(existing.version, payload.expectedVersion);
        const variants = payload.variants.map((v) => {
          const previous = existing?.variants.find((variant) => variant.id === v.id);
          const inventory = previous?.inventory || { onHandQuantity: 0, reservedQuantity: 0, version: null };
          if (payload.trackInventory) matchVersion(inventory.version, v.inventory.expectedVersion);
          return { ...v, inventory: payload.trackInventory ? {
            onHandQuantity: v.inventory.onHandQuantity, reservedQuantity: inventory.reservedQuantity,
            version: (inventory.version ?? 0) + 1,
          } : { ...inventory } };
        });
        for (const previous of existing?.variants || []) {
          if (previous.inventory.reservedQuantity > 0 && (!payload.trackInventory || !variants.some((v) => v.id === previous.id && v.isOffered !== false))) fail("Reserved stock must be resolved before disabling tracking or removing a variant.");
        }
        for (const previous of existing?.variants || []) {
          if (previous.inventory.onHandQuantity > 0 && !variants.some((v) => v.id === previous.id))
            fail("Adjust existing stock before removing the combination, or keep it and turn off Offer.");
        }
        const images = payload.imageAssetIds.map((assetId) => c.assets[assetId] || fail("An image is unavailable. Upload it again."));
        const { expectedVersion: _expectedVersion, imageAssetIds: _imageAssetIds, ...fields } = payload;
        const product = { ...fields, id: id || newId(), storeId, version: (existing?.version || 0) + 1,
          variants, images, updatedAtUtc: new Date().toISOString() };
        const errors = validateProduct(toProductForm(product), product.status, c);
        if (Object.keys(errors).length) fail(Object.values(errors).join(" "));
        if (existing) c.products[c.products.indexOf(existing)] = product;
        else c.products.unshift(product);
        return product;
      };
      return id ? save() : once(c, requestId, payload, save);
    }),
    setStatus: (id, { expectedVersion, status }) => run((c) => {
      const p = find(c, id);
      matchVersion(p.version, expectedVersion);
      if (!["Archived", "Draft"].includes(status)) fail("Invalid listing status.");
      p.status = status; p.version += 1;
      return p;
    }),
    setAvailability: (id, { expectedVersion, availability }) => run((c) => {
      const p = find(c, id);
      matchVersion(p.version, expectedVersion);
      if (p.trackInventory || !["Available", "Unavailable"].includes(availability)) fail("Invalid manual availability change.");
      p.manualAvailability = availability; p.version += 1;
      return p;
    }),
    setInventory: (id, { expectedVersion, variants, reason }) => run((c) => {
      const p = find(c, id);
      matchVersion(p.version, expectedVersion);
      if (!p.trackInventory || p.type === "Service") fail("This listing does not track stock.");
      if (!["CountCorrection", "NewStock", "ExternalSale", "Damaged"].includes(reason)) fail("Choose an adjustment reason.");
      if (variants.length !== p.variants.length || new Set(variants.map((v) => v.id)).size !== p.variants.length) fail("Reload the current variants.");
      for (const update of variants) {
        const v = p.variants.find((item) => item.id === update.id) || fail("A variant was removed.", 409);
        matchVersion(v.inventory.version, update.expectedVersion);
        if (!validQuantity(update.onHandQuantity) || update.onHandQuantity < v.inventory.reservedQuantity) fail("Stock cannot be less than the quantity reserved for orders.");
        v.inventory.onHandQuantity = update.onHandQuantity;
        v.inventory.version = (v.inventory.version ?? 0) + 1;
      }
      p.version += 1;
      return p;
    }),
    storePhoto: (imageUrl, signal) => run((c) => {
      const image = { assetId: newId(), imageUrl };
      c.assets[image.assetId] = image;
      return image;
    }, signal),
  };
}
