import api from "../axiosInstance";
import { API_ENDPOINTS } from "../endpoints";

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

export const GetServices = async (): Promise<Service[]> => {
  const response = await api.get(API_ENDPOINTS.SERVICES.GET_ALL);
  return Array.isArray(response.data) ? response.data : (response.data.results ?? []);
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


