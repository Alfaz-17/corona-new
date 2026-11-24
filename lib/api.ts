import axios from "axios";

const isServer = typeof window === "undefined";
const baseURL = isServer
  ? (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://coronamarineparts.com") + "/api"
  : "/api";

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
