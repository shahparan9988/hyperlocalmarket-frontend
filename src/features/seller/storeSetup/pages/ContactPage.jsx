import {
  ContactRound,
  Mail,
  Phone,
  TimerReset,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useParams } from "react-router-dom";

import PhoneNumberInput from "../../../../shared/components/forms/PhoneNumberInput";

import FormActions from "../components/FormActions";
import InlineNotice from "../components/InlineNotice";
import SetupPageHeader from "../components/SetupPageHeader";

import { TIME_ZONES } from "../constants/setupSections";

import { useStoreSetupStore } from "../state/useStoreSetupStore";

import {
  hasErrors,
  validateContact,
} from "../utils/storeSetupValidation";

const SUPPORTED_PHONE_COUNTRIES = ["BD", "AU"];

function getBackendValidationErrors(error) {
  const validationErrors =
    error?.response?.data?.errors ?? {};

  return {
    phoneNumber:
      validationErrors.phoneNumber?.[0] ??
      validationErrors.PhoneNumber?.[0] ??
      "",

    email:
      validationErrors.email?.[0] ??
      validationErrors.Email?.[0] ??
      "",

    timeZoneId:
      validationErrors.timeZoneId?.[0] ??
      validationErrors.TimeZoneId?.[0] ??
      "",
  };
}

export default function ContactPage() {
  const { storeId } = useParams();

  const store = useStoreSetupStore(
    (state) => state.store
  );

  const saveContact = useStoreSetupStore(
    (state) => state.saveContact
  );

  const savingSection = useStoreSetupStore(
    (state) => state.savingSection
  );

  const apiError = useStoreSetupStore(
    (state) => state.error
  );

  const [values, setValues] = useState({
    phoneNumber: "",
    email: "",
    timeZoneId: "",
  });

  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  const storeCountryCode =
    store?.location?.countryCode === "AU"
      ? "AU"
      : "BD";

  const availableTimeZones = useMemo(
    () =>
      TIME_ZONES.filter(
        (timeZone) =>
          timeZone.countryCode ===
          storeCountryCode
      ),
    [storeCountryCode]
  );

  useEffect(() => {
    if (!store) {
      return;
    }

    const countryCode =
      store.location?.countryCode === "AU"
        ? "AU"
        : "BD";

    const countryTimeZones =
      TIME_ZONES.filter(
        (timeZone) =>
          timeZone.countryCode === countryCode
      );

    const savedTimeZoneIsAllowed =
      countryTimeZones.some(
        (timeZone) =>
          timeZone.value === store.timeZoneId
      );

    const defaultTimeZone =
      countryTimeZones[0]?.value ??
      "Asia/Dhaka";

    setValues({
      phoneNumber:
        store.phoneNumber ?? "",

      email:
        store.email ?? "",

      timeZoneId:
        savedTimeZoneIsAllowed
          ? store.timeZoneId
          : defaultTimeZone,
    });
  }, [
    store?.phoneNumber,
    store?.email,
    store?.timeZoneId,
    store?.location?.countryCode,
  ]);

  const updateValue = (field, value) => {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: "",
    }));

    setSaved(false);
  };

  const submit = async (event) => {
    event.preventDefault();

    const nextErrors = validateContact(
      values,
      storeCountryCode
    );

    setErrors(nextErrors);
    setSaved(false);

    if (hasErrors(nextErrors)) {
      return;
    }

    try {
      await saveContact(storeId, {
        phoneNumber:
          values.phoneNumber.trim(),

        email:
          values.email.trim() || null,

        timeZoneId:
          values.timeZoneId,
      });

      setSaved(true);
    } catch (error) {
      const backendErrors =
        getBackendValidationErrors(error);

      if (hasErrors(backendErrors)) {
        setErrors(backendErrors);
      }

      // The general API error is also rendered below.
    }
  };

  const isSaving =
    savingSection === "contact";

  return (
    <article className="hlm-setup-card">
      <SetupPageHeader
        icon={ContactRound}
        title="Contact and timezone"
        description="Add the channels your store monitors and confirm its operating timezone."
        badge="Required"
      />

      <form onSubmit={submit} noValidate>
        <section className="hlm-form-subcard">
          <div className="hlm-form-section-heading">
            <div>
              <h3>Store contact</h3>

              <p>
                A phone number is required.
                Store email remains optional.
              </p>
            </div>

            <span className="hlm-form-badge">
              Phone required
            </span>
          </div>

          <div className="hlm-form-grid">
            <div className="hlm-field">
              <label
                className="hlm-field-label"
                htmlFor="store-phone-number"
              >
                <Phone size={15} />

                <span>Phone number</span>

                <small>Required</small>
              </label>

              <PhoneNumberInput
                id="store-phone-number"
                name="phoneNumber"
                value={values.phoneNumber}
                onChange={(phoneNumber) =>
                  updateValue(
                    "phoneNumber",
                    phoneNumber
                  )
                }
                allowedCountries={
                  SUPPORTED_PHONE_COUNTRIES
                }
                defaultCountry={
                  storeCountryCode
                }
                error={errors.phoneNumber}
                disabled={isSaving}
                required
              />

              <span className="hlm-field-help">
                Select the country and enter the
                national phone number.
              </span>
            </div>

            <label className="hlm-field">
              <span>
                <Mail size={15} />

                Store email

                <small>Optional</small>
              </span>

              <input
                type="email"
                value={values.email}
                onChange={(event) =>
                  updateValue(
                    "email",
                    event.target.value
                  )
                }
                placeholder="hello@paranmarket.com"
                disabled={isSaving}
                autoComplete="email"
                aria-invalid={Boolean(
                  errors.email
                )}
              />

              {errors.email && (
                <span className="hlm-field-error">
                  {errors.email}
                </span>
              )}
            </label>
          </div>
        </section>

        <section className="hlm-form-subcard">
          <div className="hlm-form-section-heading">
            <div>
              <h3>Operating timezone</h3>

              <p>
                Business hours and order
                availability are calculated in
                this timezone.
              </p>
            </div>

            <span className="hlm-form-badge">
              Required
            </span>
          </div>

          <label className="hlm-field">
            <span>
              <TimerReset size={15} />

              Timezone
            </span>

            <select
              value={values.timeZoneId}
              onChange={(event) =>
                updateValue(
                  "timeZoneId",
                  event.target.value
                )
              }
              disabled={isSaving}
              aria-invalid={Boolean(
                errors.timeZoneId
              )}
            >
              <option value="">
                Select a timezone
              </option>

              {availableTimeZones.map(
                (timeZone) => (
                  <option
                    key={timeZone.value}
                    value={timeZone.value}
                  >
                    {timeZone.label}
                  </option>
                )
              )}
            </select>

            {errors.timeZoneId && (
              <span className="hlm-field-error">
                {errors.timeZoneId}
              </span>
            )}
          </label>
        </section>

        {apiError && (
          <InlineNotice>
            {apiError}
          </InlineNotice>
        )}

        {saved && (
          <InlineNotice type="success">
            Contact and timezone saved.
          </InlineNotice>
        )}

        <FormActions isSaving={isSaving} />
      </form>
    </article>
  );
}