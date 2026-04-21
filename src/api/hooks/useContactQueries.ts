import { useEffect, useCallback, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  fetchContactQueries,
  deleteContactQuery,
  markContactQueryRead,
  markAllContactQueriesRead,
} from "../services/contact";
import { useContactQueryStore } from "@/src/store/useContactQueryStore";

export default function useContactQueries() {
  const { setQueries, deleteQuery, markRead, markAllRead, pagination } = useContactQueryStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [search, setSearchState] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterRead, setFilterReadState] = useState("All");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (value: string) => {
    setSearchState(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 1000);
  };

  const setFilterRead = (value: string) => { setFilterReadState(value); setPage(1); };

  const load = useCallback(async (p: number, s: string, status: string) => {
    setLoading(true);
    setError("");
    try {
      const apiStatus = status === "All" ? "" : status.toLowerCase();
      const { results, pagination: pg } = await fetchContactQueries(p, s, apiStatus);
      setQueries(results, pg);
    } catch {
      setError("Failed to load contact queries.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(page, debouncedSearch, filterRead);
    const interval = setInterval(() => load(page, debouncedSearch, filterRead), 30000);
    return () => clearInterval(interval);
  }, [page, debouncedSearch, filterRead]);

  const handlePageChange = (p: number) => setPage(p);

  const handleMarkRead = async (id: number) => {
    try {
      await markContactQueryRead(id);
      markRead(id);
    } catch {
      toast.error("Failed to mark as read.");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllContactQueriesRead();
      markAllRead();
    } catch {
      toast.error("Failed to mark all as read.");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteContactQuery(id);
      deleteQuery(id);
      toast.success("Query deleted.");
    } catch {
      toast.error("Failed to delete query.");
    }
  };

  return {
    loading,
    error,
    pagination,
    page,
    search,
    filterRead,
    setSearch: handleSearchChange,
    setFilterRead,
    handlePageChange,
    refetch: () => load(page, debouncedSearch, filterRead),
    handleMarkRead,
    handleMarkAllRead,
    handleDelete,
  };
}
