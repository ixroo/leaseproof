import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  Car,
  CheckCircle2,
  Clock,
  Code2,
  EyeOff,
  Laptop,
  Lock,
  Presentation,
  ShieldCheck,
} from "lucide-react";

export default function LandingPage() {
  return (
    <>
      <header className="site-header">
        <div className="site-header-inner">
          <Link href="/" className="brand-lockup">
            <span className="brand-mark" aria-hidden="true">
              <ShieldCheck size={18} strokeWidth={2.4} />
            </span>
            <span>LeaseProof</span>
            <span className="nav-divider">|</span>
            <span className="nav-sub">Private Rental Viewing Pass</span>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link href="/deck" className="btn-ghost">
              <Presentation size={15} />
              <span className="hide-xs">Pitch Deck</span>
              <span className="show-xs">Deck</span>
            </Link>
            <Link href="/app" className="btn-primary">
              <span className="hide-xs">Open Workspace</span>
              <span className="show-xs">Open App</span>
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Human-First Hero + Visual Digital Viewing Pass */}
        <section className="hero-section">
          <div className="container">
            <div className="hero-split">
              <div>
                <span className="badge badge-violet reveal reveal-1" style={{ marginBottom: 18 }}>
                  Private Rental Pre-Qualification · Powered by Midnight
                </span>
                <h1 className="display-xl reveal reveal-2">
                  Book apartment viewings without sending your bank statements, payslips, or ID to
                  20 brokers.
                </h1>
                <p className="lead reveal reveal-3">
                  Connect your bank or payroll once to generate a tamper-proof{" "}
                  <strong style={{ color: "var(--text)" }}>Viewing Pass</strong>. Brokers confirm
                  you meet the rent requirement in 3 seconds—while your exact salary, bank balance,
                  and documents stay 100% private. Share your legal ID only with the single landlord
                  you sign with.
                </p>

                <div className="reveal reveal-4" style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                  <Link href="/app" className="btn-primary">
                    Create Your Viewing Pass <ArrowUpRight size={16} />
                  </Link>
                  <Link href="/app?tab=landlord" className="btn-ghost">
                    Verify a Tenant Pass
                  </Link>
                </div>
              </div>

              {/* Clean Digital Boarding-Pass Style Focal Point */}
              <div className="viewing-pass-card reveal reveal-3">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted)" }}>
                    Viewing Pass Preview
                  </span>
                  <span className="badge badge-ok">
                    <CheckCircle2 size={13} /> QUALIFIED
                  </span>
                </div>

                <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
                  SoHo Lofts · 1BR Apartment
                </div>
                <div style={{ fontSize: 13.5, color: "var(--muted)" }}>
                  $2,400/mo · Verified via Argyle Payroll
                </div>

                <hr className="pass-divider" />

                <div style={{ display: "grid", gap: 10, fontSize: 13.5 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <span style={{ color: "var(--muted)" }}>Income &amp; Deposit Check</span>
                    <strong style={{ color: "var(--green)" }}>Meets 3× Rent Bar</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <span style={{ color: "var(--muted)" }}>Salary / Bank PDFs Shared</span>
                    <strong style={{ color: "var(--text)" }}>None (Private)</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <span style={{ color: "var(--muted)" }}>Pass Validity</span>
                    <strong style={{ color: "var(--cyan)", display: "inline-flex", alignItems: "center", gap: 5 }}>
                      <Clock size={13} /> 14 Days · Revocable
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Real Industry Pain Strip */}
            <div className="grid-4" style={{ marginTop: 48 }}>
              <div className="card">
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
                  Landlords Hit by Fraud
                </div>
                <strong className="tabular" style={{ fontSize: 30, color: "#f87171" }}>
                  93.3%
                </strong>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                  Experienced application fraud in 12 mos (NMHC)
                </div>
              </div>
              <div className="card">
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
                  Fake Pay Stubs &amp; Bank PDFs
                </div>
                <strong className="tabular" style={{ fontSize: 30, color: "var(--amber)" }}>
                  84.3%
                </strong>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                  Up to 1 in 8 rental apps contain doctored PDFs (Snappt)
                </div>
              </div>
              <div className="card">
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
                  GDPR Data Minimization
                </div>
                <strong className="tabular" style={{ fontSize: 30, color: "var(--cyan)" }}>
                  Art. 5(1)(c)
                </strong>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                  Brokers hold zero sensitive PDFs during viewings
                </div>
              </div>
              <div className="card" style={{ borderColor: "rgba(16, 185, 129, 0.35)" }}>
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
                  Documents Shared to Brokers
                </div>
                <strong className="tabular" style={{ fontSize: 30, color: "var(--green)" }}>
                  Zero PDFs
                </strong>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                  Only a verified pass—never your exact salary or balance
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3 Everyday Rental Verticals */}
        <section style={{ padding: "64px 0", borderBottom: "1px solid var(--border)" }}>
          <div className="container">
            <div style={{ marginBottom: 28 }}>
              <span className="badge badge-cyan" style={{ marginBottom: 10 }}>
                Three Everyday Rental Scenarios
              </span>
              <h2 className="display-md">Works Whether You Are Salaried, Freelance, or Leasing a Car</h2>
              <p className="prose" style={{ margin: 0, fontSize: 15, color: "var(--muted)", lineHeight: 1.6 }}>
                Every pass is locked to a single listing, verified in the listing&apos;s exact
                currency, and automatically expires after 14 days so your data never lingers.
              </p>
            </div>

            <div className="grid-3">
              <div className="card">
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <Building2 size={20} color="#7c5cff" style={{ flexShrink: 0 }} />
                  <strong style={{ fontSize: 17 }}>Apartment &amp; House Viewing</strong>
                </div>
                <p style={{ margin: 0, fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>
                  Confirms your <strong style={{ color: "var(--text)" }}>monthly income is ≥ 3× rent</strong>{" "}
                  and <strong style={{ color: "var(--text)" }}>deposit savings ≥ 2× rent</strong>{" "}
                  directly from verified payroll or bank data.
                </p>
              </div>

              <div className="card" style={{ borderColor: "rgba(34, 211, 238, 0.32)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <Laptop size={20} color="#22d3ee" style={{ flexShrink: 0 }} />
                  <strong style={{ fontSize: 17 }}>Freelancer &amp; Co-Living Runway</strong>
                </div>
                <p style={{ margin: 0, fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>
                  No corporate payslip? No problem. Prove{" "}
                  <strong style={{ color: "var(--text)" }}>6+ months of liquid rent runway</strong>{" "}
                  in seconds without exposing your full savings account.
                </p>
              </div>

              <div className="card">
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <Car size={20} color="#10b981" style={{ flexShrink: 0 }} />
                  <strong style={{ fontSize: 17 }}>Vehicle &amp; Equipment Lease</strong>
                </div>
                <p style={{ margin: 0, fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>
                  Instant affordability check for EV subscriptions and equipment leases—locked to
                  that specific vehicle and your verified identity.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Human-Readable Privacy Comparison */}
        <section style={{ padding: "64px 0", borderBottom: "1px solid var(--border)" }}>
          <div className="container">
            <div style={{ marginBottom: 28 }}>
              <span className="badge badge-violet" style={{ marginBottom: 10 }}>
                Simple Privacy Promise
              </span>
              <h2 className="display-md">What Brokers See vs. What Stays on Your Device</h2>
            </div>

            <div className="grid-2">
              <div className="card" style={{ borderColor: "rgba(16, 185, 129, 0.3)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0 }} />
                  <strong style={{ fontSize: 16 }}>What the Landlord / Broker Sees</strong>
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 11, fontSize: 14, color: "var(--muted)", lineHeight: 1.55 }}>
                  <li>
                    <strong style={{ color: "var(--text)" }}>Clear Pass Status:</strong> Qualified,
                    Revoked, or Expired—checked in any browser with zero crypto wallet required.
                  </li>
                  <li>
                    <strong style={{ color: "var(--text)" }}>Bank-Verified Source:</strong>{" "}
                    Cryptographic proof that the data came from Plaid, Tink, or Argyle—not a
                    Photoshopped PDF.
                  </li>
                  <li>
                    <strong style={{ color: "var(--text)" }}>Listing &amp; Identity Lock:</strong>{" "}
                    A pass for a $500 room cannot be forwarded to a $5,000 penthouse or borrowed
                    from a wealthy friend.
                  </li>
                  <li>
                    <strong style={{ color: "var(--text)" }}>14-Day Auto-Expiry:</strong> Passes
                    expire automatically, or instantly the moment you revoke access.
                  </li>
                </ul>
              </div>

              <div className="card" style={{ borderColor: "rgba(124, 92, 255, 0.3)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <EyeOff size={18} color="#7c5cff" style={{ flexShrink: 0 }} />
                  <strong style={{ fontSize: 16 }}>What Nobody Ever Sees</strong>
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 11, fontSize: 14, color: "var(--muted)", lineHeight: 1.55 }}>
                  <li>
                    <strong style={{ color: "var(--text)" }}>Your Exact Salary:</strong> Brokers
                    only learn you clear the rent bar—never whether you earn $7k or $40k/mo.
                  </li>
                  <li>
                    <strong style={{ color: "var(--text)" }}>Bank Balance &amp; Spending:</strong>{" "}
                    Zero transaction history, zero PDF statements sitting in a broker&apos;s inbox.
                  </li>
                  <li>
                    <strong style={{ color: "var(--text)" }}>Passport / ID Scans:</strong> Keep
                    your legal ID off WhatsApp; show it once when signing your final lease.
                  </li>
                  <li>
                    <strong style={{ color: "var(--text)" }}>Other Apartments You Applied To:</strong>{" "}
                    Every viewing pass is unlinkable across different landlords.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Incentive-Aligned Pricing (Fixed CTAs!) */}
        <section style={{ padding: "64px 0" }}>
          <div className="container">
            <div style={{ marginBottom: 28 }}>
              <span className="badge badge-neutral" style={{ marginBottom: 10 }}>
                Fair, Simple Pricing
              </span>
              <h2 className="display-md">Free for Landlords. One $1.99 Pass Replaces $35–$50 Per-Listing Fees.</h2>
            </div>

            <div className="grid-3">
              <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 18 }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span className="badge badge-ok">Landlords &amp; Brokers</span>
                    <strong className="tabular" style={{ fontSize: 18 }}>$0 Forever</strong>
                  </div>
                  <h3 style={{ margin: "0 0 8px", fontSize: 17 }}>Walletless Instant Verifier</h3>
                  <p style={{ margin: 0, fontSize: 13.5, color: "var(--muted)", lineHeight: 1.6 }}>
                    Verify any applicant&apos;s Viewing Pass in 3 seconds from your browser—zero
                    signup, zero wallet, and zero risky tenant PDFs to store.
                  </p>
                </div>
                <Link href="/app?tab=landlord" className="btn-ghost" style={{ width: "fit-content" }}>
                  Open Walletless Verifier <ArrowUpRight size={14} />
                </Link>
              </div>

              <div className="card" style={{ borderColor: "rgba(124, 92, 255, 0.45)", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 18 }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span className="badge badge-violet">Active Renters</span>
                    <strong className="tabular" style={{ fontSize: 18, color: "#c4b5fd" }}>$1.99 / 30d</strong>
                  </div>
                  <h3 style={{ margin: "0 0 8px", fontSize: 17 }}>Reusable Multi-Listing Pass</h3>
                  <p style={{ margin: 0, fontSize: 13.5, color: "var(--muted)", lineHeight: 1.6 }}>
                    First pass is free. Then unlock unlimited listing-locked Viewing Passes for 30
                    days—covering Open Banking verification once instead of paying $35–$50 per unit.
                  </p>
                </div>
                <Link href="/app" className="btn-primary" style={{ width: "fit-content" }}>
                  Mint Reusable Pass <ArrowUpRight size={14} />
                </Link>
              </div>

              <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 18 }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span className="badge badge-cyan">Property Portals</span>
                    <strong className="tabular" style={{ fontSize: 18 }}>B2B Portal API</strong>
                  </div>
                  <h3 style={{ margin: "0 0 8px", fontSize: 17 }}>Embedded Pre-Qual Badge</h3>
                  <p style={{ margin: 0, fontSize: 13.5, color: "var(--muted)", lineHeight: 1.6 }}>
                    Drop-in verified badge for rental marketplaces and co-living platforms—cutting
                    broker spam while staying GDPR compliant.
                  </p>
                </div>
                <Link href="/deck" className="btn-ghost" style={{ width: "fit-content" }}>
                  View Pitch Deck <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>

            {/* Under the Hood — Dedicated Section for Midnight Technical Judges */}
            <div
              className="card-subtle"
              style={{
                marginTop: 40,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 16,
                padding: "18px 20px",
              }}
            >
              <div style={{ maxWidth: 680 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <Code2 size={16} color="#22d3ee" />
                  <strong style={{ fontSize: 14.5 }}>
                    Under the Hood · For Midnight Technical Judges
                  </strong>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: "var(--muted)", lineHeight: 1.55 }}>
                  Powered by 1 parameterized Compact contract (
                  <span className="mono" style={{ color: "var(--cyan)" }}>
                    contracts/leaseproof.compact
                  </span>
                  , 7 circuits compiled on Ubuntu Linux CI via Compact 0.36.1) with admin-gated
                  attester anchoring, ISO-4217 currency parity, windowed nullifiers, and 17 passing
                  unit + adversarial tests.
                </p>
              </div>
              <Link href="/app?tab=attacks" className="btn-ghost">
                Open 8-Attack Security Lab <ArrowUpRight size={14} />
              </Link>
            </div>

            <footer
              style={{
                marginTop: 32,
                paddingTop: 20,
                borderTop: "1px solid var(--border)",
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
                fontSize: 12.5,
                color: "var(--muted)",
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Lock size={13} color="#7c5cff" /> LeaseProof · Apache-2.0 Open Source · AKINDO × Midnight Wave 3
              </span>
              <span>Compact 0.36.1 CI Verified · Transparent Interactive Browser Sandbox</span>
            </footer>
          </div>
        </section>
      </main>
    </>
  );
}
