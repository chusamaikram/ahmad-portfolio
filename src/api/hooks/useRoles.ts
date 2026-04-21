import { useEffect, useCallback, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useRolesStore } from "@/src/store/useRolesStore";
import type { RoleUser } from "@/src/store/useRolesStore";

export default function useRoles() {
  const {
    users,
    loading,
    error,
    pagination,
    fetchUsers,
    addUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
  } = useRolesStore();

  const [search, setSearchState] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilterState] = useState("All Roles");
  const [statusFilter, setStatusFilterState] = useState("All Status");
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

  const setRoleFilter = (value: string) => { setRoleFilterState(value); setPage(1); };
  const setStatusFilter = (value: string) => { setStatusFilterState(value); setPage(1); };

  const load = useCallback(async (p: number, s: string, role: string, status: string) => {
    await fetchUsers(
      p,
      s,
      role === "All Roles" ? "" : role,
      status === "All Status" ? "" : status,
    );
  }, []);

  useEffect(() => {
    load(page, debouncedSearch, roleFilter, statusFilter);
  }, [page, debouncedSearch, roleFilter, statusFilter]);

  const handlePageChange = (p: number) => setPage(p);

  const handleAdd = async (data: Omit<RoleUser, "id" | "added">) => {
    try {
      await addUser(data);
      toast.success("User added.");
      load(page, debouncedSearch, roleFilter, statusFilter);
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
      load(page, debouncedSearch, roleFilter, statusFilter);
    } catch {
      toast.error("Failed to delete user.");
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await toggleUserStatus(id);
      toast.success("User status updated.");
      load(page, debouncedSearch, roleFilter, statusFilter);
    } catch {
      toast.error("Failed to update user status.");
    }
  };

  return {
    users,
    search,
    roleFilter,
    statusFilter,
    loading,
    error,
    pagination,
    page,
    setSearch: handleSearchChange,
    setRoleFilter,
    setStatusFilter,
    refetch: () => load(page, debouncedSearch, roleFilter, statusFilter),
    handlePageChange,
    handleAdd,
    handleUpdate,
    handleDelete,
    handleToggleStatus,
  };
}
