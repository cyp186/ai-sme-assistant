import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

export default function VerifyEmail() {
  const { user, verifyEmail } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      await verifyEmail(email, code);
      navigate("/settings");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setMessage("");
    setResending(true);

    try {
      await api.resendVerification({ email });
      setMessage("A new verification code has been sent to your email.");
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
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
          <p className="eyebrow-light">Almost there</p>
          <h1>Verify your email</h1>
          <p className="muted-on-dark">
            Enter the 6-digit code we sent to your email to confirm your account.
          </p>

          <form onSubmit={handleSubmit} className="stack">
            <label>
              Email
              <input
                type="email"
                name="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            <label>
              Verification code
              <input
                name="code"
                value={code}
                onChange={(event) =>
                  setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                minLength={6}
                maxLength={6}
                required
              />
            </label>

            {error && <p className="error">{error}</p>}
            {message && <p className="success">{message}</p>}

            <button className="btn btn-light btn-large" disabled={submitting}>
              {submitting ? "Verifying..." : "Confirm account"}
            </button>
          </form>

          <p className="muted-on-dark center">
            Didn&apos;t get a code?{" "}
            <button
              type="button"
              className="link-button"
              onClick={handleResend}
              disabled={resending || !email}
            >
              {resending ? "Sending..." : "Resend code"}
            </button>
          </p>

          <p className="muted-on-dark center">
            Already verified? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
