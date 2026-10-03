import {
  Bell,
  Heart,
  LogIn,
  LogOut,
  Menu,
  MessageSquare,
  ShoppingCart,
  Store,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../../features/auth/state/authStore";
import { useLogout } from "../../../features/auth/hooks/useLogout";
import { ROUTES } from "../../../shared/constants/routes";

export default function TopHeader() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const { logout, isLoading } = useLogout();

  return (
    <header className="flex min-h-16 items-center justify-between gap-4 border-b border-stone-200 bg-white px-4 py-3 sm:px-5 lg:px-6">
      <Link to="/map" className="flex shrink-0 items-center gap-2">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-700 text-base font-bold text-white">
          H
        </span>
        <span className="hidden text-lg font-bold text-stone-900 sm:inline">
          HyperLocal<span className="text-emerald-700">Market</span>
        </span>
      </Link>

      <nav className="hidden items-center gap-5 text-sm text-stone-600 lg:flex">
        <Link to="/stores" className="hover:text-emerald-700">
          Browse stores
        </Link>
        <Link
          to={isAuthenticated ? "/seller/stores" : ROUTES.AUTH.REGISTER}
          className="inline-flex items-center gap-2 hover:text-emerald-700"
        >
          <Store className="h-4 w-4" />
          Sell on HLM
        </Link>
      </nav>

      <div className="flex items-center gap-2 sm:gap-3">
        {isAuthenticated ? (
          <>
            <button
              type="button"
              className="hidden rounded-xl p-2.5 text-stone-500 hover:bg-stone-100 md:block"
              aria-label="Messages"
            >
              <MessageSquare className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="hidden rounded-xl p-2.5 text-stone-500 hover:bg-stone-100 md:block"
              aria-label="Favorites"
            >
              <Heart className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="relative hidden rounded-xl p-2.5 text-stone-500 hover:bg-stone-100 md:block"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                2
              </span>
            </button>
            <div className="hidden items-center gap-2 sm:flex">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                <UserRound className="h-5 w-5" />
              </span>
              {user?.name && (
                <span className="hidden max-w-28 truncate text-sm font-medium text-stone-700 xl:inline">
                  {user.name}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={logout}
              disabled={isLoading}
              className="hidden items-center gap-2 rounded-xl border border-stone-300 px-3 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60 sm:inline-flex"
            >
              <LogOut className="h-4 w-4" />
              {isLoading ? "Logging out..." : "Logout"}
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="hidden items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-100 sm:inline-flex"
            >
              <LogIn className="h-4 w-4" />
              Log in
            </Link>
            <Link
              to="/register"
              className="hidden rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 sm:inline-flex"
            >
              Register
            </Link>
          </>
        )}

        <button
          type="button"
          className="relative rounded-xl p-2.5 text-stone-600 hover:bg-stone-100"
          aria-label="Shopping cart"
        >
          <ShoppingCart className="h-5 w-5" />
          <span className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            0
          </span>
        </button>

        <button
          type="button"
          className="rounded-xl p-2.5 text-stone-600 hover:bg-stone-100 sm:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}

