export const SETUP_SECTIONS = [
  {
    key: "business-info",
    label: "Business info",
    description: "Store name, type and description",
    path: "business-info",
    requiredForPublish: true,
  },
  {
    key: "location",
    label: "Location",
    description: "Address and map position",
    path: "location",
    requiredForPublish: true,
  },
  {
    key: "contact",
    label: "Contact",
    description: "Phone, email and timezone",
    path: "contact",
    requiredForPublish: true,
  },
  {
    key: "branding",
    label: "Branding",
    description: "Logo and cover photo",
    path: "branding",
    requiredForPublish: false,
  },
  {
    key: "business-hours",
    label: "Business hours",
    description: "When customers can order",
    path: "business-hours",
    requiredForPublish: false,
    requiredForAcceptingOrders: false,
  },
  {
    key: "pickup-delivery",
    label: "Pickup & delivery",
    description: "How customers receive orders",
    path: "pickup-delivery",
    requiredForPublish: false,
    requiredForAcceptingOrders: false,
  },
];

export const BUSINESS_TYPES = [
  { value: "grocery", label: "Grocery and daily essentials" },
  { value: "fresh-food", label: "Fresh food and produce" },
  { value: "restaurant", label: "Restaurant and prepared food" },
  { value: "pharmacy", label: "Pharmacy and health" },
  { value: "fashion", label: "Fashion and clothing" },
  { value: "electronics", label: "Electronics" },
  { value: "home-services", label: "Home and local services" },
  { value: "other", label: "Other" },
];

export const TIME_ZONES = [
  {
    value: "Asia/Dhaka",
    label: "Dhaka — UTC +06:00",
    countryCode: "BD",
  },
  {
    value: "Australia/Sydney",
    label: "Sydney, Melbourne — UTC +10:00/+11:00",
    countryCode: "AU",
  },
  {
    value: "Australia/Brisbane",
    label: "Brisbane — UTC +10:00",
    countryCode: "AU",
  },
  {
    value: "Australia/Adelaide",
    label: "Adelaide — UTC +09:30/+10:30",
    countryCode: "AU",
  },
  {
    value: "Australia/Darwin",
    label: "Darwin — UTC +09:30",
    countryCode: "AU",
  },
  {
    value: "Australia/Perth",
    label: "Perth — UTC +08:00",
    countryCode: "AU",
  },
  {
    value: "Australia/Hobart",
    label: "Hobart — UTC +10:00/+11:00",
    countryCode: "AU",
  },
];

export const EMPTY_LOCATION = {
  countryCode: "BD",
  coordinates: {
    latitude: "",
    longitude: "",
  },
  address: {
    addressLine1: "",
    addressLine2: "",
    locality: "",
    region: "",
    postcode: "",
    landmark: "",
  },
  adminArea: {
    level1Id: null,
    level2Id: null,
    level3Id: null,
    level1: "",
    level2: "",
    level3: "",
    level4: "",
  },
};
