import { Heart, Home, ShoppingCart, Store, UserRound } from "lucide-react";
import { NavLink } from "react-router-dom";

const navigationItems = [
  { to: "/map", label: "Home", icon: Home },
  { to: "/stores", label: "Stores", icon: Store },
  { to: "/favorites", label: "Saved", icon: Heart },
  { to: "/cart", label: "Cart", icon: ShoppingCart },
  { to: "/account", label: "Account", icon: UserRound },
];

export default function BottomNav() {
  return (
    <nav className="grid grid-cols-5 border-t border-stone-200 bg-white px-2 py-2 md:hidden">
      {navigationItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 rounded-lg px-1 py-1.5 text-[11px] font-medium ${
              isActive ? "text-emerald-700" : "text-stone-500"
            }`
          }
        >
          <Icon className="h-5 w-5" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

