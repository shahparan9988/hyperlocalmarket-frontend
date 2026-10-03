import { LoaderCircle } from "lucide-react";

export default function FormActions({
  isSaving,
  saveLabel = "Save changes",
  onCancel,
}) {
  return (
    <footer className="hlm-form-actions">
      {onCancel && (
        <button className="hlm-btn hlm-btn-ghost" type="button" onClick={onCancel}>
          Cancel
        </button>
      )}
      <button className="hlm-btn hlm-btn-primary" type="submit" disabled={isSaving}>
        {isSaving && <LoaderCircle className="hlm-spin" size={17} />}
        {isSaving ? "Saving…" : saveLabel}
      </button>
    </footer>
  );
}
