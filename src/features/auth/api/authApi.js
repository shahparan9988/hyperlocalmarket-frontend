import { apiClient } from "../../../shared/api/apiClient";

export const authApi = {
    login(payload) {
        return apiClient.post("/Auth/login", payload);
    },

    register(payload) {
        return apiClient.post("/Auth/register", payload);
    },

    logout() {
        return apiClient.post("/Auth/logout");
    },

    me() {
        return apiClient.get("/Auth/me");
    },

    forgotPassword(payload) {
        return apiClient.post("/Auth/forgot-password", payload);
    },

    resetPassword(payload) {
        return apiClient.post("/Auth/reset-password", payload);
    }
};