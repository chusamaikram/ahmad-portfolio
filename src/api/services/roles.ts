import api from "../axiosInstance";
import { API_ENDPOINTS } from "../endpoints";
import { parsePaginated, type PaginatedResponse } from "../types";
import type { RoleUser } from "@/src/store/useRolesStore";

type UserPayload = Omit<RoleUser, "id" | "added">;

const fromApi = (d: any): RoleUser => ({
  id: d.id,
  name: d.name ?? d.username ?? "",
  email: d.email,
  role: d.role,
  status: d.is_active === false || d.status === "Revoked" ? "Revoked" : "Active",
  added: (d.created_at || d.date_joined)
    ? new Date(d.created_at ?? d.date_joined).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
    : d.added ?? "",
});

export const fetchUsers = async (page = 1, search = "", role = "", status = ""): Promise<PaginatedResponse<RoleUser>> => {
  const params = new URLSearchParams({ page: String(page) });
  if (search) params.set("search", search);
  if (role) params.set("role", role);
  if (status) params.set("status", status);
  const res = await api.get(`${API_ENDPOINTS.ROLES.GET_USERS}?${params}`);
  return parsePaginated(res.data, fromApi);
};

export const createUser = async (payload: UserPayload): Promise<RoleUser> => {
  const res = await api.post(API_ENDPOINTS.ROLES.ADD_USER, payload);
  return fromApi(res.data);
};

export const updateUser = async (id: number, payload: UserPayload): Promise<RoleUser> => {
  const res = await api.patch(API_ENDPOINTS.ROLES.UPDATE_USER(id), payload);
  return fromApi(res.data);
};

export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(API_ENDPOINTS.ROLES.DELETE_USER(id));
};

export const toggleUserStatus = async (id: number): Promise<RoleUser> => {
  const res = await api.post(API_ENDPOINTS.ROLES.REVOKE_USER(id));
  return fromApi(res.data);
};
