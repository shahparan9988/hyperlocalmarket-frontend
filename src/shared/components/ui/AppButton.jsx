export default function AppButton({
  children,
  className = "",
  variant = "primary",
  type = "button",
}) {
  const base =
    "inline-flex items-center justify-center rounded-xl font-medium transition whitespace-nowrap";

  const variants = {
    primary:
      "bg-emerald-700 px-3 py-2 text-xs text-white hover:bg-emerald-800",
    ghost: "px-3 py-2 text-sm text-stone-700 hover:bg-stone-100",
    outline:
      "border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700 hover:bg-stone-50",
  };

  return (
    <button type={type} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}