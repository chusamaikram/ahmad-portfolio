import { create } from "zustand";

export type ContactQuery = {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "read" | "unread";
  created_at: string;
};

type ContactQueryStore = {
  queries: ContactQuery[];
  search: string;
  filterRead: string;
  setQueries: (queries: ContactQuery[]) => void;
  setSearch: (v: string) => void;
  setFilterRead: (v: string) => void;
  markRead: (id: number) => void;
  toggleRead: (id: number) => void;
  markAllRead: () => void;
  deleteQuery: (id: number) => void;
};

export const useContactQueryStore = create<ContactQueryStore>((set) => ({
  queries: [],
  search: "",
  filterRead: "All",
  setQueries: (queries) => set({ queries: Array.isArray(queries) ? queries : [] }),
  setSearch: (v) => set({ search: v }),
  setFilterRead: (v) => set({ filterRead: v }),
  markRead: (id) =>
    set((s) => ({ queries: s.queries.map((q) => (q.id === id ? { ...q, status: "read" as const } : q)) })),
  toggleRead: (id) =>
    set((s) => ({ queries: s.queries.map((q) => (q.id === id ? { ...q, status: q.status === "read" ? "unread" as const : "read" as const } : q)) })),
  markAllRead: () =>
    set((s) => ({ queries: s.queries.map((q) => ({ ...q, status: "read" as const })) })),
  deleteQuery: (id) =>
    set((s) => ({ queries: s.queries.filter((q) => q.id !== id) })),
}));
