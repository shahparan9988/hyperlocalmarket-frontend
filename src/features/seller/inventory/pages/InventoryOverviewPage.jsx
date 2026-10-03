import { useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { ArrowRight, Download, NotebookPen, PackagePlus, Plus } from "lucide-react";
import { useAuthStore } from "../../../auth/state/authStore";
import InventoryFilters from "../components/InventoryFilters";
import InventorySalesSummary from "../components/InventorySalesSummary";
import InventoryTable from "../components/InventoryTable";
import InventoryTabs from "../components/InventoryTabs";
import useInventoryOverview from "../hooks/useInventoryOverview";
import { hasInventoryFilters, readInventoryFilters } from "../utils/inventoryModel";
import "../inventory.css";

function UpcomingButton({ icon, children, primary = false }) {
  const Icon = icon;
  return (
    <button type="button" className={`hlmi-button${primary ? " is-primary" : ""}`}
      disabled title={`${children} is coming soon`}>
      <Icon size={17} aria-hidden="true" />{children}<span className="hlmi-soon">Soon</span>
    </button>
  );
}

function InventorySession({ storeId }) {
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => readInventoryFilters(params), [params]);
  const {
    result, loading, error, categories, categoriesLoading, categoriesError, refresh,
  } = useInventoryOverview(storeId, filters);

  function change(name, value) {
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      if (value === "" || value == null) next.delete(name);
      else next.set(name, String(value));
      if (name !== "page") next.set("page", "1");
      return next;
    });
  }

  function resetFilters() {
    setParams({ page: "1", pageSize: String(filters.pageSize) });
  }

  return (
    <div className="hlmi-root">
      <header className="hlmi-page-heading">
        <div>
          <h1>Inventory</h1>
          <p>Manage stock, record sales and understand your profit.</p>
        </div>
        <div className="hlmi-actions">
          <UpcomingButton icon={Download}>Export</UpcomingButton>
          <UpcomingButton icon={PackagePlus}>Receive stock</UpcomingButton>
          <UpcomingButton icon={Plus} primary>Record sale</UpcomingButton>
        </div>
      </header>

      <InventoryTabs />
      <InventorySalesSummary />

      <section className="hlmi-panel hlmi-stock-panel" aria-labelledby="hlmi-stock-heading">
        <div className="hlmi-section-heading hlmi-stock-heading">
          <h2 id="hlmi-stock-heading">Stock on hand</h2>
          <p className="hlmi-valuation">
            <span>Stock value at cost</span>
            <strong aria-label="Not available yet" title="Cost tracking is coming soon">—</strong>
            <span className="hlmi-valuation-note">Cost tracking coming soon</span>
          </p>
        </div>

        <InventoryFilters filters={filters} categories={categories}
          categoriesLoading={categoriesLoading} categoriesError={categoriesError}
          summary={result?.summary} onChange={change} onReset={resetFilters}
          onRefresh={refresh} refreshing={loading || categoriesLoading} />

        {categoriesError && (
          <div className="hlmi-notice" role="alert">
            <span>Store details and categories could not be loaded. {categoriesError}</span>
            <button type="button" className="hlmi-text-button" onClick={refresh}>Retry</button>
          </div>
        )}

        <div aria-busy={loading}>
          {error ? (
            <div className="hlmi-empty" role="alert">
              <h3>Inventory could not be loaded</h3><p>{error}</p>
              <div className="hlmi-actions">
                <button type="button" className="hlmi-button" onClick={refresh}>Try again</button>
                {hasInventoryFilters(filters) && (
                  <button type="button" className="hlmi-button" onClick={resetFilters}>Clear filters</button>
                )}
              </div>
            </div>
          ) : loading ? (
            <div className="hlmi-loading" role="status">
              <span className="hlmi-spinner" aria-hidden="true" />Loading inventory…
            </div>
          ) : (
            <InventoryTable storeId={storeId} result={result} filtered={hasInventoryFilters(filters)}
              onPage={(page) => change("page", page)}
              onPageSize={(size) => change("pageSize", size)} onReset={resetFilters} />
          )}
        </div>

        <div className="hlmi-sales-banner">
          <span className="hlmi-sales-banner-icon"><NotebookPen size={24} aria-hidden="true" /></span>
          <div>
            <strong>Selling through chat, on the phone or in store?</strong>
            <p>Record those sales here when manual sales recording becomes available.</p>
          </div>
          <button type="button" className="hlmi-banner-action" disabled title="Manual sales recording is coming soon">
            Record a sale <ArrowRight size={17} aria-hidden="true" /><span className="hlmi-soon">Soon</span>
          </button>
        </div>
      </section>

      <p className="hlmi-footer-note">
        Stock tracking is optional. A dash means a value is unavailable, not zero.
        Status counts cover all matching pages. Costs and bulk actions are coming soon.
      </p>
    </div>
  );
}

export default function InventoryOverviewPage() {
  const { storeId } = useParams();
  const actorId = useAuthStore((state) => state.userId);
  return <InventorySession key={`${actorId}:${storeId}`} storeId={storeId} />;
}
