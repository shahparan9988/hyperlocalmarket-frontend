import { useAuthStore } from "../state/authStore";

export function useAuth() {
    const { user, userId, isAuthenticated } = useAuthStore((state) => ({
        user: state.user,
        userId: state.userId,
        isAuthenticated: state.isAuthenticated,
    }));

    return {
        user,
        userId,
        isAuthenticated,
    };
}