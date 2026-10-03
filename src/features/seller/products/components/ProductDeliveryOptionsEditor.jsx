import { useEffect, useRef, useState } from "react";
import { deliveryOptionsApi } from "../../../delivery/services/deliveryOptionsApi";
import { deliveryErrorMessage, formatDeliveryFee } from "../../../delivery/utils/deliveryOptions";
import "../../storeSetup/components/deliveryOptions.css";

export default function ProductDeliveryOptionsEditor(props) {
  if (!props.storeId || !props.productId) {
    return <p>Save the product first, then select its delivery options.</p>;
  }
  return <Editor key={`${props.storeId}:${props.productId}`} {...props} />;
}

function Editor({ storeId, productId }) {
  const [data, setData] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const busy = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    deliveryOptionsApi.getSelection(storeId, productId, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setData(result);
        setSelectedIds(result.deliveryOptionIds);
      })
      .catch((err) => {
        if (!controller.signal.aborted) setError(deliveryErrorMessage(err));
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [storeId, productId, reloadKey]);

  const toggle = (id, checked) => {
    setSelectedIds((current) => checked
      ? [...new Set([...current, id])]
      : current.filter((value) => value !== id));
    setSaved(false);
    setError("");
  };
  const save = async () => {
    if (!data || busy.current) return;
    busy.current = true;
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const result = await deliveryOptionsApi.saveSelection(storeId, productId, {
        expectedVersion: data.version,
        deliveryOptionIds: selectedIds,
      });
      setData(result);
      setSelectedIds(result.deliveryOptionIds);
      setSaved(true);
    } catch (err) {
      setError(deliveryErrorMessage(err));
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };

  return (
    <section className="hlm-delivery-section">
      <h3>Delivery options for this product</h3>
      <p>Select the options that apply. Existing assignments remain when an option is deactivated.</p>
      {loading && <p role="status">Loading product delivery options...</p>}
      {error && <p className="hlm-delivery-notice is-error" role="alert">{error}</p>}
      {saved && <p className="hlm-delivery-notice" role="status">Product delivery options saved.</p>}
      {data && !loading && (
        <>
          {data.options.length === 0 && <p>Create delivery options in Store setup first.</p>}
          <div className="hlm-delivery-list">
            {data.options.map((option) => {
              const selected = selectedIds.includes(option.id);
              return (
                <label className="hlm-delivery-choice" key={option.id}>
                  <input type="checkbox" checked={selected}
                    disabled={saving || (!option.isActive && !selected)}
                    onChange={(event) => toggle(option.id, event.target.checked)} />
                  <span>
                    <strong>{option.name}{!option.isActive ? " (inactive)" : ""}</strong>
                    <span>{formatDeliveryFee(option)}</span>
                    <span>{option.coverageDescription}</span>
                    <span>{option.estimatedTimeDescription}</span>
                    {option.conditions && <span>{option.conditions}</span>}
                  </span>
                </label>
              );
            })}
          </div>
          <p>No selection means no predefined delivery offers are advertised for this product.</p>
        </>
      )}
      <div className="hlm-delivery-actions">
        <button type="button" className="hlm-btn hlm-btn-primary"
          disabled={!data || loading || saving} onClick={save}>
          {saving ? "Saving..." : "Save product delivery options"}
        </button>
        <button type="button" className="hlm-btn hlm-btn-secondary"
          disabled={loading || saving}
          onClick={() => { setSaved(false); setReloadKey((key) => key + 1); }}>
          Reload (discards selection edits)
        </button>
      </div>
    </section>
  );
}
