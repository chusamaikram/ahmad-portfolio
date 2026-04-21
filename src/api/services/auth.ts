import api from "../axiosInstance";
import { API_ENDPOINTS } from "../endpoints";

export const login = async (email: string, password: string) => {
  const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
  return response.data;
};

export const logout = () => {
  document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
  document.cookie = "refresh=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
  document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
};