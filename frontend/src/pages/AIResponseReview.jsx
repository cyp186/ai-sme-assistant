import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";

const TONE_OPTIONS = [
  { value: "", label: "Default" },
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "concise", label: "Concise" },
];

export default function AIResponseReview() {
  const { id } = useParams();
  const [enquiry, setEnquiry] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [responses, setResponses] = useState([]);
  const [draft, setDraft] = useState("");
  const [activeResponse, setActiveResponse] = useState(null);
  const [tone, setTone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    const [enquiryData, responseData] = await Promise.all([
      api.getEnquiry(id),
      api.getAIResponses(id),
    ]);
    const customerData = await api.getCustomer(enquiryData.customer_id);
    setEnquiry(enquiryData);
    setCustomer(customerData);
    setResponses(responseData);

    const latest = responseData[0] ?? null;
    setActiveResponse(latest);
    setDraft(latest?.generated_response ?? "");
    setTone(latest?.tone ?? "");
  };

  useEffect(() => {
    loadData()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleGenerate = async () => {
    setError("");
    setSuccess("");
    setGenerating(true);

    try {
      const created = await api.generateAIResponse(
        id,
        tone ? { tone } : {}
      );
      setResponses((current) => [created, ...current]);
      setActiveResponse(created);
      setDraft(created.generated_response);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async (approve = false) => {
    if (!activeResponse) return;

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const updated = await api.updateAIResponse(id, activeResponse.id, {
        generated_response: draft,
        ...(approve ? { approved: true } : {}),
      });
      setActiveResponse(updated);
      setResponses((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async () => {
    if (!activeResponse || !customer?.email) return;
    if (
      !window.confirm(
        `Send this approved response to ${customer.email}?`
      )
    ) {
      return;
    }

    setError("");
    setSuccess("");
    setSending(true);

    try {
      const updated = await api.sendAIResponse(id, activeResponse.id);
      setActiveResponse(updated);
      setResponses((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      );
      setSuccess(`Response sent to ${customer.email}.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const selectResponse = (response) => {
    setActiveResponse(response);
    setDraft(response.generated_response);
    setTone(response.tone ?? "");
    setError("");
    setSuccess("");
  };

  if (loading) {
    return <div className="page-center">Loading AI response...</div>;
  }

  if (!enquiry) {
    return <div className="page-center">{error || "Enquiry not found."}</div>;
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <Link className="muted" to={`/enquiries/${id}`}>
            ← Back to enquiry
          </Link>
          <h1>AI Response Review</h1>
          <p className="muted">
            Generate a draft for &ldquo;{enquiry.subject}&rdquo;, edit it, then
            approve and email it to the customer.
          </p>
        </div>
      </header>

      <div className="two-column">
        <section className="panel stack">
          <h2>Generate draft</h2>
          <p className="muted">
            The reply uses your business profile and knowledge base entries as
            context.
          </p>

          <label>
            Tone
            <select value={tone} onChange={(e) => setTone(e.target.value)}>
              {TONE_OPTIONS.map((option) => (
                <option key={option.value || "default"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <button
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating
              ? "Generating..."
              : activeResponse
                ? "Regenerate draft"
                : "Generate draft"}
          </button>

          {responses.length > 0 && (
            <div className="stack">
              <h3>Previous drafts</h3>
              <ul className="simple-list">
                {responses.map((response) => (
                  <li key={response.id}>
                    <button
                      type="button"
                      className={`list-button${
                        activeResponse?.id === response.id ? " active" : ""
                      }`}
                      onClick={() => selectResponse(response)}
                    >
                      <span>
                        {new Date(response.generated_at).toLocaleString()}
                      </span>
                      <span className="muted">
                        {response.sent_at
                          ? "Sent"
                          : response.approved
                            ? "Approved"
                            : "Draft"}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="panel stack">
          <h2>Review draft</h2>

          {!activeResponse ? (
            <p className="muted">
              No draft yet. Generate one to start reviewing.
            </p>
          ) : (
            <>
              <div className="action-row">
                <span
                  className={`badge${
                    activeResponse.approved
                      ? " badge-resolved"
                      : " badge-pending"
                  }`}
                >
                  {activeResponse.sent_at
                    ? "Sent"
                    : activeResponse.approved
                      ? "Approved"
                      : "Draft"}
                </span>
                {activeResponse.tone && (
                  <span className="muted">Tone: {activeResponse.tone}</span>
                )}
              </div>

              <label>
                Response text
                <textarea
                  rows={12}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  disabled={activeResponse.approved}
                />
              </label>

              {error && <p className="error">{error}</p>}
              {success && <p className="success">{success}</p>}

              <div className="action-row">
                {!activeResponse.approved && (
                  <>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleSave(false)}
                      disabled={saving || !draft.trim()}
                    >
                      {saving ? "Saving..." : "Save edits"}
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleSave(true)}
                      disabled={saving || !draft.trim()}
                    >
                      {saving ? "Saving..." : "Approve response"}
                    </button>
                  </>
                )}
                {activeResponse.approved && !activeResponse.sent_at && (
                  <button
                    className="btn btn-primary"
                    onClick={handleSend}
                    disabled={sending || !customer?.email}
                  >
                    {sending
                      ? "Sending..."
                      : customer?.email
                        ? `Send to ${customer.email}`
                        : "Customer has no email"}
                  </button>
                )}
                {activeResponse.sent_at && (
                  <span className="muted">
                    Sent {new Date(activeResponse.sent_at).toLocaleString()}
                  </span>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
