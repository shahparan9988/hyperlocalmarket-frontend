export default function PageTitle({ children, className = "" }) {
  return <h1 className={`page-title ${className}`}>{children}</h1>;
}