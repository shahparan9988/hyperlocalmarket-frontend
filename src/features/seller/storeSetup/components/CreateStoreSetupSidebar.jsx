import {
  Clock3,
  ContactRound,
  Image,
  LockKeyhole,
  MapPin,
  Rocket,
  Store,
  Truck,
} from "lucide-react";

const sections = [
  {
    key: "business-info",
    label: "Business info",
    description: "Store name and type",
    icon: Store,
    state: "Now",
    active: true,
  },
  {
    key: "location",
    label: "Location",
    description: "Address and map pin",
    icon: MapPin,
    state: "Now",
    active: true,
  },
  {
    key: "contact",
    label: "Contact",
    description: "Phone, email and timezone",
    icon: ContactRound,
    state: "Next",
  },
  {
    key: "branding",
    label: "Branding",
    description: "Logo and cover photo",
    icon: Image,
    state: "Optional",
  },
  {
    key: "business-hours",
    label: "Business hours",
    description: "Required for orders",
    icon: Clock3,
    state: "Later",
  },
  {
    key: "pickup-delivery",
    label: "Pickup & delivery",
    description: "Required for orders",
    icon: Truck,
    state: "Later",
  },
];

export default function CreateStoreSetupSidebar() {
  return (
    <aside className="hlm-setup-sidebar hlm-create-setup-sidebar">
      <div className="hlm-create-progress">
        <span>Creating draft store</span>
        <strong>Essentials</strong>
        <p>Business information and location are saved together.</p>
      </div>

      <nav className="hlm-setup-section-nav" aria-label="Store setup sections">
        {sections.map(({ key, label, description, icon: Icon, state, active }) => (
          <div
            key={key}
            className={`hlm-setup-section-link is-static${active ? " is-active" : ""}`}
            aria-current={active ? "step" : undefined}
          >
            <span className="hlm-setup-section-icon">
              <Icon size={17} />
            </span>
            <span className="hlm-setup-section-copy">
              <strong>{label}</strong>
              <small>{description}</small>
            </span>
            <span className={`hlm-setup-item-state${active ? " is-current" : ""}`}>
              {state}
            </span>
          </div>
        ))}

        <div className="hlm-setup-section-link is-static is-disabled">
          <span className="hlm-setup-section-icon">
            <Rocket size={17} />
          </span>
          <span className="hlm-setup-section-copy">
            <strong>Publish</strong>
            <small>Available after required setup</small>
          </span>
          <span className="hlm-setup-item-state is-locked">
            <LockKeyhole size={12} /> Locked
          </span>
        </div>
      </nav>
    </aside>
  );
}
