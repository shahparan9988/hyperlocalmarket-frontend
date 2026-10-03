import { CircleHelp, ExternalLink, UserRound } from "lucide-react";
import { useStoreSetupStore } from "../storeSetup/state/useStoreSetupStore";

export default function SellerHeader( { isCreateMode = false } ) {
  const store = useStoreSetupStore((state) => state.store);
  const storeName = isCreateMode
    ? "Create your store"
    : store?.name || "Your store";

  const status = isCreateMode ? "Draft" : store?.status || "Draft";

  return (
    <header className="hlm-seller-header">
      <div className="hlm-seller-header-copy">
        <span className="hlm-seller-eyebrow">Seller workspace</span>
        <strong>{storeName}</strong>
      </div>

      <div className="hlm-seller-header-actions">
        <span className="hlm-seller-status-badge">
          {status}
        </span>

        {!isCreateMode && store?.slug && (
          <a
            className="hlm-seller-icon-link"
            href={`/stores/${store.slug}`}
            aria-label="View public store"
          >
            <ExternalLink size={18} />
          </a>
        )}
        <button className="hlm-seller-icon-button" type="button" aria-label="Help">
          <CircleHelp size={19} />
        </button>
        <span className="hlm-seller-avatar" aria-hidden="true">
          <UserRound size={19} />
        </span>
      </div>
    </header>
  );
}
