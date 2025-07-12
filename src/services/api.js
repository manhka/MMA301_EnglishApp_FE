import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { BASE_URL } from "../constants/constants";
const api = axios.create({
  baseURL: "http://192.168.1.65:9999/api",
  timeout: 5000,
});
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync("userToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
export default api;
