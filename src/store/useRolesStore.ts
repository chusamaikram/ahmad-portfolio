import { create } from "zustand";
import { fetchUsers, createUser, updateUser, deleteUser, toggleUserStatus } from "@/src/api/services/roles";

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
  search: string;
  roleFilter: string;
  statusFilter: string;
  loading: boolean;
  error: string | null;

  setSearch: (v: string) => void;
  setRoleFilter: (v: string) => void;
  setStatusFilter: (v: string) => void;

  fetchUsers: () => Promise<void>;
  addUser: (p: Omit<RoleUser, "id" | "added">) => Promise<void>;
  updateUser: (id: number, p: Omit<RoleUser, "id" | "added">) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
  toggleUserStatus: (id: number) => Promise<void>;
};

export const useRolesStore = create<RolesStore>((set) => ({
  users: [],
  search: "",
  roleFilter: "All Roles",
  statusFilter: "All Status",
  loading: false,
  error: null,

  setSearch: (v) => set({ search: v }),
  setRoleFilter: (v) => set({ roleFilter: v }),
  setStatusFilter: (v) => set({ statusFilter: v }),

  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchUsers();
      set({ users: data });
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
