import { Fragment, useState } from "react";
import { Grid2X2 } from "lucide-react";
import ProductOptionEditor from "./ProductOptionEditor";
import {
  MAX_COMBINATIONS, combinationCount, generateVariants, newOption,
  optionShape, validateOptions, variantName,
} from "../utils/variantOptions";

function fieldDefinitions(form) {
  const fields = [
    { key: "price", label: `Selling price (${form.currencyCode})`, type: "number", step: "0.01", max: "999999999.99" },
    { key: "compareAtPrice", label: "Original price", optional: true, type: "number", step: "0.01", max: "999999999.99" },
    { key: "sku", label: "SKU", optional: true, type: "text" },
  ];
  if (form.trackInventory && form.type === "Product")
    fields.push({ key: "onHandQuantity", label: "Stock", type: "number", step: "0.001", max: "999999999" });
  return fields;
}

function VariantInput({ field, variant, name, disabled, onChange, invalid }) {
  const stock = field.key === "onHandQuantity";
  return <>
    <input type={field.type} value={stock ? variant.inventory.onHandQuantity : variant[field.key]}
      aria-label={`${field.label} for ${name}`} aria-invalid={invalid || undefined} disabled={disabled}
      min={field.type === "number" ? stock ? variant.inventory.reservedQuantity : 0 : undefined}
      max={field.max} step={field.step} maxLength={field.type === "text" ? 100 : undefined}
      placeholder={field.type === "text" ? "Optional" : "0.00"}
      onChange={(event) => onChange(variant.id, field.key, event.target.value)} />
    {stock && Number(variant.inventory.reservedQuantity) > 0 && <small>{variant.inventory.reservedQuantity} reserved</small>}
  </>;
}

export default function ProductVariants({ form, update, errors, disabled }) {
  const [message, setMessage] = useState("");
  const [optionErrors, setOptionErrors] = useState({});
  const fields = fieldDefinitions(form);
  const count = combinationCount(form.options);
  const needsGeneration = form.generatedOptionShape !== optionShape(form.options);

  function changeVariant(id, key, value) {
    setMessage("");
    update((current) => ({ ...current, variants: current.variants.map((variant) => {
      if (variant.id !== id) return variant;
      return key === "onHandQuantity"
        ? { ...variant, inventory: { ...variant.inventory, onHandQuantity: value } }
        : { ...variant, [key]: value };
    }) }));
  }
  function changeOptions(transform) {
    setMessage(""); setOptionErrors({});
    update((current) => ({ ...current, options: transform(current.options) }));
  }
  function generate() {
    const nextErrors = validateOptions(form.options);
    if (!form.options.length) nextErrors.options = "Add an option first, or turn off variants.";
    setOptionErrors(nextErrors); setMessage("");
    if (Object.keys(nextErrors).length) return;
    try {
      const variants = generateVariants(form.options, form.variants);
      update((current) => ({ ...current, variants, generatedOptionShape: optionShape(current.options) }));
    } catch (error) { setMessage(error.message); }
  }
  function toggleVariants(checked) {
    setMessage(""); setOptionErrors({});
    if (checked) {
      const option = newOption("Color");
      update((current) => ({ ...current, hasVariants: true, options: current.options.length ? current.options : [option] }));
      return;
    }
    if (form.options.length && !window.confirm("Remove the options and return to one standard variant? Existing combinations with stock must be kept or adjusted first.")) return;
    try {
      const variants = generateVariants([], form.variants).map((v) => ({ ...v, isOffered: true }));
      update((current) => ({ ...current, hasVariants: false, options: [], variants, generatedOptionShape: optionShape([]) }));
    } catch (error) { setMessage(error.message); }
  }

  return <div className="hlmp-stack hlmp-variant-editor">
    <label className="hlmp-check">
      <input type="checkbox" checked={form.hasVariants} disabled={disabled} onChange={(event) => toggleVariants(event.target.checked)} />
      <span><strong>This product has variants</strong><small>Add options such as color, size or material.</small></span>
    </label>
    {form.hasVariants && <>
      <ProductOptionEditor options={form.options} onChange={changeOptions} errors={{ ...errors, ...optionErrors }} disabled={disabled} />
      <div className="hlmp-generate-row">
        <span className="hlmp-muted">{count > MAX_COMBINATIONS ? `More than ${MAX_COMBINATIONS.toLocaleString()}` : count.toLocaleString()} possible {count === 1 ? "combination" : "combinations"}</span>
        <button type="button" className="hlmp-button hlmp-primary" disabled={disabled} onClick={generate}><Grid2X2 size={17} />Generate variants</button>
      </div>
      {needsGeneration && <p className="hlmp-muted">Generate variants to apply your option changes. Matching rows keep their prices and stock.</p>}
    </>}
    {(errors.options || optionErrors.options) && <p className="hlmp-error" role="alert">{optionErrors.options || errors.options}</p>}
    {message && <p className="hlmp-error" role="alert">{message}</p>}

    {form.hasVariants ? <section className="hlmp-variant-list" aria-label="Variants">
      <div className="hlmp-section-heading"><h3>Variants <span className="hlmp-pill is-muted">{form.variants.length}</span></h3></div>
      <p className="hlmp-muted">Set prices and stock for each combination. Uncheck combinations you don’t sell.</p>
      <div className="hlmp-variant-scroll" tabIndex={0} role="region" aria-label="Variant prices and stock">
        <table className="hlmp-variant-table">
          <thead><tr><th scope="col">Offer</th><th scope="col">Variant</th>{fields.map((field) => <th scope="col" key={field.key}>{field.label}{field.optional && <small>Optional</small>}</th>)}</tr></thead>
          <tbody>{form.variants.map((variant) => {
            const name = variantName(form.options, variant.selections, variant.name);
            const error = errors[`variant-${variant.id}`];
            return <Fragment key={variant.id}>
              <tr className={variant.isOffered === false ? "is-not-offered" : ""}>
                <td><input type="checkbox" checked={variant.isOffered !== false} aria-label={`Offer ${name}`}
                  disabled={disabled || Number(variant.inventory.reservedQuantity) > 0}
                  title={Number(variant.inventory.reservedQuantity) > 0 ? "Resolve reserved orders before turning off Offer." : undefined}
                  onChange={(event) => changeVariant(variant.id, "isOffered", event.target.checked)} /></td>
                <th scope="row">{name}{variant.isOffered === false && <small>Not offered</small>}</th>
                {fields.map((field) => <td key={field.key}><VariantInput field={field} variant={variant} name={name} disabled={disabled}
                  onChange={changeVariant} invalid={Boolean(error)} /></td>)}
              </tr>
              {error && <tr><td colSpan={fields.length + 2}><p className="hlmp-error" role="alert">{error}</p></td></tr>}
            </Fragment>;
          })}</tbody>
        </table>
      </div>
    </section> : form.variants.map((variant) => <div className="hlmp-form-grid" key={variant.id}>
      {fields.map((field) => <label className="hlmp-field" key={field.key}><span>{field.label}{field.optional && <small>Optional</small>}</span>
        <VariantInput field={field} variant={variant} name="Standard" disabled={disabled} onChange={changeVariant} invalid={Boolean(errors[`variant-${variant.id}`])} />
      </label>)}
      {errors[`variant-${variant.id}`] && <p className="hlmp-error" role="alert">{errors[`variant-${variant.id}`]}</p>}
    </div>)}
    {errors.variants && <p className="hlmp-error" role="alert">{errors.variants}</p>}
    {form.type === "Product" && <small className="hlmp-muted">Stock fields are shown only when stock tracking is enabled.</small>}
  </div>;
}
