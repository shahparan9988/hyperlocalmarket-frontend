import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, MoreHorizontal, Package } from "lucide-react";
import { formatQuantity, MAX_PAGE, PAGE_SIZES, stockLabel } from "../utils/inventoryModel";

function Thumbnail({ url }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className="hlmi-thumbnail">
      {url && !failed
        ? <img src={url} alt="" loading="lazy" onError={() => setFailed(true)} />
        : <Package size={23} aria-hidden="true" />}
    </span>
  );
}

function Quantity({ value }) {
  return <span aria-label={value == null ? "Quantity unavailable" : undefined}>{formatQuantity(value)}</span>;
}

function UnavailableCost() {
  return <span aria-label="Cost not available yet" title="Cost tracking is coming soon">—</span>;
}

function pageNumbers(current, total) {
  const start = Math.max(1, Math.min(current - 1, total - 2));
  const end = Math.min(total, start + 2);
  const numbers = [];
  if (start > 1) numbers.push(1);
  if (start > 2) numbers.push("before");
  for (let number = start; number <= end; number += 1) numbers.push(number);
  if (end < total - 1) numbers.push("after");
  if (end < total) numbers.push(total);
  return numbers;
}

export default function InventoryTable({ storeId, result, filtered, onPage, onPageSize, onReset }) {
  const { items, pageNumber, pageSize, totalCount } = result.results;
  const pages = Math.max(1, Math.ceil(totalCount / pageSize));
  const lastPage = Math.min(pages, MAX_PAGE);
  const outOfRange = pageNumber > pages;
  const start = items.length ? (pageNumber - 1) * pageSize + 1 : 0;
  const end = items.length ? start + items.length - 1 : 0;
  const productsUrl = `/seller/stores/${storeId}/products`;

  return (
    <>
      <div className="hlmi-table-scroll" role="region" aria-label="Inventory quantities" tabIndex={0}>
        <table className="hlmi-table">
          <caption className="hlmi-sr-only">
            Inventory by product variant. Cost data and bulk selection are not available yet.
          </caption>
          <thead>
            <tr>
              <th scope="col" className="hlmi-check-cell">
                <input type="checkbox" className="hlmi-checkbox" disabled
                  aria-label="Select all rows, coming soon" title="Bulk actions are coming soon" />
              </th>
              <th scope="col">Product / variant</th>
              <th scope="col" className="hlmi-number">On hand</th>
              <th scope="col" className="hlmi-number">Reserved</th>
              <th scope="col" className="hlmi-number">Available</th>
              <th scope="col" className="hlmi-number">Unit cost</th>
              <th scope="col" className="hlmi-number">Stock value</th>
              <th scope="col">Status</th>
              <th scope="col" className="hlmi-action-cell">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => {
              const status = stockLabel(row.stockStatus);
              const archived = row.productStatus === "Archived";
              const target = archived
                ? `${productsUrl}?${new URLSearchParams({ status: "Archived", q: row.productName })}`
                : `${productsUrl}/${row.productId}/edit`;
              const canEnable = row.stockStatus === "TrackingOff" && !archived && row.isVariantListed;

              return (
                <tr key={row.productVariantId}>
                  <td className="hlmi-check-cell">
                    <input type="checkbox" className="hlmi-checkbox" disabled
                      aria-label={`Select ${row.productName}, ${row.variantName}, coming soon`}
                      title="Bulk actions are coming soon" />
                  </td>
                  <th scope="row" className="hlmi-product-column">
                    <div className="hlmi-product-cell">
                      <Thumbnail key={row.imageUrl || "placeholder"} url={row.imageUrl} />
                      <div>
                        <Link className="hlmi-product-name" to={target}>{row.productName}</Link>
                        <span className="hlmi-variant">
                          {row.variantName}{row.sku ? ` · ${row.sku}` : " · No SKU"}
                        </span>
                        <div className="hlmi-row-tags">
                          {row.productStatus !== "Published" && <span>{row.productStatus}</span>}
                          {!row.isVariantListed
                            ? <span>Retired variant</span>
                            : !row.isVariantActive && <span>Inactive variant</span>}
                        </div>
                      </div>
                    </div>
                  </th>
                  <td className="hlmi-number"><Quantity value={row.onHandQuantity} /></td>
                  <td className="hlmi-number"><Quantity value={row.reservedQuantity} /></td>
                  <td className="hlmi-number"><Quantity value={row.availableQuantity} /></td>
                  <td className="hlmi-number"><UnavailableCost /></td>
                  <td className="hlmi-number"><UnavailableCost /></td>
                  <td>
                    <span className={`hlmi-badge is-${status.tone}`}>
                      <span className="hlmi-status-dot" aria-hidden="true" />{status.label}
                    </span>
                    {row.stockStatus === "NeedsReview" && (
                      <small className="hlmi-status-note">Stock data needs checking</small>
                    )}
                  </td>
                  <td className="hlmi-action-cell">
                    {canEnable ? (
                      <Link className="hlmi-enable-link" to={target}
                        title="Open the product editor to enable stock tracking"
                        aria-label={`Open ${row.productName} to enable stock tracking`}>Enable</Link>
                    ) : (
                      <details className="hlmi-row-menu" name="hlmi-row-actions">
                        <summary aria-label={`Actions for ${row.productName}, ${row.variantName}`}>
                          <MoreHorizontal size={20} aria-hidden="true" />
                        </summary>
                        <div className="hlmi-row-menu-content">
                          <Link to={target}>{archived ? "Find product" : "Open product"}</Link>
                        </div>
                      </details>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!items.length && (
        <div className="hlmi-empty">
          <span className="hlmi-empty-icon"><Package size={28} aria-hidden="true" /></span>
          <h3>{outOfRange ? "This page is no longer available"
            : filtered ? "No inventory matches these filters" : "Your inventory starts with your products"}</h3>
          <p>{outOfRange ? "The number of matching items may have changed."
            : filtered ? "Try a different search or clear your filters."
              : "Physical products appear here, including products with stock tracking turned off."}</p>
          {outOfRange
            ? <button type="button" className="hlmi-button" onClick={() => onPage(lastPage)}>Go to page {lastPage}</button>
            : filtered
              ? <button type="button" className="hlmi-button" onClick={onReset}>Clear filters</button>
              : <Link className="hlmi-button is-primary" to={`${productsUrl}/new`}>Add product</Link>}
        </div>
      )}

      <div className="hlmi-pagination">
        <p role="status">{totalCount === 0 ? "0 matching variants" : items.length
          ? `Showing ${formatQuantity(start)}–${formatQuantity(end)} of ${formatQuantity(totalCount)} variants`
          : `${formatQuantity(totalCount)} matching variants`}</p>
        <div className="hlmi-actions">
          <label className="hlmi-page-size">Rows
            <select className="hlmi-control" aria-label="Rows per page" value={pageSize}
              onChange={(event) => onPageSize(event.target.value)}>
              {PAGE_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}
            </select>
          </label>
          <nav className="hlmi-page-buttons" aria-label="Inventory pages">
            <button type="button" className="hlmi-page-button" aria-label="Previous inventory page"
              disabled={pageNumber <= 1} onClick={() => onPage(Math.min(pageNumber - 1, lastPage))}>
              <ChevronLeft size={17} aria-hidden="true" />
            </button>
            {pageNumbers(Math.min(pageNumber, lastPage), lastPage).map((number) => (
              typeof number === "number"
                ? <button type="button" key={number}
                    className={`hlmi-page-button${number === pageNumber ? " is-current" : ""}`}
                    aria-label={`Inventory page ${number}`} aria-current={number === pageNumber ? "page" : undefined}
                    onClick={() => onPage(number)}>{number}</button>
                : <span className="hlmi-page-gap" key={number} aria-hidden="true">…</span>
            ))}
            <button type="button" className="hlmi-page-button" aria-label="Next inventory page"
              disabled={pageNumber >= lastPage} onClick={() => onPage(pageNumber + 1)}>
              <ChevronRight size={17} aria-hidden="true" />
            </button>
          </nav>
          <span className="hlmi-sr-only">{outOfRange ? `Page ${pageNumber} unavailable` : `Page ${pageNumber} of ${lastPage}`}</span>
        </div>
      </div>
    </>
  );
}
