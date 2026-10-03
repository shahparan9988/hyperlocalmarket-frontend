import { useRef, useState } from "react";
import CatalogDialog from "./CatalogDialog";
import CategoryPicker from "./CategoryPicker";
import { newId, productError } from "../utils/productModel";

export default function CreateCategoryDialog({ api, categories, initialParent, onCreated, onClose }) {
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState(initialParent || null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  const request = useRef(null);
  async function submit(event) {
    event.preventDefault();
    if (lock.current) return;
    if (!name.trim()) { setError("Enter a category name."); return; }
    const payload = { name: name.trim(), parentId };
    const signature = JSON.stringify(payload);
    if (request.current?.signature !== signature) request.current = { signature, id: newId() };
    lock.current = true; setBusy(true); setError("");
    try { onCreated(await api.createCategory(payload, request.current.id)); }
    catch (failure) { setError(productError(failure)); }
    finally { lock.current = false; setBusy(false); }
  }
  return <CatalogDialog title="Create store category" onClose={() => { if (!busy) onClose(); }}>
    <form onSubmit={submit} className="hlmp-stack">
      <label className="hlmp-field"><span>Category name</span>
        <input autoFocus value={name} maxLength={100} disabled={busy} onChange={(event) => { setName(event.target.value); setError(""); }} placeholder="For example, Noise cancelling" /></label>
      <CategoryPicker categories={categories} value={parentId} onChange={setParentId} disabled={busy}
        label="Put this category inside" emptyLabel="Top level (no parent)" />
      <p className="hlmp-muted">You can add another category inside this one later, at any depth.</p>
      {error && <p className="hlmp-error" role="alert">{error}</p>}
      <div className="hlmp-actions"><button type="button" className="hlmp-button" disabled={busy} onClick={onClose}>Cancel</button>
        <button className="hlmp-button hlmp-primary" disabled={busy}>{busy ? "Creating…" : "Create category"}</button></div>
    </form>
  </CatalogDialog>;
}
