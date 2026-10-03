import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import MapPage from "../../features/map/pages/MapPage";
import StoresPage from "../../features/stores/pages/StoresPage";
import GuestRoute from "./GuestRoute";
import ProtectedRoute from "./ProtectedRoute";
import { ROUTES } from "../../shared/constants/routes";
import { sellerRoutes } from "./sellerRoutes";
import { CreateStorePage } from "../../features/seller/storeSetup";
import {
  ForgotPasswordPage,
  LoginPage,
  RegisterPage,
  ResetPasswordPage,
  VerifyEmailPage,
} from "../../features/auth";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to={ROUTES.MAP} replace />} />
        <Route path="map" element={<MapPage />} />
        <Route path="stores" element={<StoresPage />} />
      </Route>

      <Route element={<GuestRoute />}>
        <Route element={<AuthLayout />}>
          <Route
            path={ROUTES.AUTH.FORGOT_PASSWORD}
            element={<ForgotPasswordPage />}
          />
          <Route
            path={ROUTES.AUTH.RESET_PASSWORD}
            element={<ResetPasswordPage />}
          />
          <Route
            path={ROUTES.AUTH.VERIFY_EMAIL}
            element={<VerifyEmailPage />}
          />
          <Route path={ROUTES.AUTH.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.AUTH.REGISTER} element={<RegisterPage />} />
        </Route>
      </Route>

      {/* Logged-in seller routes */}
      <Route element={<ProtectedRoute />}>
        {sellerRoutes}   
      </Route>

      <Route path="*" element={<Navigate to={ROUTES.MAP} replace />} />
    </Routes>
  );
}

