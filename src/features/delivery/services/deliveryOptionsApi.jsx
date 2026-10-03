import { apiClient } from "../../../shared/api/apiClient";

const prefix = import.meta.env.VITE_API_PATH_PREFIX ?? "";
const data = (response) => response.data;
const optionsPath = (storeId) => `${prefix}/store/${storeId}/delivery-options`;
const selectionPath = (storeId, productId) =>
  `${prefix}/stores/${storeId}/products/${productId}/delivery-options`;

export const deliveryOptionsApi = {
  list: (storeId, signal) =>
    apiClient.get(optionsPath(storeId), { signal }).then(data),
  create: (storeId, payload) =>
    apiClient.post(optionsPath(storeId), payload).then(data),
  update: (storeId, optionId, payload) =>
    apiClient.put(`${optionsPath(storeId)}/${optionId}`, payload).then(data),
  setActive: (storeId, optionId, isActive, expectedVersion) =>
    apiClient.patch(`${optionsPath(storeId)}/${optionId}/status`,
      { isActive, expectedVersion }).then(data),
  getSelection: (storeId, productId, signal) =>
    apiClient.get(selectionPath(storeId, productId), { signal }).then(data),
  saveSelection: (storeId, productId, payload) =>
    apiClient.put(selectionPath(storeId, productId), payload).then(data),
  getPublic: (productId, signal) =>
    apiClient.get(`${prefix}/products/${productId}/delivery-options`, { signal }).then(data),
};
