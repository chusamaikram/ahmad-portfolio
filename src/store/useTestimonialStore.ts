import { create } from "zustand";
import {
  fetchTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  toggleTestimonialStatus,
} from "@/src/api/services/testimonials";

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
  search: string;
  filterStatus: string;
  loading: boolean;
  error: string | null;

  setSearch: (v: string) => void;
  setFilterStatus: (v: string) => void;

  fetchTestimonials: () => Promise<void>;
  addTestimonial: (t: Omit<Testimonial, "id">) => Promise<void>;
  updateTestimonial: (id: number, t: Omit<Testimonial, "id">) => Promise<void>;
  deleteTestimonial: (id: number) => Promise<void>;
  toggleStatus: (id: number) => Promise<void>;
};

export const useTestimonialStore = create<TestimonialStore>((set, get) => ({
  testimonials: [],
  search: "",
  filterStatus: "All",
  loading: false,
  error: null,

  setSearch: (v) => set({ search: v }),
  setFilterStatus: (v) => set({ filterStatus: v }),

  fetchTestimonials: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchTestimonials();
      set({ testimonials: data });
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
    set((s) => ({
      testimonials: s.testimonials.map((x) => (x.id === id ? updated : x)),
    }));
  },

  deleteTestimonial: async (id) => {
    await deleteTestimonial(id);
    set((s) => ({ testimonials: s.testimonials.filter((x) => x.id !== id) }));
  },

  toggleStatus: async (id) => {
    const current = get().testimonials.find((x) => x.id === id)?.status;
    if (!current) return;
    const updated = await toggleTestimonialStatus(id, current);
    set((s) => ({
      testimonials: s.testimonials.map((x) => (x.id === id ? updated : x)),
    }));
  },
}));
