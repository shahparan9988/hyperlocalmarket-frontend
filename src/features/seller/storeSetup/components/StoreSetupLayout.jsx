import { AlertCircle, LoaderCircle } from "lucide-react";
import { useEffect } from "react";
import { Outlet, useParams } from "react-router-dom";
import { useStoreSetupStore } from "../state/useStoreSetupStore";
import StoreSetupSidebar from "./StoreSetupSidebar";

export default function StoreSetupLayout() {
  const { storeId } = useParams();
  const store = useStoreSetupStore((state) => state.store);
  const setupStatus = useStoreSetupStore((state) => state.setupStatus);
  const isLoading = useStoreSetupStore((state) => state.isLoading);
  const error = useStoreSetupStore((state) => state.error);
  const loadStore = useStoreSetupStore((state) => state.loadStore);

  useEffect(() => {
    void loadStore(storeId);
  }, [loadStore, storeId]);

  const hasCurrentStore = String(store?.id).toLowerCase() === storeId?.toLowerCase() &&
    String(setupStatus?.storeId).toLowerCase() === storeId?.toLowerCase();

  if (!hasCurrentStore) {
    if (error && !isLoading) {
      return (
        <div className="hlm-setup-load-error" role="alert">
          <AlertCircle size={22} />
          <div>
            <strong>We could not load this store.</strong>
            <p>{error}</p>
            <button className="hlm-btn hlm-btn-secondary" type="button"
              onClick={() => loadStore(storeId)}>Try again</button>
          </div>
        </div>
      );
    }

    return (
      <div className="hlm-setup-loading" role="status">
        <LoaderCircle className="hlm-spin" size={24} /> Loading store setup…
      </div>
    );
  }

  return (
    <section className="hlm-setup-page">
      <div className="hlm-setup-page-heading">
        <div>
          <span className="hlm-seller-eyebrow">Seller onboarding</span>
          <h1>Store setup</h1>
          <p>
            Business info, location and contact are required to publish. The
            remaining sections can be completed later.
          </p>
        </div>
        <span className="hlm-seller-status-badge">{store.status}</span>
      </div>
      <div className="hlm-setup-grid">
        <StoreSetupSidebar />
        <div className="hlm-setup-panel"><Outlet key={storeId} /></div>
      </div>
    </section>
  );
}
