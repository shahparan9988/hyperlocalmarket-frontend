import StoreLocationPicker from "./StoreLocationPicker";

function FieldError({ children }) {
  return children ? <span className="hlm-field-error">{children}</span> : null;
}

const locationLabels = {
  BD: {
    locality: "Area or neighbourhood",
    level1: "Division",
    level2: "District",
    level3: "Thana or Upazila",
  },
  AU: {
    locality: "Suburb",
    level1: "State",
    level2: "LGA / Region",
    level3: "Suburb",
  },
};

// Replace these starter labels with the results from your administrative-area API.
// No database IDs are fabricated here. When the API is connected, its real IDs
// stay hidden while the seller sees only the verified names.
const adminAreaOptions = {
  BD: {
    level1: [
      { id: null, name: "Dhaka" },
      { id: null, name: "Chattogram" },
      { id: null, name: "Rajshahi" },
      { id: null, name: "Khulna" },
      { id: null, name: "Barishal" },
      { id: null, name: "Sylhet" },
      { id: null, name: "Rangpur" },
      { id: null, name: "Mymensingh" },
    ],
    level2: [
      { id: null, name: "Dhaka" },
      { id: null, name: "Gazipur" },
      { id: null, name: "Narayanganj" },
    ],
    level3: [
      { id: null, name: "Dhanmondi" },
      { id: null, name: "Gulshan" },
      { id: null, name: "Mirpur" },
    ],
  },
  AU: {
    level1: [
      { id: null, name: "NSW" },
      { id: null, name: "VIC" },
      { id: null, name: "QLD" },
      { id: null, name: "SA" },
      { id: null, name: "WA" },
      { id: null, name: "TAS" },
      { id: null, name: "ACT" },
      { id: null, name: "NT" },
    ],
    level2: [],
    level3: [],
  },
};

function optionsIncludingCurrent(options, currentId, currentName) {
  if (!currentName || options.some((option) => option.name === currentName)) {
    return options;
  }

  return [{ id: currentId ?? "current", name: currentName }, ...options];
}

