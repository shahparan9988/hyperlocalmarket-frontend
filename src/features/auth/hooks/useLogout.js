import { useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";
import { authStorage } from "../services/authStorage";
import { useAuthStore } from "../state/authStore";

export function useLogout() {
    const navigate = useNavigate();
    const clearAuth = useAuthStore((state) => state.clearAuth);

    const logout = async () => {
        try {
            await authApi.logout();
        } catch (err) {
            console.error("Logout failed:", err);
        } finally {
            authStorage.clearLoginData();
            clearAuth();
            navigate("/login");
        }
    };

    return { logout };
}
