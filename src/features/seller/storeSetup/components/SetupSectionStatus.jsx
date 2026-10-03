import { Check, Circle, LockKeyhole } from "lucide-react";

export default function SetupSectionStatus({
  isComplete,
  isCurrent,
  isLocked = false,
  optional = false,
}) {
  if (isLocked) {
    return (
      <span className="hlm-setup-item-state is-locked">
        <LockKeyhole size={13} /> Locked
      </span>
    );
  }

  if (isComplete) {
    return (
      <span className="hlm-setup-item-state is-complete">
        <Check size={14} /> Done
      </span>
    );
  }

  if (isCurrent) {
    return <span className="hlm-setup-item-state is-current">Editing</span>;
  }

  if (optional) {
    return <span className="hlm-setup-item-state">Optional</span>;
  }

  return (
    <span className="hlm-setup-item-state">
      <Circle size={10} /> Required
    </span>
  );
}
