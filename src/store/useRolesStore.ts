import { create } from "zustand";
import { fetchUsers, createUser, updateUser, deleteUser, toggleUserStatus } from "@/src/api/services/roles";
import type { Pagination } from "@/src/api/types";

export type Role = "support_staff" | "content_creator" | "super_admin";
export type Status = "Active" | "Revoked";

export type RoleUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: Status;
  added: string;
};

type RolesStore = {
  users: RoleUser[];
  loading: boolean;
  error: string | null;
  pagination: Pagination | null;
  fetchUsers: (page?: number, search?: string, role?: string, status?: string) => Promise<void>;
  addUser: (p: Omit<RoleUser, "id" | "added">) => Promise<void>;
  updateUser: (id: number, p: Omit<RoleUser, "id" | "added">) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
  toggleUserStatus: (id: number) => Promise<void>;
};

export const useRolesStore = create<RolesStore>((set) => ({
  users: [],
  loading: false,
  error: null,
  pagination: null,

  fetchUsers: async (page = 1, search = "", role = "", status = "") => {
    set({ loading: true, error: null });
    try {
      const { results, pagination } = await fetchUsers(page, search, role, status);
      set({ users: results, pagination });
    } catch {
      set({ error: "Failed to load users" });
    } finally {
      set({ loading: false });
    }
  },

  addUser: async (p) => {
    const created = await createUser(p);
    set((s) => ({ users: [...s.users, created] }));
  },

  updateUser: async (id, p) => {
    const updated = await updateUser(id, p);
    set((s) => ({ users: s.users.map((u) => (u.id === id ? updated : u)) }));
  },

  deleteUser: async (id) => {
    await deleteUser(id);
    set((s) => ({ users: s.users.filter((u) => u.id !== id) }));
  },

  toggleUserStatus: async (id) => {
    const updated = await toggleUserStatus(id);
    set((s) => ({ users: s.users.map((u) => (u.id === id ? updated : u)) }));
  },
}));
