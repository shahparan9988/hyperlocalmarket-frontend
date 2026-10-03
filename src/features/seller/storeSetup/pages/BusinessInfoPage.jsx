import { Store } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import FormActions from "../components/FormActions";
import InlineNotice from "../components/InlineNotice";
import SetupPageHeader from "../components/SetupPageHeader";
import { BUSINESS_TYPES } from "../constants/setupSections";
import { useStoreSetupStore } from "../state/useStoreSetupStore";
import {
  hasErrors,
  validateBusinessInfo,
} from "../utils/storeSetupValidation";

export default function BusinessInfoPage() {
  const { storeId } = useParams();
  const store = useStoreSetupStore((state) => state.store);
  const saveBusinessInfo = useStoreSetupStore((state) => state.saveBusinessInfo);
  const savingSection = useStoreSetupStore((state) => state.savingSection);
  const apiError = useStoreSetupStore((state) => state.error);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});
  const [values, setValues] = useState({
    name: "",
    businessTypeCode: "",
    description: "",
  });

  useEffect(() => {
    if (!store) return;
    setValues({
      name: store.name ?? "",
      businessTypeCode: store.businessTypeCode ?? "",
      description: store.description ?? "",
    });
  }, [store]);

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = validateBusinessInfo(values);
    setErrors(nextErrors);
    setSaved(false);
    if (hasErrors(nextErrors)) return;

    try {
      await saveBusinessInfo(storeId, {
        name: values.name.trim(),
        businessTypeCode: values.businessTypeCode,
        description: values.description.trim() || null,
      });
      setSaved(true);
    } catch {
      // API error is rendered below.
    }
  };

  return (
    <article className="hlm-setup-card">
      <SetupPageHeader
        icon={Store}
        title="Business information"
        description="Tell customers what your store is and what they can expect."
        badge="Required"
      />

      <form onSubmit={submit} noValidate>
        <div className="hlm-form-grid">
          <label className="hlm-field hlm-field-span-2">
            <span>Store name</span>
            <input
              value={values.name}
              onChange={(event) => setValues({ ...values, name: event.target.value })}
            />
            {errors.name && <span className="hlm-field-error">{errors.name}</span>}
          </label>

          <label className="hlm-field hlm-field-span-2">
            <span>Business type</span>
            <select
              value={values.businessTypeCode}
              onChange={(event) =>
                setValues({ ...values, businessTypeCode: event.target.value })
              }
            >
              <option value="">Choose a business type</option>
              {BUSINESS_TYPES.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            {errors.businessTypeCode && (
              <span className="hlm-field-error">{errors.businessTypeCode}</span>
            )}
          </label>

          <label className="hlm-field hlm-field-span-2">
            <span>Description <small>Optional</small></span>
            <textarea
              rows="5"
              maxLength="1000"
              value={values.description}
              onChange={(event) =>
                setValues({ ...values, description: event.target.value })
              }
              placeholder="A short description of your store and products"
            />
            <span className="hlm-field-help">
              {values.description.length}/1,000 characters
            </span>
            {errors.description && (
              <span className="hlm-field-error">{errors.description}</span>
            )}
          </label>
        </div>

        {apiError && <InlineNotice>{apiError}</InlineNotice>}
        {saved && <InlineNotice type="success">Business information saved.</InlineNotice>}
        <FormActions isSaving={savingSection === "business-info"} />
      </form>
    </article>
  );
}
