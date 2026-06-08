import { Link } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";
import { useAuth } from "../context/AuthContext";

const features = [
  {
    title: "Customer Management",
    description:
      "Keep every customer contact organised in one elegant workspace built for busy small businesses.",
  },
  {
    title: "Enquiry Tracking",
    description:
      "Capture questions, categories, and status updates so nothing slips through the cracks.",
  },
  {
    title: "Knowledge Base",
    description:
      "Store pricing, policies, and FAQs so your responses stay accurate and on-brand.",
  },
  {
    title: "AI Draft Responses",
    description:
      "Generate polished reply drafts from your business context, then review and approve before sending.",
  },
];

const steps = [
  "Create your account and business profile",
  "Add customers and record incoming enquiries",
  "Build your knowledge base with key business information",
  "Let AI draft responses you can refine and approve",
];

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="public-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="ambient ambient-three" />

      <PublicNavbar />

      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow-light">AI Business Assistant for SMEs</p>
            <h1>
              Turn customer enquiries into
              <span className="hero-accent"> polished replies</span>
            </h1>
            <p className="hero-lead">
              A refined assistant for small and medium businesses. Organise
              customers, manage enquiries, and generate thoughtful AI-assisted
              responses grounded in your own business knowledge.
            </p>
            <div className="hero-actions">
              {user ? (
                <Link className="btn btn-light btn-large" to="/dashboard">
                  Open Dashboard
                </Link>
              ) : (
                <>
                  <Link className="btn btn-light btn-large" to="/register">
                    Start Free
                  </Link>
                  <Link className="btn btn-glass btn-large" to="/login">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="hero-panel glass-card">
            <p className="panel-label">Built for business owners</p>
            <h2>Less admin. More consistency.</h2>
            <p>
              Stop rewriting the same answers to pricing, availability, and
              policy questions. Centralise your knowledge and respond with
              confidence.
            </p>
            <ul className="hero-list">
              {steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section-block">
          <div className="section-heading">
            <p className="eyebrow-light">Overview</p>
            <h2>Everything you need for smarter customer care</h2>
            <p>
              Designed for SME owners and admin staff who want a calm, capable
              system without enterprise complexity.
            </p>
          </div>

          <div className="feature-grid">
            {features.map((feature) => (
              <article key={feature.title} className="feature-card glass-card">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="cta-band glass-card">
          <div>
            <p className="eyebrow-light">Ready when you are</p>
            <h2>Bring clarity to every customer conversation</h2>
            <p>
              Set up your business profile in minutes and start building a
              knowledge base your future self will thank you for.
            </p>
          </div>
          {!user && (
            <Link className="btn btn-light btn-large" to="/register">
              Create your account
            </Link>
          )}
        </section>
      </main>

      <footer className="public-footer">
        <p>AI Business Assistant · Crafted for modern SMEs</p>
      </footer>
    </div>
  );
}
