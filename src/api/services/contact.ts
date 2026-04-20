import api, { publicApi } from "../axiosInstance";
import { API_ENDPOINTS } from "../endpoints";

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactQueryResponse {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "read" | "unread";
  created_at: string;
}

export const sendContactMessage = async (payload: ContactPayload) => {
  const response = await publicApi.post(API_ENDPOINTS.CONTACT.SEND, payload);
  return response.data;
};

export const fetchContactQueries = async (): Promise<ContactQueryResponse[]> => {
  const response = await api.get(API_ENDPOINTS.CONTACT.GET_ALL);
  return Array.isArray(response.data) ? response.data : response.data.results ?? [];
};

export const markContactQueryRead = async (id: number): Promise<ContactQueryResponse> => {
  const response = await api.post(API_ENDPOINTS.CONTACT.MARK_READ(id));
  return response.data;
};

export const markAllContactQueriesRead = async (): Promise<void> => {
  await api.post(API_ENDPOINTS.CONTACT.MARK_ALL_READ);
};

export const deleteContactQuery = async (id: number): Promise<void> => {
  await api.delete(API_ENDPOINTS.CONTACT.DELETE(id));
};
