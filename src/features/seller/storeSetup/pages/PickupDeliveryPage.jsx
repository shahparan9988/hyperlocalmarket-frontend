import { Bike, PackageCheck, ShoppingBag, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import FormActions from "../components/FormActions";
import InlineNotice from "../components/InlineNotice";
import SetupPageHeader from "../components/SetupPageHeader";
import DeliveryOptionsManager from "../components/DeliveryOptionsManager";
import { useStoreSetupStore } from "../state/useStoreSetupStore";
import { hasErrors, validatePickupDelivery } from "../utils/storeSetupValidation";
import "../../../delivery/deliveryOptions.css";

export default function PickupDeliveryPage() {
  const { storeId } = useParams();
  return <PickupDeliveryContent key={storeId} storeId={storeId} />;
}

function PickupDeliveryContent({ storeId }) {
  const store = useStoreSetupStore((state) => state.store);
  const savePickupDelivery = useStoreSetupStore((state) => state.savePickupDelivery);
  const savingSection = useStoreSetupStore((state) => state.savingSection);
  const apiError = useStoreSetupStore((state) => state.error);
  const clearError = useStoreSetupStore((state) => state.clearError);
  const [values, setValues] = useState({
    isPickupAvailable: false, isDeliveryAvailable: false, fulfillmentNotes: "",
  });
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [statusWarning, setStatusWarning] = useState("");
  const isSaving = savingSection === "pickup-delivery";
  const currentStore = store?.id === storeId ? store : null;

  useEffect(() => { clearError(); }, [storeId, clearError]);
  useEffect(() => {
    if (!currentStore) return;
    setValues({
      isPickupAvailable: Boolean(currentStore.isPickupAvailable),
      isDeliveryAvailable: Boolean(currentStore.isDeliveryAvailable),
      fulfillmentNotes: currentStore.fulfillmentNotes ?? "",
    });
  }, [currentStore?.id, currentStore?.isPickupAvailable,
    currentStore?.isDeliveryAvailable, currentStore?.fulfillmentNotes]);

  const update = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setSaved(false);
    setStatusWarning("");
    setErrors({});
  };

  const submit = async (event) => {
    event.preventDefault();
    if (savingSection || !currentStore) return;
    const nextErrors = validatePickupDelivery(values);
    setErrors(nextErrors);
    setSaved(false);
    if (hasErrors(nextErrors)) return;
    try {
      const result = await savePickupDelivery(storeId, {
        isPickupAvailable: values.isPickupAvailable,
        isDeliveryAvailable: values.isDeliveryAvailable,
        fulfillmentNotes: values.fulfillmentNotes.trim() || null,
      });
      setSaved(true);
      setStatusWarning(result.setupStatusRefreshed === false
        ? "Settings saved, but progress could not refresh. Reload the page to update it."
        : "");
    } catch {
      // The setup store exposes the request error below.
    }
  };

  if (!currentStore) return <p role="status">Loading store settings...</p>;

  return (
    <article className="hlm-setup-card hlm-delivery-page">
      <SetupPageHeader icon={Truck} title="Pickup and delivery"
        description="Share your collection and delivery arrangements with customers."
        badge="Optional" />

      <form onSubmit={submit} noValidate>
        <fieldset disabled={Boolean(savingSection)} className="hlm-delivery-fields">
          <div className="hlm-fulfilment-options">
            <label className={`hlm-choice-card${values.isPickupAvailable ? " is-selected" : ""}`}>
              <input type="checkbox" checked={values.isPickupAvailable}
                onChange={(e) => update("isPickupAvailable", e.target.checked)} />
              <span className="hlm-choice-icon"><ShoppingBag size={22} /></span>
              <span><strong>Customer pickup</strong>
                <small>Customers can arrange collection from your store.</small></span>
              <PackageCheck className="hlm-choice-check" size={20} />
            </label>
            <label className={`hlm-choice-card${values.isDeliveryAvailable ? " is-selected" : ""}`}>
              <input type="checkbox" checked={values.isDeliveryAvailable}
                onChange={(e) => update("isDeliveryAvailable", e.target.checked)} />
              <span className="hlm-choice-icon"><Bike size={22} /></span>
              <span><strong>Delivery available</strong>
                <small>Customers can discuss delivery directly with you.</small></span>
              <PackageCheck className="hlm-choice-check" size={20} />
            </label>
          </div>

          <label className="hlm-field">
            <span>Pickup and delivery instructions <small>Optional</small></span>
            <textarea rows={3} maxLength={500} value={values.fulfillmentNotes}
              onChange={(e) => update("fulfillmentNotes", e.target.value)}
              placeholder="Message us to confirm collection, delivery cost and availability." />
            {errors.fulfillmentNotes &&
              <span className="hlm-field-error">{errors.fulfillmentNotes}</span>}
          </label>
          {errors.availability && <InlineNotice>{errors.availability}</InlineNotice>}
          {apiError && <InlineNotice>{apiError}</InlineNotice>}
          {saved && <InlineNotice type="success">Pickup and delivery settings saved.</InlineNotice>}
          {statusWarning && <InlineNotice>{statusWarning}</InlineNotice>}
          <FormActions isSaving={isSaving} />
        </fieldset>
      </form>

      <p className="hlm-delivery-explanation">
        These settings are optional. Service providers can leave both options off.
        Customers and sellers agree on arrangements directly.
      </p>
      {!currentStore.isDeliveryAvailable && (
        <p className="hlm-delivery-notice">
          Delivery is currently off. You can prepare options below; they will appear to
          customers after you enable delivery, save these settings and assign options to products.
        </p>
      )}
      <DeliveryOptionsManager storeId={storeId} countryCode={currentStore.location?.countryCode} />
    </article>
  );
}
