import { useId } from "react";
import { Link } from "react-router-dom";
import { Clock3, MapPin, Settings2, ShoppingBag, Truck } from "lucide-react";
import { formatDeliveryFee } from "../../../delivery/utils/deliveryOptions";

function FulfillmentChoice({
  title,
  icon: Icon,
  checked,
  disabled,
  unavailable = false,
  status,
  price,
  onChange,
  children,
}) {
  const id = useId();

  const className = [
    "hlmp-fulfillment-choice",
    checked && "is-selected",
    unavailable && "is-unavailable",
    disabled && "is-disabled",
  ].filter(Boolean).join(" ");

  return (
    <label className={className}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-details${price ? ` ${id}-price` : ""}`}
      />

      <span className="hlmp-fulfillment-icon" aria-hidden="true">
        <Icon size={20} />
      </span>

      <span className="hlmp-fulfillment-body">
        <span className="hlmp-fulfillment-top">
          <strong id={`${id}-title`}>{title}</strong>
          {price && (
            <span className="hlmp-fulfillment-price" id={`${id}-price`}>
              {price}
            </span>
          )}
        </span>

        <span className="hlmp-fulfillment-details" id={`${id}-details`}>
          {status && <span className="hlmp-fulfillment-status">{status}</span>}
          {children}
          {unavailable && checked && (
            <span className="hlmp-fulfillment-remove-hint">
              Uncheck to remove this unavailable method.
            </span>
          )}
        </span>
      </span>
    </label>
  );
}

export default function ProductFulfillment({
  storeId,
  store,
  deliveryOptions = [],
  isPickupAvailable = false,
  deliveryOptionIds = [],
  disabled = false,
  error,
  onPickupChange,
  onDeliveryChange,
  onOpenSettings,
}) {
  const id = useId();
  const pickupUnavailable = !store.isPickupAvailable;
  const missingOptionIds = deliveryOptionIds.filter(
    (optionId) => !deliveryOptions.some((option) => option.id === optionId),
  );

  function toggleDelivery(optionId, checked) {
    onDeliveryChange(
      checked
        ? [...new Set([...deliveryOptionIds, optionId])]
        : deliveryOptionIds.filter((id) => id !== optionId),
    );
  }

  return (
    <section
      className="hlmp-panel hlmp-fulfillment"
      aria-labelledby={`${id}-heading`}
    >
      <div className="hlmp-fulfillment-heading">
        <div>
          <h2 id={`${id}-heading`}>Pickup &amp; delivery</h2>
          <p>Choose how customers can receive this product.</p>
        </div>
        <Link
          className="hlmp-fulfillment-settings"
          to={`/seller/stores/${storeId}/setup/pickup-delivery`}
          onClick={onOpenSettings}
        >
          <Settings2 size={16} aria-hidden="true" />
          Store settings
        </Link>
      </div>

      <FulfillmentChoice
        title="Customer pickup"
        icon={ShoppingBag}
        checked={isPickupAvailable}
        disabled={disabled || (pickupUnavailable && !isPickupAvailable)}
        unavailable={pickupUnavailable}
        status={pickupUnavailable ? "Pickup disabled" : undefined}
        onChange={onPickupChange}
      >
        <span>
          {pickupUnavailable
            ? "Enable pickup in Store settings to offer it for this product."
            : "Customers collect this product from your store."}
        </span>
      </FulfillmentChoice>

      <div
        className="hlmp-fulfillment-delivery"
        role="group"
        aria-labelledby={`${id}-delivery-heading`}
      >
        <div className="hlmp-fulfillment-group-heading">
          <h3 id={`${id}-delivery-heading`}>Delivery methods</h3>
          <span className="hlmp-muted">Select all that apply</span>
        </div>

        {!store.isDeliveryAvailable && deliveryOptions.length > 0 && (
          <p className="hlmp-fulfillment-note">
            Delivery is turned off for this store. Enable it in Store settings
            to offer these methods.
          </p>
        )}

        <div className="hlmp-fulfillment-list">
          {deliveryOptions.map((option) => {
            const checked = deliveryOptionIds.includes(option.id);
            const unavailable = !store.isDeliveryAvailable || !option.isActive;
            const status = !option.isActive
              ? "Inactive"
              : !store.isDeliveryAvailable
                ? "Delivery disabled"
                : undefined;

            return (
              <FulfillmentChoice
                key={option.id}
                title={option.name}
                icon={Truck}
                checked={checked}
                disabled={disabled || (unavailable && !checked)}
                unavailable={unavailable}
                status={status}
                price={formatDeliveryFee(option)}
                onChange={(value) => toggleDelivery(option.id, value)}
              >
                {option.coverageDescription && (
                  <span className="hlmp-fulfillment-detail">
                    <MapPin size={14} aria-hidden="true" />
                    <span>{option.coverageDescription}</span>
                  </span>
                )}
                {option.estimatedTimeDescription && (
                  <span className="hlmp-fulfillment-detail">
                    <Clock3 size={14} aria-hidden="true" />
                    <span>{option.estimatedTimeDescription}</span>
                  </span>
                )}
                {option.conditions && (
                  <span className="hlmp-fulfillment-conditions">
                    {option.conditions}
                  </span>
                )}
              </FulfillmentChoice>
            );
          })}

          {missingOptionIds.map((optionId) => (
            <FulfillmentChoice
              key={optionId}
              title="Removed delivery method"
              icon={Truck}
              checked
              disabled={disabled}
              unavailable
              status="Removed"
              onChange={() => toggleDelivery(optionId, false)}
            >
              <span>This method is no longer available in your store.</span>
            </FulfillmentChoice>
          ))}
        </div>

        {deliveryOptions.length === 0 && (
          <p className="hlmp-fulfillment-empty">
            No delivery methods yet. Add them in Store settings when you are
            ready to offer delivery.
          </p>
        )}
      </div>

      {error && <p className="hlmp-error" role="alert">{error}</p>}
    </section>
  );
}
