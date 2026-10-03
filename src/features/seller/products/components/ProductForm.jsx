import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { ArrowLeft, Check, Eye, FolderPlus, Package, Save, Wrench } from "lucide-react";
// import { formatDeliveryFee } from "../../../delivery/utils/deliveryOptions";
import ProductFulfillment from "./ProductFulfillment";
import CategoryPicker from "./CategoryPicker";
import CreateCategoryDialog from "./CreateCategoryDialog";
import ProductPhotos from "./ProductPhotos";
import ProductVariants from "./ProductVariants";
import StorefrontPreview, { ProductPreviewDialog } from "./StorefrontPreview";
import { newId, newProduct, productError, toProductForm, toProductPayload } from "../utils/productModel";
import { validateProduct } from "../utils/productValidation";

export default function ProductForm({ initialProduct = null, onReload }) {
  const { api, data, addCategory, storeId } = useOutletContext();
  const navigate = useNavigate();
  const [form, setForm] = useState(() => initialProduct ? toProductForm(initialProduct) : newProduct(data.currencyCode));
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [conflict, setConflict] = useState(false);
  const [saving, setSaving] = useState("");
  const [uncertainStatus, setUncertainStatus] = useState("");
  const [dirty, setDirty] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const lock = useRef(false);
  const request = useRef(null);
  const listPath = `/seller/stores/${storeId}/products`;
  const photosBusy = form.images.some((image) => ["Uploading", "Processing"].includes(image.status));
  const archived = initialProduct?.status === "Archived";
  const submitting = Boolean(saving) || archived;
  const disabled = submitting || Boolean(uncertainStatus);

  useEffect(() => {
    if (!dirty && !saving) return;
    const beforeUnload = (event) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirty, saving]);

  function update(transform) {
    setForm(transform); setDirty(true); setErrors({});
    if (!conflict) setApiError("");
  }
  const field = (key, value) => update((current) => ({ ...current, [key]: value }));
  const fieldError = (key) => errors[key] && <small className="hlmp-error" role="alert">{errors[key]}</small>;
  function goBack(event) {
    if (saving || dirty && !window.confirm("Leave this product without saving your changes?")) event.preventDefault();
  }

  async function save(status) {
    if (lock.current || archived || uncertainStatus && uncertainStatus !== status) return;
    const nextErrors = validateProduct(form, status, data);
    setErrors(nextErrors); setApiError("");
    if (Object.keys(nextErrors).length) return;
    if (conflict) { setApiError("Reload the latest version before saving. This will discard your unsaved edits."); return; }
    const payload = toProductPayload(form, status);
    const signature = JSON.stringify(payload);
    if (request.current?.signature !== signature) request.current = { signature, id: newId() };
    lock.current = true; setSaving(status);
    try {
      await api.save(form.id, payload, request.current.id);
      setDirty(false);
      navigate(listPath, { replace: true, state: { productNotice: status === "Published" ? "Product saved and published." : "Draft saved." } });
    } catch (error) {
      const uncertain = !form.id && (!error.response || error.response.status >= 500);
      setUncertainStatus(uncertain ? status : "");
      setApiError(uncertain ? "The new listing could not be confirmed. Retry the same save, or return to Products and check for it before creating another. Fields are kept unchanged so the retry cannot create a duplicate." : productError(error));
      setConflict(error?.response?.status === 409);
    } finally { lock.current = false; setSaving(""); }
  }

  return <>
    <div className="hlmp-breadcrumb"><Link to={listPath} onClick={goBack}><ArrowLeft size={16} />Products</Link><span>/</span><span>{form.id ? "Edit product" : "Add product"}</span></div>
    <header className="hlmp-page-heading"><div><div className="hlmp-heading-line"><h1>{form.id ? "Edit product" : "Add product"}</h1>
      <span className="hlmp-pill is-muted">{form.status}</span>{dirty && <small className="hlmp-muted">Unsaved changes</small>}</div>
      <p>Add a product or service to your store. Stock tracking is your choice.</p></div>
      <button type="button" className="hlmp-button" onClick={() => setPreviewOpen(true)}><Eye size={18} />Preview</button></header>
    {archived && <p className="hlmp-notice">This listing is archived. Restore it as a draft from the Products list before editing.</p>}
    <form className="hlmp-editor" noValidate onSubmit={(event) => { event.preventDefault(); void save(initialProduct?.status === "Published" ? "Published" : "Draft"); }}>
      <div className="hlmp-editor-main">
        <section className="hlmp-panel"><div className="hlmp-section-heading"><h2>Product details</h2></div>
          <div className="hlmp-type-options">
            {[{ value: "Product", title: "Physical product", text: "Goods customers can buy" }, { value: "Service", title: "Service", text: "Work or expertise you offer" }].map(({ value, title, text }) =>
              <label className={`hlmp-type${form.type === value ? " is-selected" : ""}`} key={value}>
                <input type="radio" name="listingType" value={value} checked={form.type === value} disabled={disabled} onChange={() => update((current) => ({ ...current, type: value,
                  trackInventory: value === "Service" ? false : current.trackInventory,
                  isPickupAvailable: value === "Service" ? false : current.isPickupAvailable,
                  deliveryOptionIds: value === "Service" ? [] : current.deliveryOptionIds,
                }))} />{value === "Product" ? <Package size={22} /> : <Wrench size={22} />}<span><strong>{title}</strong><small>{text}</small></span>
              </label>)}
          </div>
          <label className="hlmp-field"><span>{form.type === "Service" ? "Service" : "Product"} name <small>Required</small></span>
            <input value={form.name} maxLength={150} disabled={disabled} onChange={(e) => field("name", e.target.value)} placeholder="For example, Wireless headphones" autoComplete="off" />{fieldError("name")}</label>
          <label className="hlmp-field"><span>Description <small>Optional</small></span><textarea rows={5} value={form.description} maxLength={5000} disabled={disabled}
            onChange={(e) => field("description", e.target.value)} placeholder="Tell customers what they need to know." />{fieldError("description")}</label>
          <div className="hlmp-section-heading"><h3>Organize your store</h3><button type="button" className="hlmp-text-button" disabled={disabled} onClick={() => setCategoryOpen(true)}><FolderPlus size={17} />New category</button></div>
          <CategoryPicker categories={data.storeCategories} value={form.storeCategoryId} onChange={(id) => field("storeCategoryId", id)} disabled={disabled} />{fieldError("storeCategoryId")}
          <p className="hlmp-muted">This category appears in your store menu. Choose a parent or keep going into its subcategories.</p>
        </section>
        <section className="hlmp-panel"><div className="hlmp-section-heading"><h2>{form.type === "Service" ? "Service" : "Product"} photos</h2><span className="hlmp-muted">Optional</span></div>
          <ProductPhotos api={api} images={form.images} disabled={disabled} onChange={(transform) => update((current) => ({ ...current, images: transform(current.images) }))} />{fieldError("images")}</section>
        <section className="hlmp-panel"><div className="hlmp-section-heading"><h2>Pricing & availability</h2><span className="hlmp-pill is-muted">{form.currencyCode}</span></div>
          {form.type === "Product" && <label className="hlmp-check hlmp-stock-toggle"><input type="checkbox" checked={form.trackInventory} disabled={disabled}
            onChange={(e) => field("trackInventory", e.target.checked)} /><span><strong>Track stock for this product</strong><small>Maintain quantities and show availability from your stock.</small></span></label>}
          {(!form.trackInventory || form.type === "Service") && <label className="hlmp-field hlmp-availability-field"><span>Availability</span><select value={form.manualAvailability} disabled={disabled} onChange={(e) => field("manualAvailability", e.target.value)}>
            <option value="Available">Available</option><option value="Unavailable">Unavailable</option></select>
            <small>{form.type === "Service" ? "Services do not track physical stock." : "You control availability. No stock quantity is required."}</small>{fieldError("availability")}</label>}
          <ProductVariants form={form} update={update} errors={errors} disabled={disabled} />
        </section>
        {/* {form.type === "Product" && <section className="hlmp-panel"><div className="hlmp-section-heading"><h2>Pickup & delivery</h2><Link to={`/seller/stores/${storeId}/setup/pickup-delivery`} onClick={goBack}>Store settings</Link></div>
          <p className="hlmp-muted">Choose the store delivery methods that suit this product.</p>
          <label className="hlmp-check"><input type="checkbox" checked={form.isPickupAvailable} disabled={disabled || !data.store.isPickupAvailable && !form.isPickupAvailable} onChange={(e) => field("isPickupAvailable", e.target.checked)} />
            <span><strong>Customer pickup</strong><small>{data.store.isPickupAvailable ? "Customers collect this product from your store." : "Enable pickup in Store setup to use this option."}</small></span></label>
          {data.deliveryOptions.map((option) => {
            const unavailable = !data.store.isDeliveryAvailable || !option.isActive;
            const checked = form.deliveryOptionIds.includes(option.id);
            return <label key={option.id} className="hlmp-delivery-option"><input type="checkbox" checked={checked} disabled={disabled || unavailable && !checked}
              onChange={(e) => field("deliveryOptionIds", e.target.checked ? [...form.deliveryOptionIds, option.id] : form.deliveryOptionIds.filter((id) => id !== option.id))} />
              <span><strong>{option.name}{unavailable ? " · Unavailable" : ""}</strong><small>{option.coverageDescription} · {option.estimatedTimeDescription}</small>{option.conditions && <small>{option.conditions}</small>}</span><b>{formatDeliveryFee(option)}</b></label>;
          })}
          {form.deliveryOptionIds.filter((id) => !data.deliveryOptions.some((option) => option.id === id)).map((id) => <label key={id} className="hlmp-check"><input type="checkbox" checked disabled={disabled}
            onChange={() => field("deliveryOptionIds", form.deliveryOptionIds.filter((value) => value !== id))} /><span>Removed delivery method · uncheck to continue</span></label>)}
          {!data.deliveryOptions.length && <p className="hlmp-muted">No delivery methods yet. You can add them in Store setup or arrange fulfilment with the customer.</p>}{fieldError("delivery")}
        </section>} */}

        {form.type === "Product" && (
          <ProductFulfillment
            storeId={storeId}
            store={data.store}
            deliveryOptions={data.deliveryOptions}
            isPickupAvailable={form.isPickupAvailable}
            deliveryOptionIds={form.deliveryOptionIds}
            disabled={disabled}
            error={errors.delivery}
            onPickupChange={(value) => field("isPickupAvailable", value)}
            onDeliveryChange={(ids) => field("deliveryOptionIds", ids)}
            onOpenSettings={goBack}
          />
        )}
      </div>
      <aside className="hlmp-editor-aside"><section className="hlmp-panel"><div className="hlmp-section-heading"><h2>In your store</h2><span className="hlmp-muted">Live preview</span></div>
        <StorefrontPreview product={form} data={data} /></section>
        <section className="hlmp-panel"><h2>HLM marketplace category</h2><p className="hlmp-muted">Help people discover this listing across HLM. Your store menu is managed separately.</p>
          <CategoryPicker categories={data.marketplaceCategories} value={form.marketplaceCategoryId} label="Marketplace category" emptyLabel="Not selected" disabled={disabled} onChange={(id) => field("marketplaceCategoryId", id)} />{fieldError("marketplaceCategoryId")}</section>
      </aside>
      <footer className="hlmp-editor-footer">
        {Object.keys(errors).length > 0 && <p className="hlmp-error" role="alert">Please check the highlighted fields before saving.</p>}
        {apiError && <div className="hlmp-error" role="alert">{apiError}{conflict && onReload && <button type="button" className="hlmp-text-button" disabled={disabled}
          onClick={() => { if (window.confirm("Reload the latest product and discard your unsaved edits?")) onReload(); }}>Reload latest product</button>}</div>}
        <div className="hlmp-footer-row"><Link className="hlmp-button" to={listPath} onClick={goBack}>Cancel</Link>
          <div className="hlmp-actions">{initialProduct?.status !== "Published" && <button type="submit" className="hlmp-button" disabled={submitting || photosBusy || uncertainStatus && uncertainStatus !== "Draft"}><Save size={17} />{saving === "Draft" ? "Saving draft…" : "Save draft"}</button>}
            <button type="button" className="hlmp-button hlmp-primary" disabled={submitting || photosBusy || uncertainStatus && uncertainStatus !== "Published"} onClick={() => save("Published")}><Check size={18} />
              {saving === "Published" ? "Saving…" : initialProduct?.status === "Published" ? "Save changes" : "Publish product"}</button></div></div>
      </footer>
    </form>
    {categoryOpen && <CreateCategoryDialog api={api} categories={data.storeCategories} initialParent={form.storeCategoryId} onClose={() => setCategoryOpen(false)}
      onCreated={(node) => { addCategory(node); field("storeCategoryId", node.id); setCategoryOpen(false); }} />}
    {previewOpen && <ProductPreviewDialog product={form} data={data} onClose={() => setPreviewOpen(false)} />}
  </>;
}
