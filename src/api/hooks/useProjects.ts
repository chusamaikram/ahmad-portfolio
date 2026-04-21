import { useEffect, useCallback, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useProjectStore } from "@/src/store/useProjectStore";
import type { Project } from "@/src/store/useProjectStore";

export default function useProjects() {
  const {
    projects,
    loading,
    error,
    pagination,
    fetchProjects,
    addProject,
    updateProject,
    deleteProject,
  } = useProjectStore();

  const [search, setSearchState] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus, setFilterStatusState] = useState("All");
  const [filterCategory, setFilterCategoryState] = useState("All");
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
  const setFilterCategory = (value: string) => { setFilterCategoryState(value); setPage(1); };

  const load = useCallback(async (p: number, s: string, status: string, category: string) => {
    await fetchProjects(
      p,
      s,
      status === "All" ? "" : status,
      category === "All" ? "" : category,
    );
  }, []);

  useEffect(() => {
    load(page, debouncedSearch, filterStatus, filterCategory);
  }, [page, debouncedSearch, filterStatus, filterCategory]);

  const handlePageChange = (p: number) => setPage(p);

  const handleAdd = async (data: Omit<Project, "id">) => {
    try {
      await addProject(data);
      toast.success("Project added.");
      load(page, debouncedSearch, filterStatus, filterCategory);
    } catch {
      toast.error("Failed to add project.");
      throw new Error();
    }
  };

  const handleUpdate = async (id: number, data: Omit<Project, "id">) => {
    try {
      await updateProject(id, data);
      toast.success("Project updated.");
    } catch {
      toast.error("Failed to update project.");
      throw new Error();
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteProject(id);
      toast.success("Project deleted.");
      load(page, debouncedSearch, filterStatus, filterCategory);
    } catch {
      toast.error("Failed to delete project.");
    }
  };

  return {
    projects,
    search,
    filterStatus,
    filterCategory,
    loading,
    error,
    pagination,
    page,
    setSearch: handleSearchChange,
    setFilterStatus,
    setFilterCategory,
    refetch: () => load(page, debouncedSearch, filterStatus, filterCategory),
    handlePageChange,
    handleAdd,
    handleUpdate,
    handleDelete,
  };
}
