import { useUserStore } from "@/src/store/useUserStore";
import { login, logout } from "../services/auth";
import { toast } from "react-toastify";

export default function useAuth() {
  const setUser = useUserStore((state) => state.setUser)

  const loginUser = async (email: string, password: string) => {
    try {
      const response = await login(email, password)
      document.cookie = `token=${response.access}; path=/; samesite=lax`;
      document.cookie = `refresh=${response.refresh}; path=/; samesite=lax`;
      const role = response.user?.role ?? response.role;
      if (role) document.cookie = `role=${role}; path=/; samesite=lax`;
      setUser({ email: response.user?.email ?? email, name: response.user?.name ?? response.name, role: response.user?.role ?? response.role })
      return true

    } catch (err: any) {
      toast.error(err.response?.data?.error || "Login failed")
      return false;
    }
  }

  const logoutUser = () => {
    logout();
  }

  return {
    loginUser,
    logoutUser
  }
}