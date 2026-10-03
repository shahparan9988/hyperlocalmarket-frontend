import { Outlet } from "react-router-dom";

export default function AuthLayout() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
          <Outlet />
        </main>
    );

}