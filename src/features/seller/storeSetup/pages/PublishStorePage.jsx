import {
  CheckCircle2,
  Circle,
  Clock3,
  ContactRound,
  Image,
  LoaderCircle,
  MapPin,
  RefreshCw,
  Rocket,
  Store,
  Truck,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import InlineNotice from "../components/InlineNotice";
import SetupPageHeader from "../components/SetupPageHeader";
import usePublishReadiness from "../hooks/usePublishReadiness";
import { useStoreSetupStore } from "../state/useStoreSetupStore";

const requiredSections = [
  { key: "business-info", label: "Business information", icon: Store },
  { key: "location", label: "Store location", icon: MapPin },
  { key: "contact", label: "Contact and timezone", icon: ContactRound },
];

const optionalSections = [
  { key: "branding", label: "Logo and cover photo", icon: Image },
  { key: "business-hours", label: "Business hours", icon: Clock3 },
  { key: "pickup-delivery", label: "Pickup and delivery", icon: Truck },
];

const fieldLabels = {
  name: "store name",
  countryCode: "country",
  addressLine1: "street address",
  latitude: "map latitude",
  longitude: "map longitude",
  phoneNumber: "valid contact phone number",
  timeZoneId: "timezone matching your country",
};

function RequirementList({ items, statusByKey, storeId, optional = false }) {
  return (
    <div className="hlm-publish-requirements">
      {items.map((item) => {
        const { key, label, icon: Icon } = item;
        const section = statusByKey[key];
        const complete = Boolean(section?.isComplete);
        const missing = (section?.missingFields ?? [])
          .map((field) => fieldLabels[field] ?? field);

        return (
          <Link
            className="hlm-publish-requirement"
            key={key}
            to={`/seller/stores/${storeId}/setup/${key}`}
          >
            <span className="hlm-publish-requirement-icon"><Icon size={18} /></span>
            <span className="hlm-publish-item-copy">
              <strong>{label}</strong>
              {!complete && !optional && (
                <small>{missing.length ? `Check ${missing.join(", ")}.` : "Complete this section."}</small>
              )}
            </span>
            <span className={complete ? "is-ready" : optional ? "is-optional" : "is-missing"}>
              {complete ? <CheckCircle2 size={17} /> : <Circle size={15} />}
              {complete ? "Ready" : optional ? "Optional" : "Complete"}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

function PublishStoreContent({ storeId }) {
  const store = useStoreSetupStore((state) => state.store);
  const setupStatus = useStoreSetupStore((state) => state.setupStatus);
  const isLoading = useStoreSetupStore((state) => state.isLoading);
  const savingSection = useStoreSetupStore((state) => state.savingSection);
  const apiError = useStoreSetupStore((state) => state.error);
  const clearError = useStoreSetupStore((state) => state.clearError);
  const loadStore = useStoreSetupStore((state) => state.loadStore);
  const publishStore = useStoreSetupStore((state) => state.publishStore);
  const setAcceptingOrders = useStoreSetupStore((state) => state.setAcceptingOrders);
  const { sections, canPublish, canAcceptOrders, requiredSetupComplete } = usePublishReadiness();
  const [feedback, setFeedback] = useState(null);

  const statusByKey = Object.fromEntries(sections.map((section) => [section.key, section]));
  const hasCurrentStore = String(store?.id).toLowerCase() === storeId?.toLowerCase() &&
    String(setupStatus?.storeId).toLowerCase() === storeId?.toLowerCase();
  const status = hasCurrentStore ? store.status : null;
  const isPublished = status === "Active";
  const isDraft = status === "Draft";
  const isBusy = isLoading || Boolean(savingSection) || !hasCurrentStore;
  const error = feedback?.type === "error" ? feedback.message : apiError;

  const runAction = async (action, successMessage) => {
    if (isBusy) return;
    setFeedback(null);
    clearError();

    try {
      const result = await action();
      const message = successMessage(result);
      setFeedback({
        type: "success",
        message: result.setupStatusRefreshed
          ? message
          : `${message} The checklist could not refresh. Use Refresh status to update it.`,
      });
    } catch (actionError) {
      setFeedback({
        type: "error",
        message: useStoreSetupStore.getState().error || actionError.message ||
          "The change could not be saved. Please try again.",
      });
    }
  };

  const publish = () => runAction(
    () => publishStore(storeId),
    (result) => result.isAcceptingOrders
      ? "Your store is published and online orders are enabled."
      : "Your store is published. You can enable online orders whenever you are ready."
  );

  const toggleOrders = () => runAction(
    () => setAcceptingOrders(storeId, !store.isAcceptingOrders),
    (result) => result.isAcceptingOrders
      ? "Online orders are enabled."
      : "Online orders are paused. Your store remains published."
  );

  const refresh = async () => {
    if (isBusy) return;
    setFeedback(null);
    await loadStore(storeId);
  };

  return (
    <article className="hlm-setup-card" aria-busy={isBusy}>
      <SetupPageHeader
        icon={Rocket}
        title={isPublished ? "Your store is published" : "Publish your store"}
        description="Review your saved setup and manage your store's publication."
      />

      <div className="hlm-publish-toolbar">
        <span className="hlm-form-badge">{status || "Loading"}</span>
        <button className="hlm-btn hlm-btn-secondary" type="button"
          disabled={isBusy} onClick={refresh}>
          <RefreshCw size={16} className={isLoading ? "hlm-spin" : undefined} />
          Refresh status
        </button>
      </div>

      <section className="hlm-publish-block is-primary">
        <div className="hlm-form-section-heading">
          <div>
            <h3>Required to publish</h3>
            <p>Complete these three sections. Select a row to review or edit it.</p>
          </div>
          <span className={`hlm-form-badge${requiredSetupComplete ? " is-ready" : ""}`}>
            {requiredSetupComplete ? "Complete" : "Action needed"}
          </span>
        </div>
        <RequirementList items={requiredSections} statusByKey={statusByKey} storeId={storeId} />
      </section>

      <section className="hlm-publish-block">
        <div className="hlm-form-section-heading">
          <div>
            <h3>Optional improvements</h3>
            <p>Add these details whenever they are useful for your business.</p>
          </div>
          <span className="hlm-form-badge is-optional">Optional</span>
        </div>
        <RequirementList items={optionalSections} statusByKey={statusByKey}
          storeId={storeId} optional />
      </section>

      {isPublished && (
        <section className="hlm-publish-block">
          <div className="hlm-form-section-heading">
            <div>
              <h3>Online orders</h3>
              <p>
                {store.isAcceptingOrders
                  ? "Online orders are enabled. Pausing them keeps your store published."
                  : "Your store is published. Enable online orders when you are ready."}
              </p>
            </div>
            <span className={`hlm-form-badge${store.isAcceptingOrders ? " is-ready" : ""}`}>
              {store.isAcceptingOrders ? "Enabled" : "Paused"}
            </span>
          </div>
          <button className="hlm-btn hlm-btn-primary" type="button"
            disabled={isBusy || (!canAcceptOrders && !store.isAcceptingOrders)}
            onClick={toggleOrders}>
            {savingSection === "accepting-orders" && <LoaderCircle size={18} className="hlm-spin" />}
            {savingSection === "accepting-orders"
              ? "Saving…"
              : store.isAcceptingOrders ? "Pause online orders" : "Enable online orders"}
          </button>
          {!canAcceptOrders && !store.isAcceptingOrders && (
            <p className="hlm-publish-help">Complete the required profile details above to enable orders.</p>
          )}
        </section>
      )}

      <div className="hlm-publish-notices">
        {status === "Suspended" && (
          <InlineNotice>This store is suspended. Publishing and online order controls are unavailable.</InlineNotice>
        )}
        {status === "Closed" && (
          <InlineNotice>This store is closed. Publishing and online order controls are unavailable.</InlineNotice>
        )}
        {error && <InlineNotice>{error}</InlineNotice>}
        {!error && feedback?.type === "success" && (
          <InlineNotice type="success">{feedback.message}</InlineNotice>
        )}
      </div>

      <footer className="hlm-publish-footer">
        <div>
          <strong>{isPublished ? "Keep building your store" : "Ready to publish?"}</strong>
          <p>
            {isPublished
              ? "You can update your profile and optional settings at any time."
              : "Publishing makes your store active. Online orders start paused."}
          </p>
        </div>
        {isDraft && (
          <button className="hlm-btn hlm-btn-primary hlm-btn-large" type="button"
            disabled={isBusy || !canPublish} onClick={publish}>
            {savingSection === "publish"
              ? <LoaderCircle size={18} className="hlm-spin" />
              : <Rocket size={18} />}
            {savingSection === "publish" ? "Publishing…" : "Publish store"}
          </button>
        )}
      </footer>
    </article>
  );
}

export default function PublishStorePage() {
  const { storeId } = useParams();
  return <PublishStoreContent key={storeId} storeId={storeId} />;
}
