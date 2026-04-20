"use client";

import NotificationsDropdown from "./NotificationsDropdown";
import ProfileDropdown from "./ProfileDropdown";
import ThemeToggle from "./ThemeToggle";
import { useUserStore } from "@/src/store/useUserStore";
import useAuth from "@/src/api/hooks/useAuth";
import useNotifications from "@/src/api/hooks/useNotifications";
import { usePathname } from "next/navigation";

const titles: Record<string, { title: string; subtitle?: string }> = {
  "/admin/dashboard": { title: "Dashboard" },
  "/admin/services": { title: "Services" },
  "/admin/projects": { title: "Projects" },
  "/admin/testimonials": { title: "Testimonials" },
  "/admin/contact-queries": { title: "Contact Queries" },
  "/admin/notifications": { title: "Notifications" },
  "/admin/roles-management": { title: "Manage Roles", subtitle: "Welcome back, Muhammad Ahmad" },
  "/admin/chatbot": { title: "AI Chatbot" },
};

export default function DashboardHeader() {
  const pathname = usePathname();
  if(pathname === '/admin/login') return null
  const entry = titles[pathname] ?? { title: "Admin" };
  const user = useUserStore((state) => state.user)
  const clearUser = useUserStore((state) => state.clearUser)
  const { logoutUser } = useAuth()

  useNotifications();

  return (
    <header className="h-16 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 sticky top-0 z-30 transition-colors duration-300">
      <div>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{entry.title}</h1>
        <p className="text-xs text-gray-500">Welcome back, {user?.name || 'Muhammad Ahmad'}</p>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <NotificationsDropdown />
        <ProfileDropdown logout={logoutUser} user={user} clearUser={clearUser} />

      </div>
    </header>
  );
}
