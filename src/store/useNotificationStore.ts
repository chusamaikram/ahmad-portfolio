import { create } from "zustand";
import { Notification } from "../api/services/notifications";

export type NotificationStore = {
    notifications: Notification[];
    unread_count: number;
    setNotifications: (notifications: Notification[], unread_count: number) => void;
    syncNotification: (notification: Notification) => void;
    setMarkAllRead: (notifications: Notification[]) => void;
};

export const useNotificationStore = create<NotificationStore>((set) => ({
    notifications: [],
    unread_count: 0,

    setNotifications: (notifications, unread_count) => set({ notifications, unread_count }),

    syncNotification: (notification) =>
        set((state) => ({
            notifications: state.notifications.map((n) =>
                n.id === notification.id ? notification : n
            ),
            unread_count: notification.is_read
                ? Math.max(0, state.unread_count - 1)
                : state.unread_count,
        })),

    setMarkAllRead: (notifications) =>
        set({ notifications, unread_count: 0 }),
}));
