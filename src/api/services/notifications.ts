import api from "../axiosInstance";
import { API_ENDPOINTS } from "../endpoints";

export interface Notification {
    id: number;
    title: string;
    body: string;
    type: string;
    is_read: boolean;
    data: Record<string, any>;
    created_at: string;
}

export interface PaginatedNotifications {
    count: number;
    next: string | null;
    previous: string | null;
    results: Notification[];
}

export const GetNotifications = async (): Promise<PaginatedNotifications> => {
    const response = await api.get(API_ENDPOINTS.NOTIFICATIONS.GET_ALL);
    return response.data;
};

export const GetUnreadNotificationsCount = async (): Promise<number> => {
    const response = await api.get(API_ENDPOINTS.NOTIFICATIONS.GET_UNREAD_COUNT);
    return response.data.unread_count;
};

export const GetOneNotification = async (id: number): Promise<Notification> => {
    const response = await api.get(API_ENDPOINTS.NOTIFICATIONS.GET_ONE(id));
    return response.data;
};

export const MarkNotificationAsRead = async (id: number): Promise<Notification> => {
    const response = await api.post(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
    return response.data;
};

export const MarkAllNotificationsAsRead = async (): Promise<Notification> => {
    const response = await api.post(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
    return response.data;
};
