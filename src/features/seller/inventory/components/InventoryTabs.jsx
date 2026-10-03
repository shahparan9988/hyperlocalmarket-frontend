const upcomingSections = ["Stock movements", "Purchases", "Sales & profit", "Expenses"];

export default function InventoryTabs() {
  return (
    <nav className="hlmi-tabs" aria-label="Inventory sections">
      <span className="hlmi-tab is-active" aria-current="page">Stock overview</span>
      {upcomingSections.map((label) => (
        <button key={label} type="button" className="hlmi-tab" disabled title={`${label} is coming soon`}>
          {label}<span className="hlmi-soon">Soon</span>
        </button>
      ))}
    </nav>
  );
}
