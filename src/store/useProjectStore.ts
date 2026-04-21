import { create } from "zustand";
import { fetchProjects, createProject, updateProject, deleteProject } from "@/src/api/services/projects";
import type { Pagination } from "@/src/api/types";

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
  loading: boolean;
  error: string | null;
  pagination: Pagination | null;
  fetchProjects: (page?: number, search?: string, status?: string, category?: string) => Promise<void>;
  addProject: (p: Omit<Project, "id">) => Promise<void>;
  updateProject: (id: number, p: Omit<Project, "id">) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
};

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],
  loading: false,
  error: null,
  pagination: null,

  fetchProjects: async (page = 1, search = "", status = "", category = "") => {
    set({ loading: true, error: null });
    try {
      const { results, pagination } = await fetchProjects(page, search, status, category);
      set({ projects: results, pagination });
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
