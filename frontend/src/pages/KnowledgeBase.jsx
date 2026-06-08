import { useEffect, useState } from "react";
import { api } from "../api/client";

const emptyForm = { title: "", content: "", source_type: "manual" };

export default function KnowledgeBase() {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadEntries = async () => {
    const data = await api.getKnowledge();
    setEntries(data);
  };

  useEffect(() => {
    loadEntries()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      if (editingId) {
        await api.updateKnowledge(editingId, form);
      } else {
        await api.createKnowledge(form);
      }
      resetForm();
      await loadEntries();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (entry) => {
    setEditingId(entry.id);
    setForm({
      title: entry.title,
      content: entry.content,
      source_type: entry.source_type,
    });
  };

  const handleDelete = async (entryId) => {
    if (!window.confirm("Delete this knowledge entry?")) return;

    try {
      await api.deleteKnowledge(entryId);
      if (editingId === entryId) resetForm();
      await loadEntries();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="page-center">Loading knowledge base...</div>;
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Context</p>
          <h1>Knowledge Base</h1>
          <p className="muted">
            Store pricing, FAQs, and policies to guide AI responses.
          </p>
        </div>
      </header>

      <div className="two-column">
        <form className="panel stack" onSubmit={handleSubmit}>
          <h2>{editingId ? "Edit entry" : "Add entry"}</h2>
          <label>
            Title
            <input name="title" value={form.title} onChange={handleChange} required />
          </label>
          <label>
            Content
            <textarea
              name="content"
              rows={6}
              value={form.content}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Source type
            <input
              name="source_type"
              value={form.source_type}
              onChange={handleChange}
            />
          </label>
          {error && <p className="error">{error}</p>}
          <div className="action-row">
            <button className="btn btn-primary">
              {editingId ? "Update entry" : "Add entry"}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={resetForm}
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>

        <section className="panel">
          <h2>Stored knowledge</h2>
          {entries.length === 0 ? (
            <p className="muted">No knowledge entries yet.</p>
          ) : (
            <div className="card-list">
              {entries.map((entry) => (
                <article key={entry.id} className="info-card">
                  <div className="info-card-header">
                    <h3>{entry.title}</h3>
                    <span className="badge">{entry.source_type}</span>
                  </div>
                  <p>{entry.content}</p>
                  <div className="action-row">
                    <button
                      className="btn btn-secondary btn-small"
                      onClick={() => handleEdit(entry)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-small"
                      onClick={() => handleDelete(entry.id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
