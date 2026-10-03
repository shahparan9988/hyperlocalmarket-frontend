import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

export default function CatalogDialog({ title, onClose, children, wide = false }) {
  const dialogRef = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return (
    <dialog ref={dialogRef} className={`hlmp-dialog${wide ? " hlmp-dialog-wide" : ""}`}
      aria-labelledby={titleId} onCancel={(event) => { event.preventDefault(); onClose(); }}>
      <div className="hlmp-dialog-heading">
        <h2 id={titleId}>{title}</h2>
        <button type="button" className="hlmp-icon" onClick={onClose} aria-label="Close dialog"><X size={20} /></button>
      </div>
      {children}
    </dialog>
  );
}
