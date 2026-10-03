import { ArrowLeft, ArrowRight, ImagePlus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { newId, productError } from "../utils/productModel";
import { MAX_IMAGES, validatePhoto } from "../utils/productValidation";
import { uploadProductPhoto, waitForProductPhoto } from "../services/productImageUpload";

export default function ProductPhotos({ api, images, onChange, disabled }) {
  const tasks = useRef(new Map());
  const urls = useRef(new Map());
  const [error, setError] = useState("");
  useEffect(() => {
    const controllers = tasks.current;
    const previews = urls.current;
    return () => { controllers.forEach((c) => c.abort()); previews.forEach((url) => URL.revokeObjectURL(url)); };
  }, []);
  const update = (id, patch) => onChange((items) => items.map((image) => image.localId === id ? { ...image, ...patch } : image));
  async function upload(image, checkOnly = false) {
    tasks.current.get(image.localId)?.abort();
    const controller = new AbortController();
    tasks.current.set(image.localId, controller);
    const patch = (values) => { if (!controller.signal.aborted) update(image.localId, values); };
    patch({ status: checkOnly ? "Processing" : "Uploading", error: "", canCheckStatus: false });
    try {
      const result = checkOnly
        ? await waitForProductPhoto(api, image.uploadId, controller.signal, patch)
        : await uploadProductPhoto(api, image.file, controller.signal, patch);
      patch({ ...result, status: "Ready" });
    } catch (failure) {
      if (!controller.signal.aborted) patch({ status: "Error", error: productError(failure), canCheckStatus: Boolean(failure.canCheckStatus) });
    } finally {
      if (tasks.current.get(image.localId) === controller) tasks.current.delete(image.localId);
    }
  }
  function choose(event) {
    const files = [...event.target.files];
    event.target.value = "";
    setError("");
    if (images.length + files.length > MAX_IMAGES) { setError(`You can add up to ${MAX_IMAGES} photos.`); return; }
    const invalid = files.map(validatePhoto).find(Boolean);
    if (invalid) { setError(invalid); return; }
    const added = files.map((file) => {
      const localId = newId();
      const imageUrl = URL.createObjectURL(file);
      urls.current.set(localId, imageUrl);
      return { localId, file, imageUrl, status: "Uploading", progress: 0 };
    });
    onChange((items) => [...items, ...added]);
    added.forEach((image) => { void upload(image); });
  }
  function remove(image) {
    tasks.current.get(image.localId)?.abort();
    tasks.current.delete(image.localId);
    const url = urls.current.get(image.localId);
    if (url) URL.revokeObjectURL(url);
    urls.current.delete(image.localId);
    onChange((items) => items.filter((item) => item.localId !== image.localId));
  }
  function move(index, offset) {
    onChange((items) => { const next = [...items]; [next[index], next[index + offset]] = [next[index + offset], next[index]]; return next; });
  }
  return <div>
    <div className="hlmp-photos">
      {images.map((image, index) => <div key={image.localId} className="hlmp-photo">
        <img src={image.imageUrl} alt={`Product photo ${index + 1}`} />
        {index === 0 && <span className="hlmp-main-photo">Main</span>}
        <button type="button" className="hlmp-photo-remove" aria-label={`Remove photo ${index + 1}`} disabled={disabled} onClick={() => remove(image)}><X size={16} /></button>
        <div className="hlmp-photo-tools"><button type="button" disabled={disabled || index === 0} onClick={() => move(index, -1)} aria-label={`Move photo ${index + 1} earlier`}><ArrowLeft size={15} /></button>
          <small aria-live="polite">{image.status === "Uploading" ? `Uploading ${image.progress || 0}%` : image.status}</small>
          <button type="button" disabled={disabled || index === images.length - 1} onClick={() => move(index, 1)} aria-label={`Move photo ${index + 1} later`}><ArrowRight size={15} /></button></div>
        {image.error && <div className="hlmp-photo-error"><small role="alert">{image.error}</small>
          {(image.canCheckStatus || image.file) && <button type="button" disabled={disabled} onClick={() => upload(image, image.canCheckStatus)}>{image.canCheckStatus ? "Check status" : "Retry upload"}</button>}</div>}
      </div>)}
      {images.length < MAX_IMAGES && <label className={`hlmp-upload${disabled ? " is-disabled" : ""}`}>
        <ImagePlus size={26} /><strong>Add photos</strong>
        <input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={disabled} onChange={choose} />
      </label>}
    </div>
    <p className="hlmp-muted">The first photo is the main image. Up to {MAX_IMAGES} photos; JPEG, PNG or WebP, 10 MB each.</p>
    {error && <p className="hlmp-error" role="alert">{error}</p>}
  </div>;
}
