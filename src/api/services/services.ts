import api from "../axiosInstance";
import { API_ENDPOINTS } from "../endpoints";
import { parsePaginated, type PaginatedResponse } from "../types";

export interface Service {
  id: number;
  title: string;
  description: string;
  features: string[];
  color_gradient: string;
  visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServicePayload {
  title: string;
  description: string;
  features: string;
  color_gradient: string;
  visible: boolean;
}

export const GetServices = async (page = 1, search = ""): Promise<PaginatedResponse<Service>> => {
  const params = new URLSearchParams({ page: String(page) });
  if (search) params.set("search", search);
  const response = await api.get(`${API_ENDPOINTS.SERVICES.GET_ALL}?${params}`);
  return parsePaginated(response.data, (d) => d as Service);
};

export const CreateService = async (payload: ServicePayload): Promise<Service> => {
  const response = await api.post(API_ENDPOINTS.SERVICES.CREATE, payload);
  return response.data;
};

export const UpdateService = async (id: number, payload: Partial<ServicePayload>): Promise<Service> => {
  const response = await api.patch(API_ENDPOINTS.SERVICES.UPDATE(id), payload);
  return response.data;
};

export const DeleteService = async (id: number): Promise<void> => {
  await api.delete(API_ENDPOINTS.SERVICES.DELETE(id));
};


