import {apiClient} from "../../../../shared/api/apiClient";
import axios from "axios";

const API_PREFIX = import.meta.env.VITE_API_PATH_PREFIX ?? "";
const storesPath = `${API_PREFIX}/store`;

const data = (response) => response.data;

export const storeSetupApi = {
  createStore: (payload) => apiClient.post(storesPath, payload).then(data),

  getMyStores: (params) =>
    apiClient.get(`${storesPath}/mine`, { params }).then(data),

  getStore: (storeId) =>
    apiClient.get(`${storesPath}/${storeId}`).then(data),

  getSetupStatus: (storeId) =>
    apiClient.get(`${storesPath}/${storeId}/setup-status`).then(data),

  updateBusinessInfo: (storeId, payload) =>
    apiClient.put(`${storesPath}/${storeId}/business-info`, payload).then(data),

  updateLocation: (storeId, payload) =>
    apiClient.put(`${storesPath}/${storeId}/location`, payload).then(data),

  updateContact: (storeId, payload) =>
    apiClient.put(`${storesPath}/${storeId}/contact`, payload).then(data),

  updateBusinessHours: (storeId, payload) =>
    apiClient.put(`${storesPath}/${storeId}/business-hours`, payload).then(data),

  updatePickupDelivery: (storeId, payload) =>
    apiClient.put(`${storesPath}/${storeId}/pickup-delivery`, payload).then(data),

  requestBrandingUpload: (storeId, kind, file) =>
    apiClient
      .post(
        `${storesPath}/${storeId}/branding/${kind}/upload-request`,
        {
          fileName: file.name,
          contentType: file.type,
          fileSizeBytes: file.size,
        }
      )
      .then(data),
  
  uploadToSignedUrl: (uploadUrl, file, onProgress) =>
    axios.put(uploadUrl, file, {
      withCredentials: false,
      headers: {
        "Content-Type": file.type,
      },
      onUploadProgress: (event) => {
        if (!event.total) {
          return;
        }

        const percentage = Math.round(
          (event.loaded * 100) / event.total
        );

        onProgress?.(percentage);
      },
    }),

  getBrandingUploadStatus: (storeId, uploadId) =>
    apiClient
      .get(
        `${storesPath}/${storeId}/branding/uploads/${uploadId}`
      )
      .then(data),

  removeLogo: (storeId) =>
    apiClient
      .delete(`${storesPath}/${storeId}/branding/logo`)
      .then(data),

  removeCover: (storeId) =>
    apiClient
      .delete(`${storesPath}/${storeId}/branding/cover`)
      .then(data),

  // uploadLogo: (storeId, file) => {
  //   const formData = new FormData();
  //   formData.append("file", file);

  //   return apiClient
  //     .post(`${storesPath}/${storeId}/branding/logo`, formData)
  //     .then(data);
  // },

  // uploadCover: (storeId, file) => {
  //   const formData = new FormData();
  //   formData.append("file", file);

  //   return apiClient
  //     .post(`${storesPath}/${storeId}/branding/cover`, formData)
  //     .then(data);
  // },


  publish: (storeId) =>
    apiClient.post(`${storesPath}/${storeId}/publish`).then(data),

  setAcceptingOrders: (storeId, isAcceptingOrders) =>
    apiClient
      .put(`${storesPath}/${storeId}/accepting-orders`, { isAcceptingOrders })
      .then(data),
};

export default storeSetupApi;
