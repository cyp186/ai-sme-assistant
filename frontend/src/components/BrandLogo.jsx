import { Link } from "react-router-dom";

export default function BrandLogo({ className = "", to = "/" }) {
  const image = (
    <img
      src="/logo.png"
      alt="REPLIVO"
      className={`brand-logo ${className}`.trim()}
    />
  );

  if (!to) {
    return image;
  }

  return (
    <Link to={to} className="brand-logo-link">
      {image}
    </Link>
  );
}
