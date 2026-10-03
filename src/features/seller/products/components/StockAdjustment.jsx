import { useRef, useState } from "react";
import CatalogDialog from "./CatalogDialog";
import { productError } from "../utils/productModel";
import { validQuantity } from "../utils/productValidation";

export default function StockAdjustment({ product, api, onSaved, onClose }) {
  const [quantities, setQuantities] = useState(() => Object.fromEntries(product.variants.map((v) => [v.id, String(v.inventory.onHandQuantity)])));
  const [reason, setReason] = useState("CountCorrection");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  async function submit(event) {
    event.preventDefault();
    if (lock.current) return;
    if (product.variants.some((v) => !validQuantity(quantities[v.id]) || Number(quantities[v.id]) < v.inventory.reservedQuantity)) {
      setError("Enter valid stock quantities, each at least the reserved amount. Up to three decimal places are supported."); return;
    }
    lock.current = true; setBusy(true); setError("");
    try {
      const result = await api.setInventory(product.id, { expectedVersion: product.version, reason,
        variants: product.variants.map((v) => ({ id: v.id, expectedVersion: v.inventory.version, onHandQuantity: Number(quantities[v.id]) })),
      });
      onSaved(result);
    } catch (failure) { setError(productError(failure)); }
    finally { setBusy(false); lock.current = false; }
  }
  return <CatalogDialog title={`Update stock · ${product.name}`} onClose={() => { if (!busy) onClose(); }}>
    <form className="hlmp-stack" onSubmit={submit} noValidate>
      <p className="hlmp-muted">Enter the total quantity you have on hand. Reserved units remain allocated to existing orders.</p>
      {product.variants.map((v) => <label className="hlmp-field" key={v.id}><span>{v.name} · On hand</span>
        <input type="number" min={v.inventory.reservedQuantity} max="999999999" step="0.001" disabled={busy} value={quantities[v.id]}
          onChange={(event) => { setQuantities({ ...quantities, [v.id]: event.target.value }); setError(""); }} />
        <small>Reserved: {v.inventory.reservedQuantity} · Available after update: {Math.max(0, Number(quantities[v.id]) - v.inventory.reservedQuantity)}</small>
      </label>)}
      <label className="hlmp-field"><span>Reason</span><select value={reason} disabled={busy} onChange={(e) => setReason(e.target.value)}>
        <option value="CountCorrection">Count correction</option><option value="NewStock">New stock received</option>
        <option value="ExternalSale">Sale outside HLM</option><option value="Damaged">Damaged or lost</option>
      </select></label>
      {error && <p className="hlmp-error" role="alert">{error}</p>}
      <div className="hlmp-actions"><button type="button" className="hlmp-button" disabled={busy} onClick={onClose}>Close</button>
        <button className="hlmp-button hlmp-primary" disabled={busy}>{busy ? "Saving…" : "Update stock"}</button></div>
      {error && <small className="hlmp-muted">For a version conflict, close this window and refresh the product list before reopening it.</small>}
    </form>
  </CatalogDialog>;
}
