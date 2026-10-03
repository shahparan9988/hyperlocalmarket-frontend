import {
  AsYouType,
  parsePhoneNumberFromString,
} from "libphonenumber-js";

import {
  getPhoneCountry,
  SUPPORTED_PHONE_COUNTRIES,
} from "../constants/supportedPhoneCountries";

export function sanitizeNationalPhoneInput(input) {
  const digits = String(input ?? "").replace(/\D/g, "");

  if (!digits) {
    return {
      digits: "",
      removedExtraZeroes: false,
    };
  }

  const removedExtraZeroes = /^00+/.test(digits);

  // Converts values such as:
  // 0001712345678 -> 01712345678
  // 00412345678   -> 0412345678
  const normalizedDigits = digits.replace(/^0{2,}/, "0");

  return {
    digits: normalizedDigits,
    removedExtraZeroes,
  };
}

export function formatNationalPhoneInput(
  nationalDigits,
  countryCode
) {
  if (!nationalDigits) {
    return "";
  }

  return new AsYouType(countryCode).input(nationalDigits);
}

export function createE164Candidate(
  nationalInput,
  countryCode
) {
  const country = getPhoneCountry(countryCode);

  if (!country) {
    return "";
  }

  const { digits } =
    sanitizeNationalPhoneInput(nationalInput);

  if (!digits) {
    return "";
  }

  // Remove the national trunk prefix before adding
  // the international country calling code.
  //
  // BD: 01712345678 -> +8801712345678
  // AU: 0412345678  -> +61412345678
  const nationalSignificantNumber =
    digits.startsWith("0")
      ? digits.slice(1)
      : digits;

  return `${country.dialCode}${nationalSignificantNumber}`;
}

export function parseInternationalPhone(
  input,
  allowedCountries = ["BD", "AU"]
) {
  const rawValue = String(input ?? "").trim();

  if (!rawValue.startsWith("+")) {
    return null;
  }

  const normalizedValue =
    `+${rawValue.slice(1).replace(/\D/g, "")}`;

  const parsedPhone =
    parsePhoneNumberFromString(normalizedValue);

  if (
    !parsedPhone?.country ||
    !allowedCountries.includes(parsedPhone.country)
  ) {
    return null;
  }

  return {
    countryCode: parsedPhone.country,
    nationalValue: parsedPhone.formatNational(),
    e164Value: parsedPhone.number,
    isValid: parsedPhone.isValid(),
  };
}

export function parseSavedPhoneNumber(
  value,
  allowedCountries = ["BD", "AU"]
) {
  const rawValue = String(value ?? "").trim();

  if (!rawValue) {
    return null;
  }

  const parsedPhone =
    parsePhoneNumberFromString(rawValue);

  if (
    !parsedPhone?.country ||
    !allowedCountries.includes(parsedPhone.country)
  ) {
    return null;
  }

  return {
    countryCode: parsedPhone.country,
    nationalValue: parsedPhone.formatNational(),
    e164Value: parsedPhone.number,
    isValid: parsedPhone.isValid(),
  };
}

export function isValidSupportedPhoneNumber(
  value,
  allowedCountries = ["BD", "AU"]
) {
  if (!value) {
    return false;
  }

  const parsedPhone =
    parsePhoneNumberFromString(String(value).trim());

  return Boolean(
    parsedPhone?.country &&
      allowedCountries.includes(parsedPhone.country) &&
      parsedPhone.isValid()
  );
}

export function getAvailablePhoneCountries(
  allowedCountries = ["BD", "AU"]
) {
  const countries = SUPPORTED_PHONE_COUNTRIES.filter(
    (country) => allowedCountries.includes(country.code)
  );

  return countries.length > 0
    ? countries
    : SUPPORTED_PHONE_COUNTRIES;
}