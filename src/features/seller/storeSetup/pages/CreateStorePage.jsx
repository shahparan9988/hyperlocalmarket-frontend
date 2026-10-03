import { Store } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormActions from "../components/FormActions";
import CreateStoreSetupSidebar from "../components/CreateStoreSetupSidebar";
import InlineNotice from "../components/InlineNotice";
import LocationFields from "../components/LocationFields";
import SetupPageHeader from "../components/SetupPageHeader";
import { BUSINESS_TYPES, EMPTY_LOCATION } from "../constants/setupSections";
import { useStoreSetupStore } from "../state/useStoreSetupStore";
import {
  hasErrors,
  toLocationPayload,
  validateBusinessInfo,
  validateLocation,
} from "../utils/storeSetupValidation";

const initialLocation = {
  ...EMPTY_LOCATION,
  coordinates: { ...EMPTY_LOCATION.coordinates },
  address: { ...EMPTY_LOCATION.address },
  adminArea: { ...EMPTY_LOCATION.adminArea },
  timezone: "Asia/Dhaka",
};

export default function CreateStorePage() {
  const navigate = useNavigate();
  const createDraft = useStoreSetupStore((state) => state.createDraft);
  const isLoading = useStoreSetupStore((state) => state.isLoading);
  const apiError = useStoreSetupStore((state) => state.error);
  const [values, setValues] = useState({
    name: "",
    businessTypeCode: "",
    location: initialLocation,
  });
  const [errors, setErrors] = useState({});

  const submit = async (event) => {
    event.preventDefault();
    const businessErrors = validateBusinessInfo(values);
    const locationErrors = validateLocation(values.location, { requireAdminArea: false });
    const nextErrors = { ...businessErrors, ...locationErrors };
    setErrors(nextErrors);

    if (hasErrors(nextErrors)) return;

    try {
      const result = await createDraft({
        name: values.name.trim(),
        businessTypeCode: values.businessTypeCode,
        timezoneid: values.location.timezone,
        location: toLocationPayload(values.location),
      });
      const storeId = result.id ?? result.store?.id;
      navigate(`/seller/stores/${storeId}/setup/contact`, { replace: true });
    } catch {
      // The store exposes the API error below the form.
    }
  };

  return (
    <section className="hlm-setup-page hlm-create-setup-page">
      <div className="hlm-setup-page-heading">
        <div>
          <span className="hlm-seller-eyebrow">Sell on HLM</span>
          <h1>Create your store</h1>
          <p>
            Start with the essentials. You can complete contact, branding,
            hours and delivery after the draft is created.
          </p>
        </div>
        <span className="hlm-seller-status-badge">New store</span>
      </div>

      <div className="hlm-setup-grid">
        <CreateStoreSetupSidebar />

        <div className="hlm-setup-panel">
          <article className="hlm-setup-card">
            <SetupPageHeader
              icon={Store}
              title="Business information and location"
              description="These essentials create your draft and help nearby customers discover the store."
              badge="Required"
            />

            <form onSubmit={submit} noValidate>
              <div className="hlm-form-grid">
                <label className="hlm-field hlm-field-span-2">
                  <span>Store name</span>
                  <input
                    autoFocus
                    value={values.name}
                    onChange={(event) =>
                      setValues({ ...values, name: event.target.value })
                    }
                    placeholder="Paran Neighborhood Market"
                  />
                  {errors.name && (
                    <span className="hlm-field-error">{errors.name}</span>
                  )}
                </label>

                <label className="hlm-field hlm-field-span-2">
                  <span>Business type</span>
                  <select
                    value={values.businessTypeCode}
                    onChange={(event) =>
                      setValues({
                        ...values,
                        businessTypeCode: event.target.value,
                      })
                    }
                  >
                    <option value="">Choose a business type</option>
                    {BUSINESS_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {errors.businessTypeCode && (
                    <span className="hlm-field-error">
                      {errors.businessTypeCode}
                    </span>
                  )}
                </label>
              </div>

              <div className="hlm-form-divider" />
              <LocationFields
                compact
                value={values.location}
                errors={errors}
                onChange={(location) => setValues({ ...values, location })}
              />

              {apiError && <InlineNotice>{apiError}</InlineNotice>}
              <FormActions
                isSaving={isLoading}
                saveLabel="Create store and continue"
              />
            </form>
          </article>
        </div>
      </div>
    </section>
  );
}
