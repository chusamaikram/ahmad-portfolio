import api, { publicApi } from "../axiosInstance";
import { API_ENDPOINTS } from "../endpoints";
import { parsePaginated, type PaginatedResponse } from "../types";

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

export const fetchContactQueries = async (page = 1, search = "", status = ""): Promise<PaginatedResponse<ContactQueryResponse>> => {
  const params = new URLSearchParams({ page: String(page) });
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  const response = await api.get(`${API_ENDPOINTS.CONTACT.GET_ALL}?${params}`);
  return parsePaginated(response.data, (d) => d as ContactQueryResponse);
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
