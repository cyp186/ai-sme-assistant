import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const result = await register(form);
      navigate(`/verify-email?email=${encodeURIComponent(result.email)}`);
    } catch (err) {
      setError(err.message);
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
          <p className="eyebrow-light">Get started</p>
          <h1>Create your account</h1>
          <p className="muted-on-dark">
            Join SMEs using AI-assisted workflows to save time every day.
          </p>

          <form onSubmit={handleSubmit} className="stack">
            <label>
              Full name
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Email
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                minLength={8}
                required
              />
            </label>

            {error && <p className="error">{error}</p>}

            <button className="btn btn-light btn-large" disabled={submitting}>
              {submitting ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="muted-on-dark center">
            Already registered? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
