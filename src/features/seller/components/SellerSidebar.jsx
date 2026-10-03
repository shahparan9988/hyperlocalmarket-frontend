import {
  Boxes,
  ClipboardList,
  LayoutDashboard,
  PackageSearch,
  Settings2,
  Store,
} from "lucide-react";
import { NavLink, useParams } from "react-router-dom";

const navigation = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "setup", label: "Store setup", icon: Settings2 },
  { key: "products", label: "Products", icon: PackageSearch },
  { key: "inventory", label: "Inventory", icon: Boxes },
  { key: "orders", label: "Orders", icon: ClipboardList },
];

export default function SellerSidebar( { isCreateMode = false } ) {
  const { storeId } = useParams();
  const basePath = `/seller/stores/${storeId}`;

  return (
    <aside className="hlm-seller-sidebar" aria-label="Seller workspace">
      <NavLink to="/map" className="hlm-seller-brand">
        <span className="hlm-seller-brand-mark">
          <Store size={19} />
        </span>
        <span>
          <strong>HLM Seller</strong>
          <small>Store workspace</small>
        </span>
      </NavLink>

      <nav className="hlm-seller-main-nav">
        {navigation.map(({ key, label, icon: Icon }) => {
            if (isCreateMode && key !== "setup") {
                return (
                    <span
                        key={key}
                        className="hlm-seller-main-link is-disabled"
                        aria-disabled="true"
                    >
                        <Icon size={18} strokeWidth={1.8} />
                        <span>{label}</span>
                    </span>
                );
            }

            const to = isCreateMode
                ? "/seller/stores/new"
                : `${basePath}/${key}`;
            return (
              <NavLink
                key={key}
                to={to}
                className={({ isActive }) =>
                    `hlm-seller-main-link${isActive ? " is-active" : ""}`
                }
              >
                <Icon size={18} strokeWidth={1.8} />
                <span>{label}</span>
               </NavLink>
            );
        })}
      </nav>
    </aside>
  );
}

