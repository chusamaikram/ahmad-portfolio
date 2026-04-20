import { useEffect, useCallback, useState } from "react";
import { toast } from "react-toastify";
import {
  fetchContactQueries,
  deleteContactQuery,
  markContactQueryRead,
  markAllContactQueriesRead,
} from "../services/contact";
import { useContactQueryStore } from "@/src/store/useContactQueryStore";

export default function useContactQueries() {
  const { setQueries, deleteQuery, markRead, markAllRead } = useContactQueryStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchContactQueries();
      setQueries(data);
    } catch {
      setError("Failed to load contact queries.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Always refetch on mount + poll every 30 seconds for live updates
  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await markContactQueryRead(id);
      markRead(id); // sync store optimistically
    } catch {
      toast.error("Failed to mark as read.");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllContactQueriesRead();
      markAllRead(); // sync store
    } catch {
      toast.error("Failed to mark all as read.");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteContactQuery(id);
      deleteQuery(id); // sync store
      toast.success("Query deleted.");
    } catch {
      toast.error("Failed to delete query.");
    }
  };

  return { loading, error, refetch: load, handleMarkRead, handleMarkAllRead, handleDelete };
}