export default function LocationFields({
  value,
  onChange,
  errors = {},
  compact = false,
}) {
  const labels = locationLabels[value.countryCode] ?? locationLabels.BD;
  const options = adminAreaOptions[value.countryCode] ?? adminAreaOptions.BD;

  const changeRoot = (key, nextValue) => {
    if (key !== "countryCode") {
      onChange({ ...value, [key]: nextValue });
      return;
    }

    onChange({
      ...value,
      countryCode: nextValue,
      address: { ...value.address, locality: "", region: "" },
      adminArea: {
        ...value.adminArea,
        level1Id: null,
        level2Id: null,
        level3Id: null,
        level1: "",
        level2: "",
        level3: "",
      },
    });
  };

  const changeAddress = (key, nextValue) => {
    onChange({
      ...value,
      address: { ...value.address, [key]: nextValue },
    });
  };

  const changeAdminArea = (level, selectedName) => {
    const selected = options[level].find(
      (option) => option.name === selectedName
    );
    const idKey = `${level}Id`;
    const nextAdminArea = {
      ...value.adminArea,
      [idKey]: selected?.id ?? null,
      [level]: selectedName,
    };

    if (level === "level1") {
      nextAdminArea.level2Id = null;
      nextAdminArea.level3Id = null;
      nextAdminArea.level2 = "";
      nextAdminArea.level3 = "";
    }

    if (level === "level2") {
      nextAdminArea.level3Id = null;
      nextAdminArea.level3 = "";
    }

    onChange({
      ...value,
      address:
        level === "level1"
          ? { ...value.address, region: selectedName }
          : value.address,
      adminArea: nextAdminArea,
    });
  };

  const level1Options = optionsIncludingCurrent(
    options.level1,
    value.adminArea.level1Id,
    value.adminArea.level1
  );
  const level2Options = optionsIncludingCurrent(
    options.level2,
    value.adminArea.level2Id,
    value.adminArea.level2
  );
  const level3Options = optionsIncludingCurrent(
    options.level3,
    value.adminArea.level3Id,
    value.adminArea.level3
  );

  const changeCoordinates = (coordinates) => {
    onChange({ ...value, coordinates });
  };

  const applyResolvedLocation = (location) => {
    onChange({
      ...value,
      countryCode: location.countryCode || value.countryCode,
      coordinates: {
        ...value.coordinates,
        ...location.coordinates,
      },
      address: {
        ...value.address,
        ...location.address,
        addressLine2:
          location.address.addressLine2 || value.address.addressLine2,
        landmark: location.address.landmark || value.address.landmark,
      },
      adminArea: {
        ...value.adminArea,
        ...location.adminArea,
        level1Id: location.adminArea.level1Id ?? null,
        level2Id: location.adminArea.level2Id ?? null,
        level3Id: location.adminArea.level3Id ?? null,
      },
    });
  };

  return (
    <>
      <StoreLocationPicker
        countryCode={value.countryCode}
        coordinates={value.coordinates}
        address={value.address}
        errors={errors}
        onCoordinatesChange={changeCoordinates}
        onLocationResolved={applyResolvedLocation}
      />

      <div className="hlm-form-divider" />
      <div className="hlm-form-section-heading hlm-location-section-heading">
        <h3>Postal address</h3>
        <p>Customer-friendly address details</p>
      </div>

      <div className="hlm-form-grid">
        <label className="hlm-field">
          <span>Country</span>
          <select
            value={value.countryCode}
            onChange={(event) => changeRoot("countryCode", event.target.value)}
          >
            <option value="BD">Bangladesh</option>
            <option value="AU">Australia</option>
          </select>
          <FieldError>{errors.countryCode}</FieldError>
        </label>

        <label className="hlm-field">
          <span>Postcode <small>Optional</small></span>
          <input
            value={value.address.postcode}
            onChange={(event) => changeAddress("postcode", event.target.value)}
            inputMode="numeric"
            placeholder={value.countryCode === "BD" ? "1209" : "2150"}
          />
        </label>

        <label className="hlm-field hlm-field-span-2">
          <span>Address line 1</span>
          <input
            value={value.address.addressLine1}
            onChange={(event) => changeAddress("addressLine1", event.target.value)}
            placeholder="Road, house, shop or building"
          />
          <span className="hlm-field-help">Required by the persisted address.</span>
          <FieldError>{errors.addressLine1}</FieldError>
        </label>

        {!compact && (
          <label className="hlm-field">
            <span>Address line 2 <small>Optional</small></span>
            <input
              value={value.address.addressLine2}
              onChange={(event) => changeAddress("addressLine2", event.target.value)}
              placeholder="Building, floor or shop"
            />
          </label>
        )}

        <label className="hlm-field">
          <span>{labels.locality} <small>Optional</small></span>
          <input
            value={value.address.locality}
            onChange={(event) => changeAddress("locality", event.target.value)}
            placeholder={value.countryCode === "BD" ? "Dhanmondi" : "Wiley Park"}
          />
        </label>

        {!compact && (
          <label className="hlm-field hlm-field-span-2">
            <span>Landmark <small>Optional</small></span>
            <input
              value={value.address.landmark}
              onChange={(event) => changeAddress("landmark", event.target.value)}
              placeholder="e.g. Beside the community centre"
            />
          </label>
        )}
      </div>

      {!compact && (
        <>
          <div className="hlm-form-divider" />
          <div className="hlm-form-section-heading hlm-location-section-heading">
            <h3>Administrative area</h3>
            <p>IDs stay hidden; verified names are shown to sellers</p>
          </div>

          <div className="hlm-form-grid hlm-form-grid-3">
            <label className="hlm-field">
              <span>{labels.level1}</span>
              <select
                value={value.adminArea.level1}
                onChange={(event) => changeAdminArea("level1", event.target.value)}
              >
                <option value="">Choose {labels.level1.toLowerCase()}</option>
                {level1Options.map((option) => (
                  <option key={`${option.id}-${option.name}`} value={option.name}>
                    {option.name}
                  </option>
                ))}
              </select>
              <FieldError>{errors.level1}</FieldError>
            </label>

            <label className="hlm-field">
              <span>{labels.level2}</span>
              <select
                value={value.adminArea.level2}
                onChange={(event) => changeAdminArea("level2", event.target.value)}
              >
                <option value="">Choose {labels.level2.toLowerCase()}</option>
                {level2Options.map((option) => (
                  <option key={`${option.id}-${option.name}`} value={option.name}>
                    {option.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="hlm-field">
              <span>{labels.level3}</span>
              <select
                value={value.adminArea.level3}
                onChange={(event) => changeAdminArea("level3", event.target.value)}
              >
                <option value="">Choose {labels.level3.toLowerCase()}</option>
                {level3Options.map((option) => (
                  <option key={`${option.id}-${option.name}`} value={option.name}>
                    {option.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {value.adminArea.level1 && (
            <p className="hlm-field-help hlm-location-region-note">
              PostalAddress.Region will use the selected {labels.level1}:{" "}
              <strong>{value.adminArea.level1}</strong>.
            </p>
          )}
        </>
      )}
    </>
  );
}
