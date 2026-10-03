import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function InlineNotice({ type = "error", children }) {
  const Icon = type === "success" ? CheckCircle2 : AlertCircle;

  return (
    <div className={`hlm-inline-notice is-${type}`} role={type === "error" ? "alert" : "status"}>
      <Icon size={18} />
      <span>{children}</span>
    </div>
  );
}
