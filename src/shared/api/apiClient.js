import axios from "axios";
import { tokenService }  from "../../features/auth/services/tokenService";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});


apiClient.interceptors.response.use(response => {
  return response;
}, error => {
  // We can handle global errors here
  return Promise.reject(error);
});