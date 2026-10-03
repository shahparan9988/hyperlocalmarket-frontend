export const SUPPORTED_PHONE_COUNTRIES = Object.freeze([
  {
    code: "BD",
    name: "Bangladesh",
    dialCode: "+880",
    flag: "🇧🇩",
    placeholder: "01712 345678",
  },
  {
    code: "AU",
    name: "Australia",
    dialCode: "+61",
    flag: "🇦🇺",
    placeholder: "0412 345 678",
  },
]);

export function getPhoneCountry(countryCode) {
  return (
    SUPPORTED_PHONE_COUNTRIES.find(
      (country) => country.code === countryCode
    ) ?? null
  );
}