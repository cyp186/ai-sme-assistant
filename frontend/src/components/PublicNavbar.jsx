import { Link, useLocation } from "react-router-dom";
import BrandLogo from "./BrandLogo";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About" },
  { to: "/features", label: "Features" },
  { to: "/partnership", label: "Partnership" },
];

export default function PublicNavbar({ animated = false }) {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (to, end) => {
    if (end) return location.pathname === "/";
    return location.pathname === to;
  };

  const authItem = user
    ? { to: "/dashboard", label: "Dashboard" }
    : { to: "/login", label: "Login" };

  return (
    <header
      className={`public-nav landing-nav ${animated ? "animate-in animate-in-nav" : ""}`}
    >
      <BrandLogo className="brand-logo--nav" />
      <nav className="landing-nav-links">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={
              isActive(item.to, item.end)
                ? "landing-nav-link active"
                : "landing-nav-link"
            }
          >
            {item.label}
          </Link>
        ))}
        <Link
          to={authItem.to}
          className={
            isActive(authItem.to)
              ? "landing-nav-link active dashboard-link"
              : "landing-nav-link dashboard-link"
          }
        >
          {authItem.label}
        </Link>
      </nav>
    </header>
  );
}
