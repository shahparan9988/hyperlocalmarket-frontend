import {
  Clock3,
  ContactRound,
  Image,
  MapPin,
  Rocket,
  Store,
  Truck,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { SETUP_SECTIONS } from "../constants/setupSections";
import usePublishReadiness from "../hooks/usePublishReadiness";
import SetupSectionStatus from "./SetupSectionStatus";
import StoreSetupProgress from "./StoreSetupProgress";

const icons = {
  "business-info": Store,
  location: MapPin,
  contact: ContactRound,
  branding: Image,
  "business-hours": Clock3,
  "pickup-delivery": Truck,
};

export default function StoreSetupSidebar() {
  const { sections, canPublish, isPublished } = usePublishReadiness();
  const statusByKey = Object.fromEntries(
    sections.map((section) => [section.key, section])
  );

  return (
    <aside className="hlm-setup-sidebar" aria-label="Store setup sections">
      <StoreSetupProgress />

      <nav className="hlm-setup-section-nav">
        {SETUP_SECTIONS.map((section) => {
          const Icon = icons[section.key];
          const status = statusByKey[section.key];

          return (
            <NavLink
              key={section.key}
              to={section.path}
              className={({ isActive }) =>
                `hlm-setup-section-link${isActive ? " is-active" : ""}`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="hlm-setup-section-icon">
                    <Icon size={17} />
                  </span>
                  <span className="hlm-setup-section-copy">
                    <strong>{section.label}</strong>
                    <small>{section.description}</small>
                  </span>
                  <SetupSectionStatus
                    isComplete={Boolean(status?.isComplete)}
                    isCurrent={isActive}
                    optional={!section.requiredForPublish}
                  />
                </>
              )}
            </NavLink>
          );
        })}

        <NavLink
          to="publish"
          className={({ isActive }) =>
            `hlm-setup-section-link${isActive ? " is-active" : ""}`
          }
        >
          {({ isActive }) => (
            <>
              <span className="hlm-setup-section-icon">
                <Rocket size={17} />
              </span>
              <span className="hlm-setup-section-copy">
                <strong>Publish</strong>
                <small>Make your store visible</small>
              </span>
              <SetupSectionStatus
                isComplete={isPublished}
                isCurrent={isActive}
                isLocked={!canPublish && !isPublished}
              />
            </>
          )}
        </NavLink>
      </nav>
    </aside>
  );
}
