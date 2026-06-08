import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getCustomer(id)
      .then(setCustomer)
      .catch((err) => setError(err.message));
  }, [id]);

  const handleChange = (event) => {
    setCustomer((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const updated = await api.updateCustomer(id, {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      });
      setCustomer(updated);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this customer?")) return;

    try {
      await api.deleteCustomer(id);
      navigate("/customers");
    } catch (err) {
      setError(err.message);
    }
  };

  if (!customer) {
    return <div className="page-center">{error || "Loading customer..."}</div>;
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <Link className="muted" to="/customers">
            ← Back to customers
          </Link>
          <h1>{customer.name}</h1>
        </div>
      </header>

      <form className="panel stack" onSubmit={handleSave}>
        <label>
          Name
          <input name="name" value={customer.name} onChange={handleChange} required />
        </label>
        <label>
          Email
          <input
            type="email"
            name="email"
            value={customer.email || ""}
            onChange={handleChange}
          />
        </label>
        <label>
          Phone
          <input
            name="phone"
            value={customer.phone || ""}
            onChange={handleChange}
          />
        </label>

        {error && <p className="error">{error}</p>}

        <div className="action-row">
          <button className="btn btn-primary">Save changes</button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleDelete}
          >
            Delete customer
          </button>
        </div>
      </form>
    </div>
  );
}
