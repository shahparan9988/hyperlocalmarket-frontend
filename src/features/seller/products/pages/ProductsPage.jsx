import { offeredVariants } from "../utils/variantOptions";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useOutletContext, useSearchParams } from "react-router-dom";
import { Archive, Eye, FolderPlus, MoreHorizontal, Package, Pencil, Plus, RefreshCw, Search } from "lucide-react";
import { availableQuantity, priceLabel, productError } from "../utils/productModel";
import { categoryLabel, createCategoryIndex } from "../utils/categoryTree";
import CategoryPicker from "../components/CategoryPicker";
import CreateCategoryDialog from "../components/CreateCategoryDialog";
import StockAdjustment from "../components/StockAdjustment";
import { ProductPreviewDialog, ProductThumbnail } from "../components/StorefrontPreview";

function ProductResults({ query, onPage, refresh, notice }) {
  const { api, data, storeId } = useOutletContext();
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(notice || "");
  const [busyId, setBusyId] = useState(null);
  const [stock, setStock] = useState(null);
  const [preview, setPreview] = useState(null);
  const lock = useRef(false);
  const index = useMemo(() => createCategoryIndex(data.storeCategories), [data.storeCategories]);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    api.list(query, controller.signal).then((response) => { if (active) setResult(response); })
      .catch((failure) => { if (active) setError(productError(failure)); });
    return () => { active = false; controller.abort(); };
  }, [api, query]);
  const replace = (updated) => setResult((current) => ({ ...current,
    items: current.items.map((p) => p.id === updated.id ? updated : p),
  }));
  async function mutate(product, operation, message, reload = false) {
    if (lock.current) return;
    lock.current = true; setBusyId(product.id); setError(""); setSuccess("");
    try { const updated = await operation(); replace(updated); setSuccess(message); if (reload) refresh(message); }
    catch (failure) { setError(productError(failure)); }
    finally { lock.current = false; setBusyId(null); }
  }
  const currentItems = result?.items.filter((p) => query.status === "Current" ? p.status !== "Archived" : p.status === query.status) || [];
  return <>
    {error && <div className="hlmp-notice is-error" role="alert">{error} <button type="button" onClick={refresh}>Refresh list</button></div>}
    {success && <p className="hlmp-notice is-success" role="status">{success}</p>}
    {!result && !error && <p role="status">Loading products…</p>}
    {result && <>
      <div className="hlmp-table-wrap"><table className="hlmp-table"><thead><tr>
        <th>Product</th><th>Price</th><th>Availability</th><th>Listing status</th><th>Actions</th>
      </tr></thead><tbody>
        {currentItems.map((product) => {
          const quantity = availableQuantity(product);
          const offered = offeredVariants(product);
          const busy = busyId !== null;
          return <tr key={product.id} aria-busy={busyId === product.id}>
            <td data-label="Product"><div className="hlmp-product-cell"><ProductThumbnail product={product} />
              <div><strong>{product.name}</strong><small className="hlmp-path">{categoryLabel(index, product.storeCategoryId)}</small>
                {product.variants.length > 1 && <small>{offered.length} offered / {product.variants.length} variants · {product.options?.map((o) => o.name).join(" / ") || product.variantOptionName}</small>}</div></div></td>
            <td data-label="Price"><strong>{priceLabel(product)}</strong></td>
            <td data-label="Availability">{product.trackInventory ? <button className="hlmp-stock-button" type="button" disabled={busy || product.status === "Archived"} onClick={() => setStock(product)}>
              <span className={`hlmp-dot ${quantity <= 0 ? "is-red" : quantity <= 5 ? "is-amber" : ""}`} />
              <span>{quantity <= 0 ? "Out of stock" : quantity <= 5 ? "Low stock" : "In stock"}<small>{quantity} available · Update stock</small></span>
            </button> : <div className="hlmp-availability"><select aria-label={`Availability for ${product.name}`} value={product.manualAvailability} disabled={busy || product.status === "Archived"}
              onChange={(e) => mutate(product, () => api.setAvailability(product.id, { expectedVersion: product.version, availability: e.target.value }), "Availability saved.")}>
              <option value="Available">Available</option><option value="Unavailable">Unavailable</option></select>
              <small>{product.type === "Service" ? "Service · no stock" : "Stock not tracked"}</small></div>}</td>
            <td data-label="Listing status"><span className={`hlmp-pill ${product.status === "Published" ? "is-green" : "is-muted"}`}>{product.status}</span></td>
            <td data-label="Actions"><div className="hlmp-row-actions">
              {product.status !== "Archived" && <Link className="hlmp-button hlmp-small" to={`/seller/stores/${storeId}/products/${product.id}/edit`}><Pencil size={14} />Edit</Link>}
              <details className="hlmp-menu"><summary aria-label={`More actions for ${product.name}`}><MoreHorizontal size={20} /></summary><div>
                <button type="button" onClick={() => setPreview(product)}><Eye size={16} />Preview</button>
                <button type="button" disabled={busy} onClick={() => mutate(product, () => api.setStatus(product.id, { expectedVersion: product.version, status: product.status === "Archived" ? "Draft" : "Archived" }), product.status === "Archived" ? "Restored as a draft." : "Product archived.", true)}>
                  <Archive size={16} />{product.status === "Archived" ? "Restore as draft" : "Archive"}</button>
              </div></details>
            </div></td>
          </tr>;
        })}
      </tbody></table></div>
      {!currentItems.length && <div className="hlmp-empty"><Package size={36} /><h3>No products here yet</h3>
        <p>Try another filter or add your first product or service.</p><Link className="hlmp-button hlmp-primary" to="new"><Plus size={16} />Add product</Link></div>}
      <div className="hlmp-pagination"><small>{result.totalCount} matching listings · Page {query.page} of {Math.max(1, Math.ceil(result.totalCount / query.pageSize))}</small>
        <div className="hlmp-actions"><button className="hlmp-button hlmp-small" disabled={query.page === 1 || busyId !== null} onClick={() => onPage(query.page - 1)}>Previous</button>
          <button className="hlmp-button hlmp-small" disabled={query.page * query.pageSize >= result.totalCount || busyId !== null} onClick={() => onPage(query.page + 1)}>Next</button></div></div>
    </>}
    {stock && <StockAdjustment product={stock} api={api} onClose={() => setStock(null)} onSaved={(updated) => { replace(updated); setStock(null); setSuccess("Stock updated."); }} />}
    {preview && <ProductPreviewDialog product={preview} data={data} onClose={() => setPreview(null)} />}
  </>;
}

