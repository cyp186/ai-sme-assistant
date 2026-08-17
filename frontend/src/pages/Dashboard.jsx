import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [business, setBusiness] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const businessData = await api.getBusiness().catch(() => null);
        setBusiness(businessData);

        if (!businessData) {
          setStats({
            customers: 0,
            enquiries: 0,
            pending: 0,
            approvedResponses: 0,
          });
          return;
        }

        const [customers, enquiries, aiStats] = await Promise.all([
          api.getCustomers(),
          api.getEnquiries(),
          api.getAIResponseStats().catch(() => ({ approved: 0 })),
        ]);

        setStats({
          customers: customers.length,
          enquiries: enquiries.length,
          pending: enquiries.filter((item) => item.status === "pending").length,
          approvedResponses: aiStats.approved,
        });
      } catch (err) {
        setError(err.message);
      }
    }

    load();
  }, []);

  if (!stats) {
    return <div className="page-center">{error || "Loading dashboard..."}</div>;
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Dashboard</h1>
          <p className="muted">
            {business
              ? `Managing enquiries for ${business.business_name}`
              : "Create your business profile to get started."}
          </p>
        </div>
        {!business && (
          <Link className="btn btn-primary" to="/settings">
            Set up business
          </Link>
        )}
      </header>

      {!business && (
        <section className="panel placeholder-panel">
          <h2>Set up your business profile</h2>
          <p className="muted">
            Add your business details before managing customers, enquiries, and
            knowledge base entries.
          </p>
          <Link className="btn btn-primary" to="/settings">
            Go to Business Settings
          </Link>
        </section>
      )}

      <section className="stats-grid">
        <article className="stat-card">
          <p className="stat-label">Customers</p>
          <p className="stat-value">{stats.customers}</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Total enquiries</p>
          <p className="stat-value">{stats.enquiries}</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Pending enquiries</p>
          <p className="stat-value">{stats.pending}</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Approved AI responses</p>
          <p className="stat-value">{stats.approvedResponses}</p>
        </article>
      </section>

      <section className="panel">
        <h2>Quick actions</h2>
        <div className="action-row">
          <Link className="btn btn-secondary" to="/customers">
            Manage customers
          </Link>
          <Link className="btn btn-secondary" to="/enquiries">
            View enquiries
          </Link>
          <Link className="btn btn-secondary" to="/knowledge-base">
            Update knowledge base
          </Link>
        </div>
      </section>
    </div>
  );
}
