import { Navigate, Route } from "react-router-dom";
import SellerLayout from "../layouts/SellerLayout";
import SellerPlaceholderPage from "../../features/seller/components/SellerPlaceholderPage";
import {
  BrandingPage,
  BusinessHoursPage,
  BusinessInfoPage,
  ContactPage,
  CreateStorePage,
  LocationPage,
  PickupDeliveryPage,
  PublishStorePage,
  StoreSetupLayout,
} from "../../features/seller/storeSetup";
import SellerStoresPage from
  "../../features/seller/stores/pages/SellerStoresPage";
  import { ProductsLayout, ProductsPage, ProductEditorPage } from "../../features/seller/products";
  import { InventoryOverviewPage } from "../../features/seller/inventory";

export const sellerRoutes = (
  <>

    <Route path="/seller/stores" element={<SellerStoresPage />} />
    <Route
      path="/seller/stores/new"
      element={<SellerLayout isCreateMode />}
    >
      <Route index element={<CreateStorePage />} />
    </Route>

    <Route path="/seller/stores/:storeId" element={<SellerLayout />}>
      <Route index element={<Navigate to="setup" replace />} />

      <Route
        path="overview"
        element={<SellerPlaceholderPage title="Overview" />}
      />

      <Route path="setup" element={<StoreSetupLayout />}>
        <Route index element={<Navigate to="business-info" replace />} />
        <Route path="business-info" element={<BusinessInfoPage />} />
        <Route path="location" element={<LocationPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="branding" element={<BrandingPage />} />
        <Route path="business-hours" element={<BusinessHoursPage />} />
        <Route path="pickup-delivery" element={<PickupDeliveryPage />} />
        <Route path="publish" element={<PublishStorePage />} />
      </Route>

      <Route path="products" element={<ProductsLayout />}>
        <Route index element={<ProductsPage />} />
        <Route path="new" element={<ProductEditorPage />} />
        <Route path=":productId/edit" element={<ProductEditorPage />} />
      </Route>
      
      <Route path="inventory" element={<InventoryOverviewPage />} />
      
      <Route
        path="orders"
        element={<SellerPlaceholderPage title="Orders" />}
      />
    </Route>
  </>
);

export default sellerRoutes;
