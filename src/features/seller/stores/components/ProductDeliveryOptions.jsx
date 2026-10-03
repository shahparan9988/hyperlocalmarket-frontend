import { useEffect, useState } from "react";
import { deliveryOptionsApi } from "../../../delivery/services/deliveryOptionsApi";
import { deliveryErrorMessage, formatDeliveryFee } from "../../../delivery/utils/deliveryOptions";
import "../../../delivery/deliveryOptions.css";

// onContactSeller is optional: connect it to your actual chat/navigation handler.
export default function ProductDeliveryOptions(props) {
  if (!props.productId) return null;
  return <Details key={props.productId} {...props} />;
}

function Details({ productId, onContactSeller }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setError("");
    setData(null);
    deliveryOptionsApi.getPublic(productId, controller.signal)
      .then((result) => { if (!controller.signal.aborted) setData(result); })
      .catch((err) => {
        if (!controller.signal.aborted) setError(deliveryErrorMessage(err));
      });
    return () => controller.abort();
  }, [productId, reloadKey]);

  if (error) return (
    <div className="hlm-delivery-notice is-error" role="alert">
      <p>{error}</p>
      <button type="button" onClick={() => setReloadKey((key) => key + 1)}>Try again</button>
    </div>
  );
  if (!data) return <p role="status">Loading pickup and delivery information...</p>;

  return (
    <section className="hlm-delivery-section">
      <h3>Pickup and delivery</h3>
      {data.isPickupAvailable && <p>Pickup can be arranged with the seller.</p>}
      {data.fulfillmentNotes && <p className="hlm-delivery-conditions">{data.fulfillmentNotes}</p>}
      {data.options.length === 0 && <p>Contact the seller to discuss arrangements.</p>}
      <div className="hlm-delivery-list">
        {data.options.map((option) => (
          <article key={option.id} className="hlm-delivery-option">
            <strong>{option.name}</strong>
            <p className="hlm-delivery-price">{formatDeliveryFee(option)}</p>
            <p>{option.coverageDescription}</p>
            <p>Estimated time: {option.estimatedTimeDescription}</p>
            {option.conditions && <p className="hlm-delivery-conditions">{option.conditions}</p>}
          </article>
        ))}
      </div>
      <p className="hlm-delivery-explanation">
        Confirm availability, the total charge and timing with the seller.
        HLM does not currently arrange or track delivery riders.
      </p>
      {onContactSeller && <button type="button" className="hlm-btn hlm-btn-secondary"
        onClick={onContactSeller}>Message seller</button>}
    </section>
  );
}