export default function ProductsPage() {
  const { api, data, addCategory } = useOutletContext();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const [revision, setRevision] = useState(0);
  const [notice, setNotice] = useState(location.state?.productNotice || "");
  const [createCategory, setCreateCategory] = useState(false);
  const search = params.get("q") || "";
  const requestedCategory = params.get("category") || "";
  const categoryId = data.storeCategories.some((c) => c.id === requestedCategory) ? requestedCategory : "";
  const status = ["Published", "Draft", "Archived"].includes(params.get("status")) ? params.get("status") : "Current";
  const page = Math.max(1, Math.floor(Number(params.get("page")) || 1));
  const query = useMemo(() => ({ search, categoryId, status, page, pageSize: 20 }), [search, categoryId, status, page]);
  function change(name, value) {
    setParams((old) => { const next = new URLSearchParams(old); if (value) next.set(name, value); else next.delete(name); if (name !== "page") next.delete("page"); return next; });
  }
  return <>
    <header className="hlmp-page-heading"><div><span className="hlmp-eyebrow">Your store catalog</span><h1>Products</h1><p>Manage products, services and availability in one place.</p></div>
      <div className="hlmp-actions"><button className="hlmp-button" onClick={() => setCreateCategory(true)}><FolderPlus size={18} />New category</button>
        <Link className="hlmp-button hlmp-primary" to="new"><Plus size={19} />Add product</Link></div></header>
    <section className="hlmp-panel hlmp-list-panel">
      <div className="hlmp-filters">
        <form className="hlmp-search" onSubmit={(event) => { event.preventDefault(); change("q", new FormData(event.currentTarget).get("search").trim()); }}>
          <Search size={18} /><input key={search} name="search" aria-label="Search products" defaultValue={search} placeholder="Search products or services" />
          <button type="submit" className="hlmp-button hlmp-small">Search</button></form>
        <label className="hlmp-field"><span>Listing status</span><select value={status} onChange={(e) => change("status", e.target.value)}>
          <option value="Current">Published and draft</option><option value="Published">Published</option><option value="Draft">Draft</option><option value="Archived">Archived</option></select></label>
        <button className="hlmp-icon" aria-label="Refresh product list" onClick={() => setRevision((v) => v + 1)}><RefreshCw size={18} /></button>
      </div>
      <CategoryPicker categories={data.storeCategories} value={categoryId || null} onChange={(id) => change("category", id)} label="Filter by store category" emptyLabel="All categories" />
      <ProductResults key={`${JSON.stringify(query)}:${revision}`} query={query} onPage={(next) => change("page", String(next))}
        refresh={(message) => { if (typeof message === "string") setNotice(message); setRevision((v) => v + 1); }} notice={notice} />
    </section>
    {createCategory && <CreateCategoryDialog api={api} categories={data.storeCategories} initialParent={categoryId}
      onClose={() => setCreateCategory(false)} onCreated={(node) => { addCategory(node); setCreateCategory(false); }} />}
  </>;
}
