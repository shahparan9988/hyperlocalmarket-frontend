import { Clock3, Copy, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import FormActions from "../components/FormActions";
import InlineNotice from "../components/InlineNotice";
import SetupPageHeader from "../components/SetupPageHeader";
import { useStoreSetupStore } from "../state/useStoreSetupStore";
import {
  hasErrors,
  validateBusinessHours,
} from "../utils/storeSetupValidation";

const dayNames = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const createDefaultHours = () =>
  dayNames.map((dayOfWeek) => ({
    dayOfWeek,
    isClosed: false,
    isOpen24Hours: false,
    periods: [{ opensAt: "09:00", closesAt: "18:00" }],
  }));

const backendDayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function normalizeTime(value, fallback = "") {
  if (!value) {
    return fallback;
  }

  return String(value).slice(0, 5);
}

function resolveDayName(value) {
  if (
    typeof value === "number" &&
    backendDayNames[value]
  ) {
    return backendDayNames[value];
  }

  const stringValue = String(value ?? "").trim();

  if (/^[0-6]$/.test(stringValue)) {
    return backendDayNames[Number(stringValue)];
  }

  return dayNames.find(
    (dayName) =>
      dayName.toLowerCase() ===
      stringValue.toLowerCase()
  );
}

function normalizeHours(hours) {
  const source = Array.isArray(hours) ? hours : [];
  const defaults = createDefaultHours();

  if (source.length === 0) {
    /*
     * No schedule exists yet. Present useful suggested
     * values without treating them as already saved.
     */
    return defaults;
  }

  /*
   * Handle the grouped shape returned immediately after
   * saving or already held in Zustand.
   */
  const isGroupedShape = source.some(
    (day) =>
      Array.isArray(day.periods) ||
      Object.prototype.hasOwnProperty.call(
        day,
        "isClosed"
      )
  );

  if (isGroupedShape) {
    const byDay = Object.fromEntries(
      source
        .map((day) => [
          resolveDayName(day.dayOfWeek),
          day,
        ])
        .filter(([dayName]) => Boolean(dayName))
    );

    return defaults.map((fallback) => {
      const existing = byDay[fallback.dayOfWeek];

      if (!existing) {
        return {
          ...fallback,
          isClosed: true,
        };
      }

      return {
        dayOfWeek: fallback.dayOfWeek,
        isClosed: Boolean(existing.isClosed),
        isOpen24Hours: Boolean(
          existing.isOpen24Hours
        ),
        periods: existing.periods?.length
          ? existing.periods.map((period) => ({
              opensAt: normalizeTime(
                period.opensAt,
                "09:00"
              ),
              closesAt: normalizeTime(
                period.closesAt,
                "18:00"
              ),
            }))
          : [{ opensAt: "09:00", closesAt: "18:00" }],
      };
    });
  }

  /*
   * Handle the flat StoreBusinessHour rows returned by
   * your current setup-status projection.
   */
  const rowsByDay = new Map();

  source.forEach((row) => {
    const dayName = resolveDayName(row.dayOfWeek);

    if (!dayName) {
      return;
    }

    const rows = rowsByDay.get(dayName) ?? [];
    rows.push(row);
    rowsByDay.set(dayName, rows);
  });

  return defaults.map((fallback) => {
    const rows = rowsByDay.get(fallback.dayOfWeek) ?? [];

    if (rows.length === 0) {
      return {
        ...fallback,
        isClosed: true,
      };
    }

    const open24Hours = rows.some(
      (row) => row.isOpen24Hours
    );

    return {
      dayOfWeek: fallback.dayOfWeek,
      isClosed: false,
      isOpen24Hours: open24Hours,
      periods: open24Hours
        ? [{ opensAt: "09:00", closesAt: "18:00" }]
        : rows
            .map((row) => ({
              opensAt: normalizeTime(row.opensAt),
              closesAt: normalizeTime(row.closesAt),
            }))
            .sort((first, second) =>
              first.opensAt.localeCompare(second.opensAt)
            ),
    };
  });
}

export default function BusinessHoursPage() {
  const { storeId } = useParams();
  const store = useStoreSetupStore((state) => state.store);
  const saveBusinessHours = useStoreSetupStore((state) => state.saveBusinessHours);
  const savingSection = useStoreSetupStore((state) => state.savingSection);
  const apiError = useStoreSetupStore((state) => state.error);
  const [hours, setHours] = useState(createDefaultHours);
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const isSaving = savingSection === "business-hours";
  const hasStoredBusinessHours =
    Array.isArray(store?.businessHours) &&
    store.businessHours.length > 0;

  const showMissingHoursWarning =
    Boolean(store) &&
    !hasStoredBusinessHours &&
    !saved;

  useEffect(() => {
    if (store?.businessHours) setHours(normalizeHours(store.businessHours));
  }, [store]);

  const updateDay = (dayIndex, patch) => {
    setHours((current) =>
      current.map((day, index) => (index === dayIndex ? { ...day, ...patch } : day))
    );
  };

  const updatePeriod = (dayIndex, periodIndex, key, value) => {
    const periods = hours[dayIndex].periods.map((period, index) =>
      index === periodIndex ? { ...period, [key]: value } : period
    );
    updateDay(dayIndex, { periods });
  };

  const addPeriod = (dayIndex) => {
    if (hours[dayIndex].periods.length >= 4) {
      setErrors((current) => ({
        ...current,
        [`${hours[dayIndex].dayOfWeek}-periods`]:
          "A maximum of four periods is allowed.",
      }));

      return;
    }

    updateDay(dayIndex, {
      periods: [
        ...hours[dayIndex].periods,
        {
          opensAt: "",
          closesAt: "",
        },
      ],
    });
  };

  const removePeriod = (dayIndex, periodIndex) => {
    updateDay(dayIndex, {
      periods: hours[dayIndex].periods.filter((_, index) => index !== periodIndex),
    });
  };

  const copyMondayToAll = () => {
    const monday = hours[0];
    setHours((current) =>
      current.map((day, index) =>
        index === 0
          ? day
          : {
              ...day,
              isClosed: monday.isClosed,
              isOpen24Hours: monday.isOpen24Hours,
              periods: monday.periods.map((period) => ({ ...period })),
            }
      )
    );
  };

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = validateBusinessHours(hours);
    setErrors(nextErrors);
    setSaved(false);
    if (hasErrors(nextErrors)) return;

    try {
      await saveBusinessHours(storeId, { hours });
      setSaved(true);
    } catch {
      // API error is rendered below.
    }
  };

  return (
    <article className="hlm-setup-card">
      <SetupPageHeader
        icon={Clock3}
        title="Business hours"
        description="Tell customers when the store is open."
        badge="For orders"
      />

      {showMissingHoursWarning && (
        <InlineNotice>
          Business hours have not been configured. You can still
          publish and accept orders, but customers will be advised
          to contact your store before ordering or pickup.
        </InlineNotice>
      )}

      <form onSubmit={submit} noValidate>
        <div className="hlm-hours-toolbar">
          <p>All times use <strong>{store?.timeZoneId || "your store timezone"}</strong>.</p>
          <button className="hlm-btn hlm-btn-secondary" type="button" disabled={isSaving} onClick={copyMondayToAll}>
            <Copy size={15} /> Copy Monday to all
          </button>
        </div>

        <div className="hlm-hours-list">
          {hours.map((day, dayIndex) => (
            <section className="hlm-hours-day" key={day.dayOfWeek}>
              <div className="hlm-hours-day-heading">
                <strong>{day.dayOfWeek}</strong>
                <label className="hlm-switch-label">
                  <input
                    type="checkbox"
                    disabled={isSaving}
                    checked={!day.isClosed}
                    onChange={(event) => updateDay(dayIndex, { isClosed: !event.target.checked })}
                  />
                  <span className="hlm-switch" />
                  {day.isClosed ? "Closed" : "Open"}
                </label>
              </div>

              {!day.isClosed && (
                <div className="hlm-hours-day-body">
                  <label className="hlm-checkbox-label">
                    <input
                      type="checkbox"
                      disabled={isSaving}
                      checked={day.isOpen24Hours}
                      onChange={(event) =>
                        updateDay(dayIndex, { isOpen24Hours: event.target.checked })
                      }
                    />
                    Open 24 hours
                  </label>

                  {!day.isOpen24Hours && day.periods.map((period, periodIndex) => (
                    <div className="hlm-hours-period" key={`${day.dayOfWeek}-${periodIndex}`}>
                      <label className="hlm-field">
                        <span>Opens</span>
                        <input
                          type="time"
                          disabled={isSaving}
                          value={period.opensAt}
                          onChange={(event) =>
                            updatePeriod(dayIndex, periodIndex, "opensAt", event.target.value)
                          }
                        />
                      </label>
                      <label className="hlm-field">
                        <span>Closes</span>
                        <input
                          type="time"
                          disabled={isSaving}
                          value={period.closesAt}
                          onChange={(event) =>
                            updatePeriod(dayIndex, periodIndex, "closesAt", event.target.value)
                          }
                        />
                      </label>
                      {day.periods.length > 1 && (
                        <button
                          className="hlm-icon-danger"
                          type="button"
                          disabled={isSaving}
                          aria-label="Remove time period"
                          onClick={() => removePeriod(dayIndex, periodIndex)}
                        >
                          <Trash2 size={17} />
                        </button>
                      )}
                      {errors[`${day.dayOfWeek}-${periodIndex}`] && (
                        <span className="hlm-field-error hlm-hours-error">
                          {errors[`${day.dayOfWeek}-${periodIndex}`]}
                        </span>
                      )}
                    </div>
                  ))}

                  {!day.isOpen24Hours && (
                    <>
                      <button
                        className="hlm-text-button"
                        type="button"
                        disabled={
                          isSaving || day.periods.length >= 4
                        }
                        onClick={() => addPeriod(dayIndex)}
                      >
                        <Plus size={15} />
                        Add another period
                      </button>
                      
                      {errors[`${day.dayOfWeek}-periods`] && (
                        <span className="hlm-field-error">
                          {errors[`${day.dayOfWeek}-periods`]}
                        </span>
                      )}
                    </>
                  )}
                </div>
              )}
            </section>
          ))}
        </div>

        {apiError && <InlineNotice>{apiError}</InlineNotice>}
        {saved && <InlineNotice type="success">Business hours saved.</InlineNotice>}
        <FormActions isSaving={isSaving} />
      </form>
    </article>
  );
}
