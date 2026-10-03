import { Clock3 } from "lucide-react";

const metrics = [
  { label: "Net sales", description: "After discounts and returns" },
  { label: "Gross profit", description: "Sales minus cost of goods sold" },
  { label: "Recorded expenses", description: "Rent, transport and other costs" },
  { label: "Estimated net profit", description: "Gross profit minus recorded expenses", accent: true },
];

export default function InventorySalesSummary() {
  return (
    <section className="hlmi-panel hlmi-sales-summary" aria-labelledby="hlmi-sales-heading">
      <div className="hlmi-section-heading">
        <div className="hlmi-heading-with-note">
          <h2 id="hlmi-sales-heading">Sales &amp; profit summary</h2>
          <span className="hlmi-pending-label">Coming soon</span>
        </div>
        <label>
          <span className="hlmi-sr-only">Reporting period</span>
          <select className="hlmi-control" disabled defaultValue="month" title="Reports are coming soon">
            <option value="month">This month</option>
          </select>
        </label>
      </div>
      <div className="hlmi-metric-grid">
        {metrics.map((metric) => (
          <div className={`hlmi-metric${metric.accent ? " is-accent" : ""}`} key={metric.label}>
            <span>{metric.label}</span>
            <strong aria-label="Not available yet">—</strong>
            <p>{metric.description}</p>
          </div>
        ))}
      </div>
      <p className="hlmi-report-note">
        <Clock3 size={17} aria-hidden="true" />
        Sales and expense reporting is coming soon. Figures are not available yet.
      </p>
    </section>
  );
}
