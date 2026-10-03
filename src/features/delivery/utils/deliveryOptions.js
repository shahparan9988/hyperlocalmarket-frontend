export const DELIVERY_CURRENCIES = ["BDT", "AUD"];
export const DELIVERY_FEE_TYPES = ["Fixed", "StartingFrom", "ContactSeller"];

export function validateFulfillmentValues(values) {
  const errors = {};
  if (typeof values.isPickupAvailable !== "boolean" ||
      typeof values.isDeliveryAvailable !== "boolean") {
    errors.availability = "Choose valid pickup and delivery settings.";
  }
  if (String(values.fulfillmentNotes ?? "").length > 500) {
    errors.fulfillmentNotes = "Instructions cannot exceed 500 characters.";
  }
  return errors;
}

export function validateDeliveryOption(values) {
  const errors = {};
  for (const [field, label, max] of [
    ["name", "Name", 100],
    ["coverageDescription", "Coverage", 300],
    ["estimatedTimeDescription", "Estimated delivery time", 200],
  ]) {
    const value = String(values[field] ?? "").trim();
    if (!value) errors[field] = `${label} is required.`;
    else if (value.length > max) errors[field] = `${label} cannot exceed ${max} characters.`;
  }
  if (!DELIVERY_FEE_TYPES.includes(values.feeType)) {
    errors.feeType = "Choose a delivery price type.";
  }
  if (!DELIVERY_CURRENCIES.includes(values.currencyCode)) {
    errors.currencyCode = "Choose BDT or AUD.";
  }
  if (values.feeType !== "ContactSeller") {
    const value = String(values.feeAmount ?? "").trim();
    if (!/^\d+(\.\d{1,2})?$/.test(value) ||
        !Number.isFinite(Number(value)) || Number(value) > 999999999.99) {
      errors.feeAmount = "Enter an amount from 0 to 999999999.99 with up to two decimal places.";
    }
  }
  if (String(values.conditions ?? "").length > 1000) {
    errors.conditions = "Conditions cannot exceed 1,000 characters.";
  }
  return errors;
}

export function toDeliveryOptionPayload(values) {
  return {
    name: String(values.name ?? "").trim(),
    coverageDescription: String(values.coverageDescription ?? "").trim(),
    estimatedTimeDescription: String(values.estimatedTimeDescription ?? "").trim(),
    feeType: values.feeType,
    feeAmount: values.feeType === "ContactSeller" ? null : Number(values.feeAmount),
    currencyCode: values.currencyCode,
    conditions: String(values.conditions ?? "").trim() || null,
    isActive: Boolean(values.isActive),
  };
}

export function formatDeliveryFee(option) {
  if (option.feeType === "ContactSeller" || option.feeAmount == null)
    return "Contact seller for a quote";
  if (option.feeType === "Fixed" && Number(option.feeAmount) === 0)
    return "Free delivery";
  const amount = `${option.currencyCode} ${Number(option.feeAmount).toFixed(2)}`;
  return option.feeType === "StartingFrom" ? `From ${amount}` : amount;
}

export function deliveryErrorMessage(error) {
  if (error?.response?.status === 409)
    return "These details changed elsewhere. Reload before saving again.";
  const body = error?.response?.data;
  if (body?.errors && typeof body.errors === "object") {
    const messages = Object.values(body.errors).flat()
      .filter((value) => typeof value === "string");
    if (messages.length) return messages.join(" ");
  }
  return body?.error || body?.message || body?.title ||
    error?.message || "Something went wrong. Please try again.";
}
