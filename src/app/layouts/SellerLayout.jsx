import { Outlet } from "react-router-dom";
import SellerHeader from "../../features/seller/components/SellerHeader";
import SellerSidebar from "../../features/seller/components/SellerSidebar";
import "../../features/seller/storeSetup/sellerStoreSetup.css";
import "../../features/seller/storeSetup/sellerLightTheme.css";

export default function SellerLayout({ isCreateMode = false }) {
  return (
    <div className="hlm-seller-shell">
      <SellerSidebar isCreateMode={isCreateMode}/>
      <div className="hlm-seller-stage">
        <SellerHeader isCreateMode={isCreateMode}/>
        <main className="hlm-seller-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
