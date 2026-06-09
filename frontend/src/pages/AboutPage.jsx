import { Link } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";
import { useAuth } from "../context/AuthContext";

export default function AboutPage() {
  const { user } = useAuth();

  return (
    <div className="public-page content-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="ambient ambient-three" />

      <PublicNavbar animated />

      <main className="content-main">
        <section className="content-intro animate-in animate-in-delay-1">
          <p className="eyebrow-light">About</p>
          <h1>AI Business Assistant for SMEs</h1>
          <p className="content-lead">
            A refined assistant for small and medium businesses. We help you
            organise customers, manage enquiries, and generate thoughtful
            AI-assisted responses grounded in your own business knowledge.
          </p>
        </section>

        <section className="glass-card content-panel animate-in animate-in-delay-2">
          <h2>Why we built this</h2>
          <p>
            Small businesses often receive repeated customer questions about
            pricing, availability, services, policies, and bookings. Manually
            answering these enquiries takes time and can lead to inconsistent
            responses.
          </p>
          <p>
            We reduce repetitive admin work by organising enquiries and
            generating response drafts using AI — so business owners can spend
            less time on inbox management and more time running their business.
          </p>
        </section>

        <section className="glass-card content-panel animate-in animate-in-delay-3">
          <h2>Built for business owners first</h2>
          <p>
            Every feature is designed around clarity, consistency, and control:
            you stay in charge of what gets sent, while the assistant does the
            heavy lifting.
          </p>
          <p>
            Primary users are SME owners and admin staff who need a simple,
            dependable system — not enterprise complexity.
          </p>
        </section>

        <section className="cta-band glass-card animate-in animate-in-delay-4">
          <div>
            <p className="eyebrow-light">Explore the platform</p>
            <h2>See what REPLIVO can do for your business</h2>
            <p>
              From customer records to AI-assisted drafts, discover the tools
              that keep every conversation on track.
            </p>
          </div>
          <Link className="btn btn-light btn-large" to="/features">
            View features
          </Link>
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
