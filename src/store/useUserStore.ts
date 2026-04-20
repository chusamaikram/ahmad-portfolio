import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Define the shape of your user object
export interface User {
  email: string;  
  name?: string;
  role?: string;
}

// Define the store state
interface StoreState {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

// Create the store
export const useUserStore = create<StoreState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: "user", // key in localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);