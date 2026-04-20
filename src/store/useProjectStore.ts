import { create } from "zustand";
import {
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
} from "@/src/api/services/projects";

export type Project = {
  id: number;
  title: string;
  category: string;
  tech: string[];
  status: "Live" | "In Progress" | "Archived";
  year: string;
  github: string;
  live: string;
  desc: string;
  image?: string;
};

type ProjectStore = {
  projects: Project[];
  search: string;
  filterStatus: string;
  loading: boolean;
  error: string | null;

  setSearch: (v: string) => void;
  setFilterStatus: (v: string) => void;

  fetchProjects: () => Promise<void>;
  addProject: (p: Omit<Project, "id">) => Promise<void>;
  updateProject: (id: number, p: Omit<Project, "id">) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
};

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],
  search: "",
  filterStatus: "All",
  loading: false,
  error: null,

  setSearch: (v) => set({ search: v }),
  setFilterStatus: (v) => set({ filterStatus: v }),

  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchProjects();
      set({ projects: data });
    } catch {
      set({ error: "Failed to load projects" });
    } finally {
      set({ loading: false });
    }
  },

  addProject: async (p) => {
    const created = await createProject(p);
    set((s) => ({ projects: [...s.projects, created] }));
  },

  updateProject: async (id, p) => {
    const updated = await updateProject(id, p);
    set((s) => ({ projects: s.projects.map((x) => (x.id === id ? updated : x)) }));
  },

  deleteProject: async (id) => {
    await deleteProject(id);
    set((s) => ({ projects: s.projects.filter((x) => x.id !== id) }));
  },
}));
