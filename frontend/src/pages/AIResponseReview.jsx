import { Link, useParams } from "react-router-dom";

export default function AIResponseReview() {
  const { id } = useParams();

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <Link className="muted" to={`/enquiries/${id}`}>
            ← Back to enquiry
          </Link>
          <h1>AI Response Review</h1>
          <p className="muted">
            AI response generation will be added in the next backend phase.
          </p>
        </div>
      </header>

      <section className="panel placeholder-panel">
        <h2>Coming soon</h2>
        <p>
          This page will let you generate, review, regenerate, and approve
          AI-assisted replies for enquiry #{id}.
        </p>
      </section>
    </div>
  );
}
