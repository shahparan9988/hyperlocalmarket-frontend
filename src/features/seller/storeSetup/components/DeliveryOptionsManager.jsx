import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { deliveryOptionsApi } from "../../../delivery/services/deliveryOptionsApi";
import { deliveryErrorMessage, formatDeliveryFee } from "../../../delivery/utils/deliveryOptions";
import DeliveryOptionForm from "./DeliveryOptionForm";
import "../../../delivery/deliveryOptions.css";

export default function DeliveryOptionsManager(props) {
  return <Manager key={props.storeId} {...props} />;
}

function Manager({ storeId, countryCode }) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editor, setEditor] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const busy = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    deliveryOptionsApi.list(storeId, controller.signal)
      .then((result) => { if (!controller.signal.aborted) setOptions(result); })
      .catch((err) => {
        if (!controller.signal.aborted) setError(deliveryErrorMessage(err));
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [storeId, reloadKey]);

  const applyResult = (result) => {
    setOptions((current) => [result, ...current.filter((item) => item.id !== result.id)]
      .sort((a, b) => Number(b.isActive) - Number(a.isActive) || a.name.localeCompare(b.name)));
  };
  const save = async (payload) => {
    if (busy.current) return;
    busy.current = true;
    setBusyId("editor");
    setError("");
    setMessage("");
    try {
      const result = editor?.option
        ? await deliveryOptionsApi.update(storeId, editor.option.id, payload)
        : await deliveryOptionsApi.create(storeId, payload);
      applyResult(result);
      setEditor(null);
      setMessage("Delivery option saved. Select it on the products that support it.");
    } catch (err) {
      setError(deliveryErrorMessage(err));
    } finally {
      busy.current = false;
      setBusyId(null);
    }
  };
  const toggle = async (option) => {
    if (busy.current) return;
    busy.current = true;
    setBusyId(option.id);
    setError("");
    setMessage("");
    try {
      const result = await deliveryOptionsApi.setActive(
        storeId, option.id, !option.isActive, option.version);
      applyResult(result);
      setMessage(result.isActive ? "Delivery option activated." : "Delivery option deactivated.");
    } catch (err) {
      setError(deliveryErrorMessage(err));
    } finally {
      busy.current = false;
      setBusyId(null);
    }
  };
  const reload = () => {
    // Explicit reload discards the open option editor.
    setEditor(null);
    setMessage("");
    setReloadKey((value) => value + 1);
  };

  return (
    <section className="hlm-delivery-section">
      <div className="hlm-delivery-heading">
        <div>
          <h3>Your delivery options</h3>
          <p>Create options for areas, delivery times, heavy boxes or other requirements.</p>
        </div>
        <button type="button" className="hlm-btn hlm-btn-secondary"
          disabled={loading || !!busyId || !!editor}
          onClick={() => { setEditor({ option: null }); setError(""); setMessage(""); }}>
          <Plus size={16} /> Add delivery option
        </button>
      </div>

      {loading && <p role="status">Loading delivery options...</p>}
      {error && (
        <div className="hlm-delivery-notice is-error" role="alert">
          <p>{error}</p>
          <button type="button" disabled={loading || !!busyId} onClick={reload}>
            Reload options (discards open edits)
          </button>
        </div>
      )}
      {message && <p className="hlm-delivery-notice" role="status">{message}</p>}
      {!loading && !error && options.length === 0 && !editor &&
        <p>No delivery options yet. Customers can still contact you to discuss arrangements.</p>}

      <div className="hlm-delivery-list">
        {options.map((option) => (
          <article className="hlm-delivery-option" key={option.id}>
            <div className="hlm-delivery-heading">
              <strong>{option.name}</strong>
              <span className="hlm-delivery-badge">{option.isActive ? "Active" : "Inactive"}</span>
            </div>
            <p className="hlm-delivery-price">{formatDeliveryFee(option)}</p>
            <p><strong>Area:</strong> {option.coverageDescription}</p>
            <p><strong>Estimated time:</strong> {option.estimatedTimeDescription}</p>
            {option.conditions && <p className="hlm-delivery-conditions">{option.conditions}</p>}
            <div className="hlm-delivery-actions">
              <button type="button" className="hlm-btn hlm-btn-secondary"
                disabled={!!busyId || loading || !!editor}
                onClick={() => { setEditor({ option }); setError(""); setMessage(""); }}>
                Edit
              </button>
              <button type="button" className="hlm-btn hlm-btn-secondary"
                disabled={!!busyId || loading || !!editor} onClick={() => toggle(option)}>
                {busyId === option.id ? "Saving..." : option.isActive ? "Deactivate" : "Activate"}
              </button>
            </div>
          </article>
        ))}
      </div>

      {editor && <DeliveryOptionForm key={editor.option?.id ?? "new"}
        initial={editor.option}
        defaultCurrency={countryCode === "AU" ? "AUD" : "BDT"}
        isSaving={busyId === "editor"} onSave={save} onCancel={() => setEditor(null)} />}
    </section>
  );
}
