import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PublicNavbar() {
  const { user } = useAuth();

  return (
    <header className="public-nav">
      <Link to="/" className="public-brand">
        <span className="brand-mark">AI</span>
        <span className="public-brand-text">Business Assistant</span>
      </Link>

      <nav className="public-nav-actions">
        {user ? (
          <Link className="btn btn-glass" to="/dashboard">
            Go to Dashboard
          </Link>
        ) : (
          <>
            <Link className="btn btn-ghost" to="/login">
              Log in
            </Link>
            <Link className="btn btn-light" to="/register">
              Get Started
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
