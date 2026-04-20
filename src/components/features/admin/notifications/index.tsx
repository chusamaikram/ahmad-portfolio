"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNotificationStore } from "@/src/store";
import useNotifications from "@/src/api/hooks/useNotifications";
import { notificationTypeConfig } from "@/src/components/shared/notificationTypeConfig";

const filters = ["All", "Unread"];

export default function NotificationsView() {
  const [activeFilter, setActiveFilter] = useState("All");
  const router = useRouter();

  console.log("notifications")

  const { notifications, unread_count } = useNotificationStore();
  const { loading, handleMarkRead, handleMarkAllRead } = useNotifications();

  function handleNotificationClick(id: number, type: string) {
    handleMarkRead(id);
    if (type === "message") router.push(`/admin/contact-queries?id=${id}`);
    else if (type === "project") router.push("/admin/projects");
    else if (type === "testimonial") router.push("/admin/testimonials");
  }

  const filtered = notifications.filter((n) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Unread") return !n.is_read;
    return n.type === activeFilter.toLowerCase().slice(0, -1) || n.type === activeFilter.toLowerCase();
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">All Notifications</h2>
          <p className="text-sm text-gray-500 mt-0.5">{unread_count} unread notification{unread_count !== 1 ? "s" : ""}</p>
        </div>
        {unread_count > 0 && (
          <button onClick={handleMarkAllRead}
            className="text-sm text-violet-400 hover:text-violet-300 border border-violet-800 hover:border-violet-600 px-4 py-1.5 rounded-lg transition-all">
            Mark all as read
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button key={f} onClick={() => setActiveFilter(f)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
              activeFilter === f
                ? "bg-violet-600 border-violet-600 text-white"
                : "bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-600 hover:text-gray-900 dark:hover:text-white"
            }`}>
            {f}
            {f === "Unread" && unread_count > 0 && (
              <span className="ml-1.5 bg-violet-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{unread_count}</span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-800/60">
        {loading && (
          <div className="py-16 text-center text-gray-500 text-sm">Loading...</div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="py-16 text-center text-gray-600">
            <svg className="w-10 h-10 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            No notifications found
          </div>
        )}
        {!loading && filtered.map((n) => {
          const cfg = notificationTypeConfig[n.type] ?? notificationTypeConfig.system;
          return (
            <div key={n.id} onClick={() => handleNotificationClick(n.id, n.type)}
              className={`flex items-start gap-4 px-5 py-4 group transition-colors cursor-pointer ${!n.is_read ? "bg-violet-50 dark:bg-gray-900/60" : "hover:bg-gray-50 dark:hover:bg-gray-900/30"}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.bg} ${cfg.text}`}>
                {cfg.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-semibold ${n.is_read ? "text-gray-500 dark:text-gray-300" : "text-gray-900 dark:text-white"}`}>{n.title}</p>
                  <span className="text-xs text-gray-400 dark:text-gray-600 whitespace-nowrap flex-shrink-0">{n.created_at}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.body}</p>
                {!n.is_read && (
                  <button onClick={(e) => { e.stopPropagation(); handleMarkRead(n.id); }}
                    className="mt-2 text-xs text-violet-400 hover:text-violet-300 transition-colors">
                    Mark as read
                  </button>
                )}
              </div>
              {!n.is_read && <span className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0 mt-2" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
