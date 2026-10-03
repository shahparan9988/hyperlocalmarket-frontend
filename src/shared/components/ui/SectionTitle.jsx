export default function SectionTitle({ children, className = "" }) {
  return <h2 className={`section-title ${className}`}>{children}</h2>;
}