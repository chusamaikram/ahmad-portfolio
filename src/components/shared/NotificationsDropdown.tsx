"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useNotificationStore } from "@/src/store";
import { MarkNotificationAsRead, MarkAllNotificationsAsRead, GetNotifications } from "@/src/api/services/notifications";
import { toast } from "react-toastify";
import { notificationTypeConfig } from "./notificationTypeConfig";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { notifications, unread_count, syncNotification, setMarkAllRead } = useNotificationStore();
  async function handleMarkRead(id: number) {
    try {
      const updated = await MarkNotificationAsRead(id);
      syncNotification(updated);
    } catch {
      toast.error("Failed to mark as read.");
    }
  }

  async function handleMarkAllRead() {
    try {
      await MarkAllNotificationsAsRead();
      const data = await GetNotifications();
      setMarkAllRead(data.results);
    } catch {
      toast.error("Failed to mark all as read.");
    }
  }

  function handleNotificationClick(id: number, type: string) {
    handleMarkRead(id);
    setOpen(false);
    if (type === "query_submitted") router.push(`/admin/contact-queries?id=${id}`);
    else if (type === "project_updated" || "project_created") router.push("/admin/projects");
    else router.push("/admin/notifications");
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative text-gray-400 hover:text-violet-400 transition-colors p-1"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread_count > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-violet-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
            {unread_count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl shadow-black/20 dark:shadow-black/40 z-50 overflow-hidden"
          style={{ animation: "fadeSlideDown 0.18s ease" }}>
          <style>{`
            @keyframes fadeSlideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
            .notif-scroll::-webkit-scrollbar{width:4px}
            .notif-scroll::-webkit-scrollbar-track{background:transparent}
            .notif-scroll::-webkit-scrollbar-thumb{background:#4c1d95;border-radius:999px}
            .notif-scroll::-webkit-scrollbar-thumb:hover{background:#6d28d9}
          `}</style>

          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</span>
              {unread_count > 0 && (
                <span className="text-xs bg-violet-600 text-white px-1.5 py-0.5 rounded-full font-medium">{unread_count}</span>
              )}
            </div>
            {unread_count > 0 && (
              <button onClick={handleMarkAllRead} className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                Mark all read
              </button>
            )}
          </div>

          <div className="notif-scroll max-h-72 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800/60">
            {notifications.length === 0 && (
              <p className="text-xs text-gray-500 text-center py-8">No notifications</p>
            )}
            {notifications.slice(0, 10).map((n) => (
              <button key={n.id} onClick={() => handleNotificationClick(n.id, n.type)}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${!n.is_read ? "bg-gray-50 dark:bg-gray-800/30" : ""}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${(notificationTypeConfig[n.type] ?? notificationTypeConfig.system).bg} ${(notificationTypeConfig[n.type] ?? notificationTypeConfig.system).text}`}>
                  {(notificationTypeConfig[n.type] ?? notificationTypeConfig.system).icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold ${n.is_read ? "text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-white"}`}>{n.title}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{n.body}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">{timeAgo(n.created_at)}</p>
                </div>
                {!n.is_read && <span className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0 mt-1.5" />}
              </button>
            ))}
          </div>

          <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800">
            <a href="/admin/notifications" className="text-xs text-violet-400 hover:text-violet-300 transition-colors font-medium">
              View all notifications →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
