import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

const emptyForm = {
  customer_id: "",
  subject: "",
  message: "",
  category: "",
  status: "pending",
};

export default function Enquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const [enquiryData, customerData] = await Promise.all([
      api.getEnquiries(),
      api.getCustomers(),
    ]);
    setEnquiries(enquiryData);
    setCustomers(customerData);
  };

  useEffect(() => {
    loadData()
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
      await api.createEnquiry({
        ...form,
        customer_id: Number(form.customer_id),
      });
      setForm(emptyForm);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const customerName = (customerId) =>
    customers.find((customer) => customer.id === customerId)?.name || "Unknown";

  if (loading) {
    return <div className="page-center">Loading enquiries...</div>;
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Inbox</p>
          <h1>Enquiries</h1>
          <p className="muted">Track customer questions and response status.</p>
        </div>
      </header>

      <div className="two-column">
        <form className="panel stack" onSubmit={handleSubmit}>
          <h2>Record enquiry</h2>
          <label>
            Customer
            <select
              name="customer_id"
              value={form.customer_id}
              onChange={handleChange}
              required
            >
              <option value="">Select customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Subject
            <input
              name="subject"
              value={form.subject}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Message
            <textarea
              name="message"
              rows={4}
              value={form.message}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Category
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="pricing, booking, policy..."
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button className="btn btn-primary">Add enquiry</button>
        </form>

        <section className="panel">
          <h2>All enquiries</h2>
          {enquiries.length === 0 ? (
            <p className="muted">No enquiries yet.</p>
          ) : (
            <div className="table-list">
              {enquiries.map((enquiry) => (
                <Link
                  key={enquiry.id}
                  to={`/enquiries/${enquiry.id}`}
                  className="table-row"
                >
                  <div>
                    <strong>{enquiry.subject}</strong>
                    <p className="muted">{customerName(enquiry.customer_id)}</p>
                  </div>
                  <span className={`badge badge-${enquiry.status}`}>
                    {enquiry.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
