import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../features/auth/state/authStore";
import { ROUTES } from "../../shared/constants/routes";

export default function GuestRoute() {
    const isAuthenticated = useAuthStore(
        (state) => state.isAuthenticated
    );

    // if (isAuthenticated) {
    //     return (
    //         <Navigate
    //             to={ROUTES.HOME}
    //             replace
    //         />
    //     );
    // }

    return <Outlet />;
}