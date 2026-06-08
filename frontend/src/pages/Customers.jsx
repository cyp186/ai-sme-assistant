import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

const emptyForm = { name: "", email: "", phone: "" };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadCustomers = async () => {
    const data = await api.getCustomers();
    setCustomers(data);
  };

  useEffect(() => {
    loadCustomers()
      .catch((err) => setError(err.message))
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
    setError("");

    try {
      await api.createCustomer(form);
      setForm(emptyForm);
      await loadCustomers();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="page-center">Loading customers...</div>;
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">CRM</p>
          <h1>Customers</h1>
          <p className="muted">Store customer contact details in one place.</p>
        </div>
      </header>

      <div className="two-column">
        <form className="panel stack" onSubmit={handleSubmit}>
          <h2>Add customer</h2>
          <label>
            Name
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
            />
          </label>
          <label>
            Phone
            <input name="phone" value={form.phone} onChange={handleChange} />
          </label>
          {error && <p className="error">{error}</p>}
          <button className="btn btn-primary">Add customer</button>
        </form>

        <section className="panel">
          <h2>All customers</h2>
          {customers.length === 0 ? (
            <p className="muted">No customers yet.</p>
          ) : (
            <div className="table-list">
              {customers.map((customer) => (
                <Link
                  key={customer.id}
                  to={`/customers/${customer.id}`}
                  className="table-row"
                >
                  <div>
                    <strong>{customer.name}</strong>
                    <p className="muted">{customer.email || "No email"}</p>
                  </div>
                  <span>{customer.phone || "—"}</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
