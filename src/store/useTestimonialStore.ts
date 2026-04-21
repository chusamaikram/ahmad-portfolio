import { create } from "zustand";
import {
  fetchTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  toggleTestimonialStatus,
} from "@/src/api/services/testimonials";
import type { Pagination } from "@/src/api/types";

export type Testimonial = {
  id: number;
  name: string;
  role: string;
  company: string;
  rating: number;
  text: string;
  status: "Published" | "Hidden";
};

type TestimonialStore = {
  testimonials: Testimonial[];
  loading: boolean;
  error: string | null;
  pagination: Pagination | null;
  fetchTestimonials: (page?: number, search?: string, status?: string) => Promise<void>;
  addTestimonial: (t: Omit<Testimonial, "id">) => Promise<void>;
  updateTestimonial: (id: number, t: Omit<Testimonial, "id">) => Promise<void>;
  deleteTestimonial: (id: number) => Promise<void>;
  toggleStatus: (id: number) => Promise<void>;
};

export const useTestimonialStore = create<TestimonialStore>((set, get) => ({
  testimonials: [],
  loading: false,
  error: null,
  pagination: null,

  fetchTestimonials: async (page = 1, search = "", status = "") => {
    set({ loading: true, error: null });
    try {
      const { results, pagination } = await fetchTestimonials(page, search, status);
      set({ testimonials: results, pagination });
    } catch {
      set({ error: "Failed to load testimonials" });
    } finally {
      set({ loading: false });
    }
  },

  addTestimonial: async (t) => {
    const created = await createTestimonial(t);
    set((s) => ({ testimonials: [...s.testimonials, created] }));
  },

  updateTestimonial: async (id, t) => {
    const updated = await updateTestimonial(id, t);
    set((s) => ({ testimonials: s.testimonials.map((x) => (x.id === id ? updated : x)) }));
  },

  deleteTestimonial: async (id) => {
    await deleteTestimonial(id);
    set((s) => ({ testimonials: s.testimonials.filter((x) => x.id !== id) }));
  },

  toggleStatus: async (id) => {
    const current = get().testimonials.find((x) => x.id === id)?.status;
    if (!current) return;
    const updated = await toggleTestimonialStatus(id, current);
    set((s) => ({ testimonials: s.testimonials.map((x) => (x.id === id ? updated : x)) }));
  },
}));
