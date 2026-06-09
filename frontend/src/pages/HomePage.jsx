import { Link } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";
import { useAuth } from "../context/AuthContext";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="landing-page">
      <div className="landing-blob landing-blob-center" />
      <div className="landing-blob landing-blob-left" />
      <div className="landing-blob landing-blob-right" />

      <PublicNavbar animated />

      <main className="landing-hero">
        <div className="landing-hero-copy">
          <h1 className="landing-title animate-in animate-in-title">
            Business
            <br />
            Assistant
          </h1>
          <p className="landing-subtitle animate-in animate-in-subtitle">
            AI-powered customer enquiry management for small businesses.
          </p>
        </div>

        <Link
          className="btn-start-here animate-in animate-in-button"
          to={user ? "/dashboard" : "/register"}
        >
          Get Started
        </Link>
      </main>
    </div>
  );
}
