import { isValidSupportedPhoneNumber } from "../../../../shared/utils/phoneNumber";
import { validateFulfillmentValues } from "../../../delivery/utils/deliveryOptions";
import { TIME_ZONES } from "../constants/setupSections";

const isBlank = (value) => !String(value ?? "").trim();

export function validateBusinessInfo(values) {
  const errors = {};

  if (isBlank(values.name)) errors.name = "Store name is required.";
  if (isBlank(values.businessTypeCode)) {
    errors.businessTypeCode = "Choose a business type.";
  }
  if ((values.description?.length ?? 0) > 1000) {
    errors.description = "Description cannot exceed 1,000 characters.";
  }

  return errors;
}

export function validateLocation(location, { requireAdminArea = false } = {}) {
  const errors = {};
  const latitude = Number(location.coordinates?.latitude);
  const longitude = Number(location.coordinates?.longitude);

  if (isBlank(location.countryCode)) {
    errors.countryCode = "Country is required.";
  }
  if (isBlank(location.address?.addressLine1)) {
    errors.addressLine1 = "Street address is required.";
  }
  if (requireAdminArea && isBlank(location.adminArea?.level1)) {
    errors.level1 = "Choose a division or state.";
  }
  if (
    isBlank(location.coordinates?.latitude) ||
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90
  ) {
    errors.latitude = "Enter a valid latitude.";
  }
  if (
    isBlank(location.coordinates?.longitude) ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180
  ) {
    errors.longitude = "Enter a valid longitude.";
  }

  return errors;
}

const SUPPORTED_PHONE_COUNTRIES = ["BD", "AU"];

export function validateContact(
  values,
  storeCountryCode
) {
  const errors = {};

  const phoneNumber =
    values.phoneNumber?.trim() ?? "";

  const email =
    values.email?.trim() ?? "";

  const timeZoneId =
    values.timeZoneId?.trim() ?? "";

  if (!phoneNumber) {
    errors.phoneNumber =
      "Phone number is required.";
  } else if (
    !isValidSupportedPhoneNumber(
      phoneNumber,
      SUPPORTED_PHONE_COUNTRIES
    )
  ) {
    errors.phoneNumber =
      "Enter a valid Bangladesh or Australian phone number.";
  }

  if (email.length > 320) {
    errors.email =
      "Email cannot exceed 320 characters.";
  } else if (
    email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    errors.email =
      "Enter a valid email address.";
  }

  if (!timeZoneId) {
    errors.timeZoneId =
      "Timezone is required.";
  } else {
    const selectedTimeZone =
      TIME_ZONES.find(
        (timeZone) =>
          timeZone.value === timeZoneId
      );

    if (!selectedTimeZone) {
      errors.timeZoneId =
        "Select a valid timezone.";
    } else if (
      storeCountryCode &&
      selectedTimeZone.countryCode !==
        storeCountryCode
    ) {
      errors.timeZoneId =
        "Select a timezone that matches the store location.";
    }
  }

  return errors;
}

export function validateBusinessHours(hours) {
  const errors = {};

  hours.forEach((day) => {
    if (day.isClosed || day.isOpen24Hours) {
      return;
    }

    if (!day.periods.length) {
      errors[`${day.dayOfWeek}-periods`] =
        "Add at least one opening period.";
      return;
    }

    if (day.periods.length > 4) {
      errors[`${day.dayOfWeek}-periods`] =
        "A maximum of four periods is allowed.";
      return;
    }

    const validPeriods = [];

    day.periods.forEach((period, index) => {
      const errorKey =
        `${day.dayOfWeek}-${index}`;

      if (!period.opensAt || !period.closesAt) {
        errors[errorKey] =
          "Opening and closing times are required.";

        return;
      }

      if (period.opensAt >= period.closesAt) {
        errors[errorKey] =
          "Closing time must be after opening time.";

        return;
      }

      validPeriods.push({
        index,
        opensAt: period.opensAt,
        closesAt: period.closesAt,
      });
    });

    const orderedPeriods = [...validPeriods].sort(
      (first, second) =>
        first.opensAt.localeCompare(second.opensAt)
    );

    for (
      let index = 1;
      index < orderedPeriods.length;
      index += 1
    ) {
      const previous = orderedPeriods[index - 1];
      const current = orderedPeriods[index];

      if (current.opensAt < previous.closesAt) {
        errors[
          `${day.dayOfWeek}-${current.index}`
        ] = "This period overlaps another period.";
      }
    }
  });

  return errors;
}

export function validatePickupDelivery(values) {
  return validateFulfillmentValues(values);
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}

export function toNullableNumber(value) {
  return value === "" || value === null || value === undefined
    ? null
    : Number(value);
}

export function toLocationPayload(location) {
  return {
    countryCode: location.countryCode.trim().toUpperCase(),
    coordinates: {
      latitude: Number(location.coordinates.latitude),
      longitude: Number(location.coordinates.longitude),
    },
    address: {
      addressLine1: location.address.addressLine1 || null,
      addressLine2: location.address.addressLine2 || null,
      locality: location.address.locality || null,
      region: location.address.region || null,
      postcode: location.address.postcode || null,
      landmark: location.address.landmark || null,
    },
    adminArea: {
      level1Id: toNullableNumber(location.adminArea.level1Id),
      level2Id: toNullableNumber(location.adminArea.level2Id),
      level3Id: toNullableNumber(location.adminArea.level3Id),
      level1: location.adminArea.level1 || null,
      level2: location.adminArea.level2 || null,
      level3: location.adminArea.level3 || null,
      level4: location.adminArea.level4 || null,
    },
  };
}
