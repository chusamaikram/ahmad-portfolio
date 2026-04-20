import { useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { useTestimonialStore } from "@/src/store/useTestimonialStore";
import type { Testimonial } from "@/src/store/useTestimonialStore";

export default function useTestimonials() {
  const {
    testimonials,
    search,
    filterStatus,
    loading,
    error,
    setSearch,
    setFilterStatus,
    fetchTestimonials,
    addTestimonial,
    updateTestimonial,
    deleteTestimonial,
    toggleStatus,
  } = useTestimonialStore();

  const load = useCallback(async () => {
    await fetchTestimonials();
  }, []);

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (data: Omit<Testimonial, "id">) => {
    try {
      await addTestimonial(data);
      toast.success("Testimonial added.");
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

  const filtered = testimonials.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.company.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return {
    testimonials,
    filtered,
    search,
    filterStatus,
    loading,
    error,
    setSearch,
    setFilterStatus,
    refetch: load,
    handleAdd,
    handleUpdate,
    handleDelete,
    handleToggleStatus,
  };
}
