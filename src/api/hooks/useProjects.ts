import { useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { useProjectStore } from "@/src/store/useProjectStore";
import type { Project } from "@/src/store/useProjectStore";

export default function useProjects() {
  const {
    projects,
    search,
    filterStatus,
    loading,
    error,
    setSearch,
    setFilterStatus,
    fetchProjects,
    addProject,
    updateProject,
    deleteProject,
  } = useProjectStore();

  const load = useCallback(async () => {
    await fetchProjects();
  }, []);

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (data: Omit<Project, "id">) => {
    try {
      await addProject(data);
      toast.success("Project added.");
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
    } catch {
      toast.error("Failed to delete project.");
    }
  };

  const filtered = projects.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return {
    projects,
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
  };
}
