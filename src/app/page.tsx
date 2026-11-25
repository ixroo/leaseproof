import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  Car,
  CheckCircle2,
  EyeOff,
  FileWarning,
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
            <span className="nav-sub">Built on Midnight ZK</span>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link href="/deck" className="btn-ghost hide-mobile">
              <Presentation size={15} /> Pitch Deck
            </Link>
            <Link href="/app" className="btn-primary">
              Open ZK Desk <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Clean Editorial Hero */}
        <section className="hero-section">
          <div className="container">
            <div style={{ maxWidth: 820 }}>
              <span className="badge badge-violet reveal reveal-1" style={{ marginBottom: 18 }}>
                Midnight Network · Compact Dual-Ledger Selective Disclosure
              </span>
              <h1 className="display-xl reveal reveal-2">
                Prove you qualify to rent—without handing landlords your bank statements, payslips,
                or ID.
              </h1>
              <p className="lead reveal reveal-3">
                LeaseProof turns Open Banking &amp; Payroll attestations into zero-knowledge
                Qualification Passes on Midnight. Landlords get tamper-proof cryptographic certainty
                in 3 seconds; tenants keep 100% of their salary, balance, and identity private—and
                can revoke any pass with one click.
              </p>

              <div className="reveal reveal-4" style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                <Link href="/app" className="btn-primary">
                  Launch Interactive ZK Workspace <ArrowUpRight size={16} />
                </Link>
                <Link href="/app?tab=attacks" className="btn-ghost">
                  Test 8 Adversarial Attacks
                </Link>
                <Link href="/deck" className="btn-ghost">
                  View 8-Slide Pitch Deck
                </Link>
              </div>
            </div>

            {/* Verified Market Pain Strip (Real NMHC & Snappt Industry Data) */}
            <div className="grid-4" style={{ marginTop: 42 }}>
              <div className="card">
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
                  Rental Providers Hit by Fraud
                </div>
                <strong className="tabular" style={{ fontSize: 30, color: "#f87171" }}>
                  93.3%
                </strong>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                  Experienced application fraud in 12 mos (NMHC Survey)
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
                  Leading fraud vector; up to 1 in 8 apps doctored (Snappt)
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
                  Landlords store zero sensitive PDFs or ID scans
                </div>
              </div>
              <div className="card" style={{ borderColor: "rgba(16, 185, 129, 0.35)" }}>
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
                  Private Data Exposed On-Chain
                </div>
                <strong className="tabular" style={{ fontSize: 30, color: "var(--green)" }}>
                  0 Bits
                </strong>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                  Salary, balance &amp; secret stay in local Compact witnesses
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3 Real-World Templates Powered by One Compact Contract */}
        <section style={{ padding: "56px 0", borderBottom: "1px solid var(--border)" }}>
          <div className="container">
            <div style={{ marginBottom: 24 }}>
              <span className="badge badge-cyan" style={{ marginBottom: 10 }}>
                One Compact Contract · Three High-Frequency Templates
              </span>
              <h2 className="display-md">Built for Real Everyday Qualification Checks</h2>
              <p className="prose" style={{ margin: 0, fontSize: 15, color: "var(--muted)", lineHeight: 1.6 }}>
                Whether you earn a corporate salary or freelance across borders, LeaseProof verifies
                exact thresholds privately inside Midnight Compact circuits—without exposing raw
                financial history.
              </p>
            </div>

            <div className="grid-3">
              <div className="card">
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <Building2 size={20} color="#7c5cff" style={{ flexShrink: 0 }} />
                  <strong style={{ fontSize: 17 }}>Apartment &amp; House Lease</strong>
                </div>
                <p style={{ margin: "0 0 12px", fontSize: 14, color: "var(--muted)", lineHeight: 1.55 }}>
                  Proves <strong style={{ color: "var(--text)" }}>monthly income ≥ 3× rent</strong>{" "}
                  and <strong style={{ color: "var(--text)" }}>liquid deposit ≥ 2× rent</strong>{" "}
                  from a verified payroll or open-banking attester.
                </p>
                <span className="badge badge-neutral mono">mode = 0 (Income + Deposit)</span>
              </div>

              <div className="card" style={{ borderColor: "rgba(34, 211, 238, 0.32)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <Laptop size={20} color="#22d3ee" style={{ flexShrink: 0 }} />
                  <strong style={{ fontSize: 17 }}>Freelancer &amp; Co-Living Runway</strong>
                </div>
                <p style={{ margin: "0 0 12px", fontSize: 14, color: "var(--muted)", lineHeight: 1.55 }}>
                  Designed for remote workers, founders &amp; nomads without a W-2 payslip: proves{" "}
                  <strong style={{ color: "var(--text)" }}>liquid savings ≥ 6× monthly rent</strong>{" "}
                  privately.
                </p>
                <span className="badge badge-cyan mono">mode = 1 (Liquid Runway Only)</span>
              </div>

              <div className="card">
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <Car size={20} color="#10b981" style={{ flexShrink: 0 }} />
                  <strong style={{ fontSize: 17 }}>Vehicle &amp; Equipment Lease</strong>
                </div>
                <p style={{ margin: "0 0 12px", fontSize: 14, color: "var(--muted)", lineHeight: 1.55 }}>
                  Instant qualification for EV subscriptions, car leases, and B2B equipment rentals
                  with listing-scoped anti-replay protection.
                </p>
                <span className="badge badge-neutral mono">mode = 0 (4× Lease + 3× Deposit)</span>
              </div>
            </div>
          </div>
        </section>

        {/* Dual-Ledger Privacy Model: Anyone Can See vs Nobody Can See */}
        <section style={{ padding: "56px 0", borderBottom: "1px solid var(--border)" }}>
          <div className="container">
            <div style={{ marginBottom: 24 }}>
              <span className="badge badge-violet" style={{ marginBottom: 10 }}>
                Midnight Dual-Ledger Guarantee
              </span>
              <h2 className="display-md">What Landlords See vs. What Stays Private Forever</h2>
            </div>

            <div className="grid-2">
              <div className="card" style={{ borderColor: "rgba(16, 185, 129, 0.35)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0 }} />
                  <strong style={{ fontSize: 16 }}>Anyone Can Verify (Public Midnight Ledger)</strong>
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 10, fontSize: 14, color: "var(--muted)" }}>
                  <li>
                    <strong style={{ color: "var(--text)" }}>Binary Verdict:</strong>{" "}
                    <span className="mono" style={{ color: "var(--green)" }}>QUALIFIED (1)</span> or{" "}
                    <span className="mono" style={{ color: "var(--red)" }}>REVOKED (2)</span>
                  </li>
                  <li>
                    <strong style={{ color: "var(--text)" }}>Trusted Attester ID:</strong> e.g. Plaid
                    Open Banking / Tink EU / Argyle Payroll
                  </li>
                  <li>
                    <strong style={{ color: "var(--text)" }}>Listing-Scoped Nullifier:</strong>{" "}
                    Blocks duplicate replay on the same listing while keeping multi-listing
                    applications unlinkable
                  </li>
                  <li>
                    <strong style={{ color: "var(--text)" }}>Pass Expiry &amp; Revocation:</strong>{" "}
                    Auto-expires in 14 days or revoked instantly by tenant via{" "}
                    <span className="mono">revokeReceipt()</span>
                  </li>
                </ul>
              </div>

              <div className="card" style={{ borderColor: "rgba(124, 92, 255, 0.35)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <EyeOff size={18} color="#7c5cff" style={{ flexShrink: 0 }} />
                  <strong style={{ fontSize: 16 }}>Nobody Can Ever See (Local Private Witness)</strong>
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 10, fontSize: 14, color: "var(--muted)" }}>
                  <li>
                    <strong style={{ color: "var(--text)" }}>Exact Monthly Salary:</strong> Whether
                    you earn $7,200 or $42,000/mo is never revealed
                  </li>
                  <li>
                    <strong style={{ color: "var(--text)" }}>Total Bank Balance &amp; Transactions:</strong>{" "}
                    Zero bank statements, zero spending history
                  </li>
                  <li>
                    <strong style={{ color: "var(--text)" }}>Identity &amp; Employer Name:</strong>{" "}
                    Tenant secret stays on-device; zero cross-landlord tracking
                  </li>
                  <li>
                    <strong style={{ color: "var(--text)" }}>Attestation Nonce &amp; Salt:</strong>{" "}
                    Prevents brute-force commitment guessing
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Business Model & Adoption Path */}
        <section style={{ padding: "56px 0" }}>
          <div className="container">
            <div style={{ marginBottom: 24 }}>
              <span className="badge badge-neutral" style={{ marginBottom: 10 }}>
                Sustainable B2B2C Business Model
              </span>
              <h2 className="display-md">Free for Renters. Paid by Landlords Who Save 10× on Screening.</h2>
            </div>

            <div className="grid-3">
              <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 16 }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span className="badge badge-ok">Tenants</span>
                    <strong className="tabular" style={{ fontSize: 18 }}>$0 / Free</strong>
                  </div>
                  <h3 style={{ margin: "0 0 8px", fontSize: 17 }}>Private Qualification Pass</h3>
                  <p style={{ margin: 0, fontSize: 13.5, color: "var(--muted)", lineHeight: 1.55 }}>
                    Generate unlimited listing-scoped ZK passes, share walletless verification links,
                    and revoke landlord access anytime with one click.
                  </p>
                </div>
                <Link href="/app" className="btn-ghost" style={{ width: "fit-content" }}>
                  Try as Tenant <ArrowUpRight size={14} />
                </Link>
              </div>

              <div className="card" style={{ borderColor: "rgba(124, 92, 255, 0.45)", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 16 }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span className="badge badge-violet">Landlords &amp; Agencies</span>
                    <strong className="tabular" style={{ fontSize: 18, color: "#c4b5fd" }}>$2 / Pass</strong>
                  </div>
                  <h3 style={{ margin: "0 0 8px", fontSize: 17 }}>Anti-Fraud Instant Verifier</h3>
                  <p style={{ margin: 0, fontSize: 13.5, color: "var(--muted)", lineHeight: 1.55 }}>
                    Replaces $15–$50 manual PDF screening with instant cryptographic verification
                    that stops Photoshopped pay stubs and removes GDPR data-breach liability.
                  </p>
                </div>
                <Link href="/app?tab=landlord" className="btn-primary" style={{ width: "fit-content" }}>
                  Try as Landlord <ArrowUpRight size={14} />
                </Link>
              </div>

              <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 16 }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span className="badge badge-cyan">Rental Platforms</span>
                    <strong className="tabular" style={{ fontSize: 18 }}>Enterprise API</strong>
                  </div>
                  <h3 style={{ margin: "0 0 8px", fontSize: 17 }}>Embedded ZK Verification SDK</h3>
                  <p style={{ margin: 0, fontSize: 13.5, color: "var(--muted)", lineHeight: 1.55 }}>
                    Drop-in Midnight verification widget for property portals, co-living networks,
                    and mobility subscription platforms with custom attester allowlists.
                  </p>
                </div>
                <Link href="/deck" className="btn-ghost" style={{ width: "fit-content" }}>
                  View Pitch Deck <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>

            <footer
              style={{
                marginTop: 48,
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
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <FileWarning size={13} color="#22d3ee" /> Compact Smart Contract Compiled on Ubuntu Linux CI · Interactive Browser Mirror
              </span>
            </footer>
          </div>
        </section>
      </main>
    </>
  );
}
