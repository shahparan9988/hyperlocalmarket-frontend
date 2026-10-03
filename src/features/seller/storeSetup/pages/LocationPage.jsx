import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import FormActions from "../components/FormActions";
import InlineNotice from "../components/InlineNotice";
import LocationFields from "../components/LocationFields";
import SetupPageHeader from "../components/SetupPageHeader";
import { EMPTY_LOCATION } from "../constants/setupSections";
import { useStoreSetupStore } from "../state/useStoreSetupStore";
import {
  hasErrors,
  toLocationPayload,
  validateLocation,
} from "../utils/storeSetupValidation";

function mapLocation(location) {
  return {
    ...EMPTY_LOCATION,
    ...location,
    coordinates: {
      ...EMPTY_LOCATION.coordinates,
      ...location?.coordinates,
    },
    address: {
      ...EMPTY_LOCATION.address,
      ...location?.address,
    },
    adminArea: {
      ...EMPTY_LOCATION.adminArea,
      ...location?.adminArea,
    },
  };
}

export default function LocationPage() {
  const { storeId } = useParams();
  const store = useStoreSetupStore((state) => state.store);
  const saveLocation = useStoreSetupStore((state) => state.saveLocation);
  const savingSection = useStoreSetupStore((state) => state.savingSection);
  const apiError = useStoreSetupStore((state) => state.error);
  const [location, setLocation] = useState(() => mapLocation(null));
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (store?.location) setLocation(mapLocation(store.location));
  }, [store]);

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = validateLocation(location, { requireAdminArea: true });
    setErrors(nextErrors);
    setSaved(false);
    if (hasErrors(nextErrors)) return;

    try {
      await saveLocation(storeId, toLocationPayload(location));
      setSaved(true);
    } catch {
      // API error is rendered below.
    }
  };

  return (
    <article className="hlm-setup-card hlm-location-page-card">
      <SetupPageHeader
        icon={MapPin}
        title="Store location"
        description="Search the address, verify its structure, then place the pin at the customer entrance."
      />

      <form onSubmit={submit} noValidate>
        <LocationFields value={location} onChange={setLocation} errors={errors} />
        {apiError && <InlineNotice>{apiError}</InlineNotice>}
        {saved && <InlineNotice type="success">Store location saved.</InlineNotice>}
        <FormActions
          isSaving={savingSection === "location"}
          saveLabel="Save store location"
        />
      </form>
    </article>
  );
}
