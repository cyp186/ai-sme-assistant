import { Link } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";

export default function PartnershipPage() {
  return (
    <div className="public-page content-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-three" />

      <PublicNavbar animated />

      <main className="content-main">
        <section className="content-intro animate-in animate-in-delay-1">
          <p className="eyebrow-light">Partnership</p>
          <h1>Work with us</h1>
          <p className="content-lead">
            We are exploring partnerships with business networks, accounting
            firms, and SME support organisations who want to offer smarter
            customer communication tools to their clients.
          </p>
        </section>

        <section className="glass-card content-panel animate-in animate-in-delay-2">
          <h2>Who we partner with</h2>
          <ul className="hero-list">
            <li>Small business advisory groups</li>
            <li>Industry associations and chambers of commerce</li>
            <li>Business coaches and consultants</li>
            <li>Technology resellers serving SME clients</li>
          </ul>
          <p>
            Interested in collaborating? Get in touch to discuss pilot programmes,
            referrals, or co-branded onboarding for your members.
          </p>
        </section>

        <section className="cta-band glass-card animate-in animate-in-delay-3">
          <div>
            <h2>Let&apos;s build something together</h2>
            <p>
              Partnership enquiries are welcome as the platform grows. Start
              using the product today and reach out when you are ready to talk.
            </p>
          </div>
          <Link className="btn btn-light btn-large" to="/register">
            Get started
          </Link>
        </section>
      </main>
    </div>
  );
}
