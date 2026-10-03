export default function SetupPageHeader({ icon: Icon, title, description, badge }) {
  return (
    <header className="hlm-setup-card-header">
      <span className="hlm-setup-card-icon">
        <Icon size={20} />
      </span>
      <div>
        <div className="hlm-setup-title-line">
          <h2>{title}</h2>
          {badge && <span className="hlm-form-badge">{badge}</span>}
        </div>
        <p>{description}</p>
      </div>
    </header>
  );
}
