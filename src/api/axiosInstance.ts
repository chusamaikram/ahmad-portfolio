import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://portfolio-backend-3hs9.onrender.com/api";

const getCookie = (name: string) =>
  document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];

// Authenticated instance — for protected admin endpoints
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});

// Attach access token from cookie on every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = getCookie("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Auto-refresh access token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = getCookie("refresh");
        if (!refresh) throw new Error("No refresh token");
        const { data } = await axios.post(`${BASE_URL}/auth/token/refresh/`, { refresh });
        document.cookie = `token=${data.access}; path=/; samesite=lax`;
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch {
        // Refresh failed — clear cookies and redirect to login
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
        document.cookie = "refresh=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  }
);

// Public instance — for endpoints that don't require authentication
export const publicApi = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});

export default api;