import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface User {
  email: string;
  name?: string;
  role?: string;
}

interface StoreState {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useUserStore = create<StoreState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: "user",
      storage: createJSONStorage(() => localStorage),
    }
  )
);