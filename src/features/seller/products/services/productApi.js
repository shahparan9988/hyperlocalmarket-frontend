import { apiClient } from "../../../../shared/api/apiClient";
import { createDemoProductApi } from "./productDemoApi";

export const productsMode = import.meta.env.VITE_SELLER_PRODUCTS_MODE || "api";
const prefix = import.meta.env.VITE_API_PATH_PREFIX || "";
const data = (response) => response.data;

export async function getProductEditorData(storeId, signal) {
  const products = `${prefix}/stores/${encodeURIComponent(storeId)}/products`;
  const result = await apiClient.get(`${products}/editor-data`, { signal }).then(data);
  if (String(result?.store?.id || "").toLowerCase() !== storeId.toLowerCase() ||
      !Array.isArray(result.storeCategories) || !Array.isArray(result.marketplaceCategories) ||
      !Array.isArray(result.deliveryOptions)) {
    throw new Error("The product editor-data response does not match API-CONTRACT.md.");
  }
  return result;
}

function checkedProduct(product, storeId) {
  if (!product?.id || product.storeId !== storeId || !Number.isInteger(product.version) ||
      !Array.isArray(product.options) || !Array.isArray(product.variants) || !Array.isArray(product.images) ||
      product.variants.some((variant) => !Array.isArray(variant.selections) || typeof variant.isOffered !== "boolean") ||
      !Array.isArray(product.deliveryOptionIds)) {
    throw new Error("The Products API must return options, variant selections and isOffered. Apply the multiple-options backend update and reload.");
  }
  return product;
}

export function createProductApi({ storeId, actorId, store }) {
  if (productsMode === "demo") return createDemoProductApi({ storeId, actorId, store });
  if (productsMode !== "api") throw new Error("VITE_SELLER_PRODUCTS_MODE must be api or demo.");
  const base = `${prefix}/stores/${encodeURIComponent(storeId)}`;
  const products = `${base}/products`;
  const check = (product) => checkedProduct(product, storeId);
  return {
    isDemo: false,
    
    bootstrap: (signal) => getProductEditorData(storeId, signal),

    async list(params, signal) {
      const result = await apiClient.get(products, { params, signal }).then(data);
      if (!Array.isArray(result?.items) || !Number.isInteger(result.totalCount)) throw new Error("Invalid Products list response.");
      result.items.forEach(check);
      return result;
    },
    get: (id, signal) => apiClient.get(`${products}/${id}`, { signal }).then(data).then(check),
    save: (id, payload, requestId) => (id
      ? apiClient.put(`${products}/${id}`, payload)
      : apiClient.post(products, payload, { headers: { "Idempotency-Key": requestId } }))
      .then(data).then(check),
    setStatus: (id, payload) => apiClient.patch(`${products}/${id}/status`, payload).then(data).then(check),
    setAvailability: (id, payload) => apiClient.patch(`${products}/${id}/availability`, payload).then(data).then(check),
    setInventory: (id, payload) => apiClient.put(`${products}/${id}/inventory`, payload).then(data).then(check),
    async createCategory(payload, requestId) {
      const node = await apiClient.post(`${base}/product-categories`, payload,
        { headers: { "Idempotency-Key": requestId } }).then(data);
      if (!node?.id || node.storeId !== storeId || node.parentId !== (payload.parentId || null) || !node.name) {
        throw new Error("The category response does not match API-CONTRACT.md.");
      }
      return node;
    },
    requestPhoto: (file, signal) => apiClient.post(`${base}/product-images/upload-requests`, {
      fileName: file.name, contentType: file.type, fileSizeBytes: file.size,
    }, { signal }).then(data),
    photoStatus: (uploadId, signal) => apiClient.get(`${base}/product-images/uploads/${uploadId}`, { signal }).then(data),
  };
}
