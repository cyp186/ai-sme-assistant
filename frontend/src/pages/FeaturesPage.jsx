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

export default function FeaturesPage() {
  const { user } = useAuth();

  return (
    <div className="public-page content-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="ambient ambient-three" />

      <PublicNavbar animated />

      <main className="content-main">
        <section className="content-intro animate-in animate-in-delay-1">
          <p className="eyebrow-light">Features</p>
          <h1>Everything you need for smarter customer care</h1>
          <p className="content-lead">
            A focused toolkit for SME owners and admin staff — organise
            enquiries, centralise knowledge, and draft responses without
            enterprise complexity.
          </p>
        </section>

        <section className="section-block animate-in animate-in-delay-2">
          <div className="feature-grid">
            {features.map((feature, index) => (
              <article
                key={feature.title}
                className={`feature-card glass-card animate-in animate-in-delay-${Math.min(index + 3, 6)}`}
              >
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="glass-card content-panel animate-in animate-in-delay-4">
          <p className="eyebrow-light">How it works</p>
          <h2>Less admin. More consistency.</h2>
          <p>
            Stop rewriting the same answers to pricing, availability, and policy
            questions. Centralise your knowledge and respond with confidence.
          </p>
          <ul className="hero-list">
            {steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </section>

        <section className="cta-band glass-card animate-in animate-in-delay-5">
          <div>
            <p className="eyebrow-light">Ready when you are</p>
            <h2>Bring clarity to every customer conversation</h2>
            <p>
              Set up your business profile in minutes and start building a
              knowledge base your future self will thank you for.
            </p>
          </div>
          {user ? (
            <Link className="btn btn-light btn-large" to="/dashboard">
              Open Dashboard
            </Link>
          ) : (
            <Link className="btn btn-light btn-large" to="/register">
              Create your account
            </Link>
          )}
        </section>
      </main>

      <footer className="public-footer animate-in animate-in-delay-6">
        <p>REPLIVO · Crafted for modern SMEs</p>
      </footer>
    </div>
  );
}
