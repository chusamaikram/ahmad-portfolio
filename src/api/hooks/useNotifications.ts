import { useEffect, useCallback, useState } from "react";
import { toast } from "react-toastify";
import {
    GetNotifications,
    GetUnreadNotificationsCount,
    MarkNotificationAsRead,
    MarkAllNotificationsAsRead,
} from "../services/notifications";
import { useNotificationStore } from "@/src/store/useNotificationStore";

export default function useNotifications() {
    const { setNotifications, syncNotification, setMarkAllRead } = useNotificationStore();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const [data, unread_count] = await Promise.all([
                GetNotifications(),
                GetUnreadNotificationsCount(),
            ]);
            setNotifications(data.results, unread_count);
        } catch {
            setError("Failed to load notifications.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
        const interval = setInterval(load, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleMarkRead = async (id: number) => {
        try {
            const updated = await MarkNotificationAsRead(id);
            syncNotification(updated);
        } catch {
            toast.error("Failed to mark as read.");
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await MarkAllNotificationsAsRead();
            // re-fetch to get the full updated list since API returns single object
            const data = await GetNotifications();
            setMarkAllRead(data.results);
        } catch {
            toast.error("Failed to mark all as read.");
        }
    };

    return { loading, error, refetch: load, handleMarkRead, handleMarkAllRead };
}
