import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { GetServices, CreateService, UpdateService, DeleteService, type ServicePayload } from "../services/services";
import { useServiceStore } from "@/src/store/useServiceStore";

export default function useServices() {
  const { services, setServices, addService, updateService, removeService } = useServiceStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await GetServices();
      setServices(data);
    } catch {
      setError("Failed to load services.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, []);

  const filtered = services.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async (payload: ServicePayload) => {
    const created = await CreateService(payload);
    addService(created);
    toast.success("Service added.");
  };

  const handleUpdate = async (id: number, payload: Partial<ServicePayload>) => {
    const updated = await UpdateService(id, payload);
    updateService(updated);
    toast.success("Service updated.");
  };

  const handleDelete = async (id: number) => {
    await DeleteService(id);
    removeService(id);
    toast.success("Service deleted.");
  };

  const handleToggleVisible = async (id: number, currentVisible: boolean) => {
    const updated = await UpdateService(id, { visible: !currentVisible });
    updateService(updated);
  };

  return { services, filtered, search, setSearch, loading, error, handleAdd, handleUpdate, handleDelete, handleToggleVisible, refetch: load };
}
