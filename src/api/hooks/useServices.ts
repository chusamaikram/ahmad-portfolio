import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { GetServices, CreateService, UpdateService, DeleteService, type ServicePayload } from "../services/services";
import { useServiceStore } from "@/src/store/useServiceStore";
import type { Pagination } from "../types";

export default function useServices() {
  const { services, setServices, addService, updateService, removeService } = useServiceStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 1000);
  };

  const load = useCallback(async (p: number, s: string) => {
    setLoading(true);
    setError("");
    try {
      const { results, pagination: pg } = await GetServices(p, s);
      setServices(results);
      setPagination(pg);
    } catch {
      setError("Failed to load services.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(page, debouncedSearch); }, [page, debouncedSearch]);

  const handlePageChange = (p: number) => setPage(p);

  const handleAdd = async (payload: ServicePayload) => {
    const created = await CreateService(payload);
    addService(created);
    toast.success("Service added.");
    load(page, debouncedSearch);
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
    load(page, debouncedSearch);
  };

  const handleToggleVisible = async (id: number, currentVisible: boolean) => {
    const updated = await UpdateService(id, { visible: !currentVisible });
    updateService(updated);
  };

  return {
    services,
    search,
    setSearch: handleSearchChange,
    loading,
    error,
    pagination,
    page,
    handlePageChange,
    handleAdd,
    handleUpdate,
    handleDelete,
    handleToggleVisible,
    refetch: () => load(page, debouncedSearch),
  };
}
