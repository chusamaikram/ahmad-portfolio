import { create } from "zustand";
import { Service } from "../api/services/services";

type ServiceStore = {
  services: Service[];
  setServices: (services: Service[]) => void;
  addService: (service: Service) => void;
  updateService: (service: Service) => void;
  removeService: (id: number) => void;
};

export const useServiceStore = create<ServiceStore>((set) => ({
  services: [],
  setServices: (services) => set({ services }),
  addService: (service) => set((s) => ({ services: [...s.services, service] })),
  updateService: (service) =>
    set((s) => ({ services: s.services.map((sv) => (sv.id === service.id ? service : sv)) })),
  removeService: (id) =>
    set((s) => ({ services: s.services.filter((sv) => sv.id !== id) })),
}));
