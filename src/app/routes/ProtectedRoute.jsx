import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../features/auth/state/authStore";
import { ROUTES } from "../../shared/constants/routes";

export default function ProtectedRoute() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to={ROUTES.AUTH.LOGIN} state={{ from: location.pathname }} replace />;
    }
    return <Outlet />;
}