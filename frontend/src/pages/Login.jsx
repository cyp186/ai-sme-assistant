import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      if (err.message.includes("Email not verified")) {
        setError(
          "Your email is not verified yet. Check your inbox or enter your code on the verification page."
        );
      } else {
        setError(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="public-page auth-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="ambient ambient-three" />
      <PublicNavbar />

      <div className="auth-shell">
        <div className="auth-card glass-card">
          <p className="eyebrow-light">Welcome back</p>
          <h1>Sign in to your workspace</h1>
          <p className="muted-on-dark">
            Manage enquiries, customers, and AI drafts in one place.
          </p>

          <form onSubmit={handleSubmit} className="stack">
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            {error && <p className="error">{error}</p>}

            <button className="btn btn-light btn-large" disabled={submitting}>
              {submitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="muted-on-dark center">
            No account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
