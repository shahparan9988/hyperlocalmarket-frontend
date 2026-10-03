import { useState } from "react";
import {
  DELIVERY_CURRENCIES, toDeliveryOptionPayload, validateDeliveryOption,
} from "../../../delivery/utils/deliveryOptions";

export default function DeliveryOptionForm({
  initial, defaultCurrency = "BDT", isSaving, onSave, onCancel,
}) {
  const [values, setValues] = useState(() => ({
    name: initial?.name ?? "",
    coverageDescription: initial?.coverageDescription ?? "",
    estimatedTimeDescription: initial?.estimatedTimeDescription ?? "",
    feeType: initial?.feeType ?? "ContactSeller",
    feeAmount: initial?.feeAmount == null ? "" : String(initial.feeAmount),
    currencyCode: initial?.currencyCode ?? defaultCurrency,
    conditions: initial?.conditions ?? "",
    isActive: initial?.isActive ?? true,
  }));
  const [errors, setErrors] = useState({});
  const update = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };
  const submit = async (event) => {
    event.preventDefault();
    if (isSaving) return;
    const nextErrors = validateDeliveryOption(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    await onSave({
      ...toDeliveryOptionPayload(values),
      ...(initial ? { expectedVersion: initial.version } : {}),
    });
  };
  const fieldError = (name) => errors[name] &&
    <span className="hlm-field-error" role="alert">{errors[name]}</span>;

  return (
    <form className="hlm-delivery-editor" onSubmit={submit} noValidate>
      <h3>{initial ? "Edit delivery option" : "Create delivery option"}</h3>
      {initial && <p>Changes apply to every product using this option.</p>}
      <fieldset disabled={isSaving} className="hlm-delivery-fields">
        <label className="hlm-field">
          <span>Option name</span>
          <input value={values.name} maxLength={100}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Nearby express delivery" />
          {fieldError("name")}
        </label>
        <label className="hlm-field">
          <span>Delivery area</span>
          <input value={values.coverageDescription} maxLength={300}
            onChange={(e) => update("coverageDescription", e.target.value)}
            placeholder="Within 500 metres of our shop" />
          {fieldError("coverageDescription")}
        </label>
        <label className="hlm-field">
          <span>Estimated delivery time</span>
          <input value={values.estimatedTimeDescription} maxLength={200}
            onChange={(e) => update("estimatedTimeDescription", e.target.value)}
            placeholder="Within 1 hour after we confirm availability" />
          {fieldError("estimatedTimeDescription")}
        </label>
        <div className="hlm-delivery-grid">
          <label className="hlm-field">
            <span>Price type</span>
            <select value={values.feeType} onChange={(e) => update("feeType", e.target.value)}>
              <option value="ContactSeller">Contact me for a quote</option>
              <option value="Fixed">Fixed price</option>
              <option value="StartingFrom">Starting from</option>
            </select>
            {fieldError("feeType")}
          </label>
          <label className="hlm-field">
            <span>Currency</span>
            <select value={values.currencyCode}
              onChange={(e) => update("currencyCode", e.target.value)}>
              {DELIVERY_CURRENCIES.map((currency) =>
                <option key={currency} value={currency}>{currency}</option>)}
            </select>
            {fieldError("currencyCode")}
          </label>
        </div>
        {values.feeType !== "ContactSeller" && (
          <label className="hlm-field">
            <span>{values.feeType === "StartingFrom" ? "Starting amount" : "Delivery amount"}</span>
            <input type="number" min="0" step="0.01" max="999999999.99"
              value={values.feeAmount} onChange={(e) => update("feeAmount", e.target.value)} />
            <small>For fixed pricing, 0 means free delivery under the stated conditions.</small>
            {fieldError("feeAmount")}
          </label>
        )}
        <label className="hlm-field">
          <span>Conditions <small>Optional</small></span>
          <textarea rows={4} maxLength={1000} value={values.conditions}
            onChange={(e) => update("conditions", e.target.value)}
            placeholder="Per parcel up to 2 kg. Orders confirmed before 2 pm. Message us for heavy or liquid parcels." />
          {fieldError("conditions")}
        </label>
        <label className="hlm-checkbox-label">
          <input type="checkbox" checked={values.isActive}
            onChange={(e) => update("isActive", e.target.checked)} />
          Active and available for product selection
        </label>
        <div className="hlm-delivery-actions">
          <button className="hlm-btn hlm-btn-primary" type="submit">
            {isSaving ? "Saving..." : "Save delivery option"}
          </button>
          <button className="hlm-btn hlm-btn-secondary" type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </fieldset>
    </form>
  );
}
