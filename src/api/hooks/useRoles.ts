import { useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { useRolesStore } from "@/src/store/useRolesStore";
import type { RoleUser } from "@/src/store/useRolesStore";

export default function useRoles() {
  const {
    users,
    search,
    roleFilter,
    statusFilter,
    loading,
    error,
    setSearch,
    setRoleFilter,
    setStatusFilter,
    fetchUsers,
    addUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
  } = useRolesStore();

  const load = useCallback(async () => {
    await fetchUsers();
  }, []);

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (data: Omit<RoleUser, "id" | "added">) => {
    try {
      await addUser(data);
      toast.success("User added.");
    } catch {
      toast.error("Failed to add user.");
      throw new Error();
    }
  };

  const handleUpdate = async (id: number, data: Omit<RoleUser, "id" | "added">) => {
    try {
      await updateUser(id, data);
      toast.success("User updated.");
    } catch {
      toast.error("Failed to update user.");
      throw new Error();
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteUser(id);
      toast.success("User removed.");
    } catch {
      toast.error("Failed to delete user.");
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await toggleUserStatus(id);
      toast.success("User status updated.");
    } catch {
      toast.error("Failed to update user status.");
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "All Roles" || u.role === roleFilter;
    const matchStatus = statusFilter === "All Status" || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  return {
    users,
    filtered,
    search,
    roleFilter,
    statusFilter,
    loading,
    error,
    setSearch,
    setRoleFilter,
    setStatusFilter,
    refetch: load,
    handleAdd,
    handleUpdate,
    handleDelete,
    handleToggleStatus,
  };
}
