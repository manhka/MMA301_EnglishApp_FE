import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { BASE_URL } from "../constants/constants";
const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 15000,
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
