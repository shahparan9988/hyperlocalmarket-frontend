import {
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import {
  createE164Candidate,
  formatNationalPhoneInput,
  getAvailablePhoneCountries,
  isValidSupportedPhoneNumber,
  parseInternationalPhone,
  parseSavedPhoneNumber,
  sanitizeNationalPhoneInput,
} from "../../utils/phoneNumber";

import "./PhoneNumberInput.css";

export default function PhoneNumberInput({
  id,
  name = "phoneNumber",
  value = "",
  onChange,
  onBlur,
  allowedCountries = ["BD", "AU"],
  defaultCountry = "BD",
  error = "",
  disabled = false,
  required = false,
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const countryKey = allowedCountries.join("|");

  const countries = getAvailablePhoneCountries(
    allowedCountries
  );

  const initialCountry = countries.some(
    (country) => country.code === defaultCountry
  )
    ? defaultCountry
    : countries[0].code;

  const [countryCode, setCountryCode] =
    useState(initialCountry);

  const [nationalValue, setNationalValue] =
    useState("");

  const [localError, setLocalError] =
    useState("");

  const [correctionMessage, setCorrectionMessage] =
    useState("");

  const lastEmittedValue = useRef(null);

  const selectedCountry =
    countries.find(
      (country) => country.code === countryCode
    ) ?? countries[0];

  /*
   * Hydrate the component when a saved E.164 value is
   * loaded from the backend.
   *
   * Example:
   * +61412345678 -> country AU and display 0412 345 678
   */
  useEffect(() => {
    const currentValue = String(value ?? "").trim();

    // Do not re-hydrate the value that this component
    // has just emitted while the user is typing.
    if (
      currentValue &&
      currentValue === lastEmittedValue.current
    ) {
      return;
    }

    if (!currentValue) {
      setNationalValue("");
      setCountryCode(initialCountry);
      setLocalError("");
      return;
    }

    const parsedPhone = parseSavedPhoneNumber(
      currentValue,
      allowedCountries
    );

    if (!parsedPhone) {
      return;
    }

    setCountryCode(parsedPhone.countryCode);
    setNationalValue(parsedPhone.nationalValue);
    setLocalError("");
  }, [
    value,
    countryKey,
    initialCountry,
  ]);

  const emitValue = (
    nextNationalValue,
    nextCountryCode
  ) => {
    const e164Value = createE164Candidate(
      nextNationalValue,
      nextCountryCode
    );

    lastEmittedValue.current = e164Value;

    onChange?.(e164Value, {
      countryCode: nextCountryCode,
      isValid: isValidSupportedPhoneNumber(
        e164Value,
        allowedCountries
      ),
    });
  };

  const handleCountryChange = (event) => {
    const nextCountryCode = event.target.value;

    const { digits } =
      sanitizeNationalPhoneInput(nationalValue);

    const formattedValue =
      formatNationalPhoneInput(
        digits,
        nextCountryCode
      );

    setCountryCode(nextCountryCode);
    setNationalValue(formattedValue);
    setLocalError("");
    setCorrectionMessage("");

    emitValue(formattedValue, nextCountryCode);
  };

  const handlePhoneChange = (event) => {
    const rawValue = event.target.value;

    /*
     * Handle a complete international number pasted
     * into the national-number field.
     */
    const pastedInternationalPhone =
      parseInternationalPhone(
        rawValue,
        allowedCountries
      );

    if (pastedInternationalPhone) {
      setCountryCode(
        pastedInternationalPhone.countryCode
      );

      setNationalValue(
        pastedInternationalPhone.nationalValue
      );

      setLocalError("");
      setCorrectionMessage("");

      lastEmittedValue.current =
        pastedInternationalPhone.e164Value;

      onChange?.(
        pastedInternationalPhone.e164Value,
        {
          countryCode:
            pastedInternationalPhone.countryCode,
          isValid:
            pastedInternationalPhone.isValid,
        }
      );

      return;
    }

    const {
      digits,
      removedExtraZeroes,
    } = sanitizeNationalPhoneInput(rawValue);

    const formattedValue =
      formatNationalPhoneInput(
        digits,
        countryCode
      );

    setNationalValue(formattedValue);
    setLocalError("");

    setCorrectionMessage(
      removedExtraZeroes
        ? "Extra leading zeroes were removed."
        : ""
    );

    emitValue(formattedValue, countryCode);
  };

  const handleBlur = () => {
    const e164Value = createE164Candidate(
      nationalValue,
      countryCode
    );

    let validationMessage = "";

    if (!e164Value) {
      validationMessage = required
        ? "Phone number is required."
        : "";
    } else if (
      !isValidSupportedPhoneNumber(
        e164Value,
        allowedCountries
      )
    ) {
      validationMessage =
        "Enter a valid Bangladesh or Australian phone number.";
    }

    setLocalError(validationMessage);

    onBlur?.(e164Value, {
      countryCode,
      isValid: validationMessage === "",
    });
  };

  const externalError = Array.isArray(error)
    ? error[0]
    : error;

  const visibleError =
    externalError || localError;

  return (
    <div className="phone-number-field">
       <div
  className={[
    "phone-number-control",
    visibleError
      ? "phone-number-control--error"
      : "",
    disabled
      ? "phone-number-control--disabled"
      : "",
  ]
    .filter(Boolean)
    .join(" ")}
>
  <select
    className="phone-country-select"
    value={countryCode}
    onChange={handleCountryChange}
    disabled={disabled}
    aria-label="Phone country"
  >
    {countries.map((country) => (
      <option
        key={country.code}
        value={country.code}
      >
        {country.code} {country.dialCode}
      </option>
    ))}
  </select>

  <div className="phone-number-divider" />

  <input
    id={inputId}
    name={name}
    className="phone-national-input"
    type="tel"
    inputMode="tel"
    autoComplete="tel-national"
    value={nationalValue}
    onChange={handlePhoneChange}
    onBlur={handleBlur}
    disabled={disabled}
    required={required}
    placeholder={selectedCountry.placeholder}
    aria-invalid={Boolean(visibleError)}
    aria-describedby={
      visibleError
        ? `${inputId}-error`
        : undefined
    }
  />
       </div>

      {correctionMessage && !visibleError && (
        <p
          className="phone-number-message"
          role="status"
        >
          {correctionMessage}
        </p>
      )}

      {visibleError && (
        <p
          id={`${inputId}-error`}
          className="phone-number-error"
        >
          {visibleError}
        </p>
      )}
    </div>
  );
}