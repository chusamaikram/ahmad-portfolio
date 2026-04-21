import { useEffect, useCallback, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useTestimonialStore } from "@/src/store/useTestimonialStore";
import type { Testimonial } from "@/src/store/useTestimonialStore";

export default function useTestimonials() {
  const {
    testimonials,
    loading,
    error,
    pagination,
    fetchTestimonials,
    addTestimonial,
    updateTestimonial,
    deleteTestimonial,
    toggleStatus,
  } = useTestimonialStore();

  const [search, setSearchState] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus, setFilterStatusState] = useState("All");
  const [page, setPage] = useState(1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (value: string) => {
    setSearchState(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 1000);
  };

  const setFilterStatus = (value: string) => { setFilterStatusState(value); setPage(1); };

  const load = useCallback(async (p: number, s: string, status: string) => {
    await fetchTestimonials(p, s, status === "All" ? "" : status);
  }, []);

  useEffect(() => {
    load(page, debouncedSearch, filterStatus);
  }, [page, debouncedSearch, filterStatus]);

  const handlePageChange = (p: number) => setPage(p);

  const handleAdd = async (data: Omit<Testimonial, "id">) => {
    try {
      await addTestimonial(data);
      toast.success("Testimonial added.");
      load(page, debouncedSearch, filterStatus);
    } catch {
      toast.error("Failed to add testimonial.");
      throw new Error();
    }
  };

  const handleUpdate = async (id: number, data: Omit<Testimonial, "id">) => {
    try {
      await updateTestimonial(id, data);
      toast.success("Testimonial updated.");
    } catch {
      toast.error("Failed to update testimonial.");
      throw new Error();
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTestimonial(id);
      toast.success("Testimonial deleted.");
      load(page, debouncedSearch, filterStatus);
    } catch {
      toast.error("Failed to delete testimonial.");
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await toggleStatus(id);
    } catch {
      toast.error("Failed to update status.");
    }
  };

  return {
    testimonials,
    search,
    filterStatus,
    loading,
    error,
    pagination,
    page,
    setSearch: handleSearchChange,
    setFilterStatus,
    refetch: () => load(page, debouncedSearch, filterStatus),
    handlePageChange,
    handleAdd,
    handleUpdate,
    handleDelete,
    handleToggleStatus,
  };
}
