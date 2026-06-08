import { useEffect, useState } from "react";
import { api } from "../api/client";

const emptyForm = {
  business_name: "",
  industry: "",
  contact_email: "",
  description: "",
};

export default function BusinessSettings() {
  const [form, setForm] = useState(emptyForm);
  const [exists, setExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getBusiness()
      .then((data) => {
        setExists(true);
        setForm({
          business_name: data.business_name || "",
          industry: data.industry || "",
          contact_email: data.contact_email || "",
          description: data.description || "",
        });
      })
      .catch(() => setExists(false))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      if (exists) {
        await api.updateBusiness(form);
        setMessage("Business profile updated.");
      } else {
        await api.createBusiness(form);
        setExists(true);
        setMessage("Business profile created.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="page-center">Loading settings...</div>;
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Profile</p>
          <h1>Business Settings</h1>
          <p className="muted">
            Keep your business details up to date for better AI responses.
          </p>
        </div>
      </header>

      <form className="panel stack" onSubmit={handleSubmit}>
        <label>
          Business name
          <input
            name="business_name"
            value={form.business_name}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Industry
          <input
            name="industry"
            value={form.industry}
            onChange={handleChange}
          />
        </label>

        <label>
          Contact email
          <input
            type="email"
            name="contact_email"
            value={form.contact_email}
            onChange={handleChange}
          />
        </label>

        <label>
          Description
          <textarea
            name="description"
            rows={5}
            value={form.description}
            onChange={handleChange}
          />
        </label>

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}

        <button className="btn btn-primary">
          {exists ? "Save changes" : "Create business profile"}
        </button>
      </form>
    </div>
  );
}
