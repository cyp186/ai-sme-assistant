import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";

export default function EnquiryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [enquiry, setEnquiry] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getEnquiry(id)
      .then(setEnquiry)
      .catch((err) => setError(err.message));
  }, [id]);

  const handleChange = (event) => {
    setEnquiry((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const updated = await api.updateEnquiry(id, {
        subject: enquiry.subject,
        message: enquiry.message,
        category: enquiry.category,
        status: enquiry.status,
      });
      setEnquiry(updated);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this enquiry?")) return;

    try {
      await api.deleteEnquiry(id);
      navigate("/enquiries");
    } catch (err) {
      setError(err.message);
    }
  };

  if (!enquiry) {
    return <div className="page-center">{error || "Loading enquiry..."}</div>;
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <Link className="muted" to="/enquiries">
            ← Back to enquiries
          </Link>
          <h1>{enquiry.subject}</h1>
        </div>
        <Link className="btn btn-secondary" to={`/enquiries/${id}/ai-response`}>
          Review AI response
        </Link>
      </header>

      <form className="panel stack" onSubmit={handleSave}>
        <label>
          Subject
          <input
            name="subject"
            value={enquiry.subject}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Message
          <textarea
            name="message"
            rows={6}
            value={enquiry.message}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Category
          <input
            name="category"
            value={enquiry.category || ""}
            onChange={handleChange}
          />
        </label>
        <label>
          Status
          <select
            name="status"
            value={enquiry.status}
            onChange={handleChange}
          >
            <option value="pending">pending</option>
            <option value="in_progress">in_progress</option>
            <option value="resolved">resolved</option>
          </select>
        </label>

        {error && <p className="error">{error}</p>}

        <div className="action-row">
          <button className="btn btn-primary">Save changes</button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleDelete}
          >
            Delete enquiry
          </button>
        </div>
      </form>
    </div>
  );
}
