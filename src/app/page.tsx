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
            <div style={{ maxWidth: 840 }}>
              <span className="badge badge-violet reveal reveal-1" style={{ marginBottom: 18 }}>
                Midnight Network · Privacy-First Rental Pre-Qualification &amp; Viewing Pass
              </span>
              <h1 className="display-xl reveal reveal-2">
                Pre-qualify for apartment viewings—without spraying your bank statements, payslips,
                or ID to 20 brokers.
              </h1>
              <p className="lead reveal reveal-3">
                LeaseProof turns issuer-anchored Open Banking &amp; Payroll attestations into
                listing-bound, revocable zero-knowledge Viewing Passes on Midnight. Brokers verify
                affordability off-chain in 3 seconds with zero wallet; tenants disclose zero raw
                salary or balance—and only share legal ID with the single landlord they actually sign
                with.
              </p>

              <div className="reveal reveal-4" style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                <Link href="/app" className="btn-primary">
                  Launch Interactive ZK Sandbox <ArrowUpRight size={16} />
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
                  Brokers store zero sensitive PDFs during pre-qualification
                </div>
              </div>
              <div className="card" style={{ borderColor: "rgba(16, 185, 129, 0.35)" }}>
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
                  On-Chain Privacy Model
                </div>
                <strong className="tabular" style={{ fontSize: 28, color: "var(--green)" }}>
                  Threshold-Only
                </strong>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                  Zero raw salary, balance, or bank PDFs disclosed on-chain
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 1 Flexible Compact Contract · 2 Modes · 3 Rental Verticals */}
        <section style={{ padding: "56px 0", borderBottom: "1px solid var(--border)" }}>
          <div className="container">
            <div style={{ marginBottom: 24 }}>
              <span className="badge badge-cyan" style={{ marginBottom: 10 }}>
                1 Flexible Contract · 2 Circuit Modes · 3 Rental Verticals
              </span>
              <h2 className="display-md">Built for Real Everyday Pre-Qualification Checks</h2>
              <p className="prose" style={{ margin: 0, fontSize: 15, color: "var(--muted)", lineHeight: 1.6 }}>
                A single parameterized Midnight Compact contract enforces ISO-4217 currency parity,
                issuer-anchored attestations, and listing-bound passes across salaried rentals,
                freelancer runway checks, and vehicle leases.
              </p>
            </div>

            <div className="grid-3">
              <div className="card">
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <Building2 size={20} color="#7c5cff" style={{ flexShrink: 0 }} />
                  <strong style={{ fontSize: 17 }}>Apartment &amp; House Viewing</strong>
                </div>
                <p style={{ margin: "0 0 12px", fontSize: 14, color: "var(--muted)", lineHeight: 1.55 }}>
                  Proves <strong style={{ color: "var(--text)" }}>monthly income ≥ 3× rent</strong>{" "}
                  and <strong style={{ color: "var(--text)" }}>liquid deposit ≥ 2× rent</strong>{" "}
                  from an issuer-anchored payroll or open-banking attestation.
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
                  in matching ISO-4217 currency.
                </p>
                <span className="badge badge-cyan mono">mode = 1 (Liquid Runway Only)</span>
              </div>

              <div className="card">
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <Car size={20} color="#10b981" style={{ flexShrink: 0 }} />
                  <strong style={{ fontSize: 17 }}>Vehicle &amp; Equipment Lease</strong>
                </div>
                <p style={{ margin: "0 0 12px", fontSize: 14, color: "var(--muted)", lineHeight: 1.55 }}>
                  Instant pre-qualification for EV subscriptions, car leases, and B2B equipment
                  rentals with anti-forward listing binding and KYC identity commitment.
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
                Hardened Midnight Dual-Ledger Guarantee
              </span>
              <h2 className="display-md">What Brokers Verify vs. What Stays Private Forever</h2>
            </div>

            <div className="grid-2">
              <div className="card" style={{ borderColor: "rgba(16, 185, 129, 0.35)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0 }} />
                  <strong style={{ fontSize: 16 }}>Public Midnight Ledger (Off-Chain Readable)</strong>
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 10, fontSize: 14, color: "var(--muted)" }}>
                  <li>
                    <strong style={{ color: "var(--text)" }}>Listing-Bound Verdict:</strong>{" "}
                    <span className="mono" style={{ color: "var(--green)" }}>QUALIFIED (1)</span>,{" "}
                    <span className="mono" style={{ color: "var(--red)" }}>REVOKED (2)</span>, or{" "}
                    <span className="mono" style={{ color: "var(--amber)" }}>EXPIRED (3)</span>—rejects
                    cross-listing forwarding (<span className="mono">LISTING_MISMATCH</span>)
                  </li>
                  <li>
                    <strong style={{ color: "var(--text)" }}>Issuer-Anchored Attestation:</strong>{" "}
                    Signed &amp; anchored on-ledger by Plaid / Tink / Argyle via{" "}
                    <span className="mono">anchorAttestation()</span>
                  </li>
                  <li>
                    <strong style={{ color: "var(--text)" }}>Anti-Straw-Applicant Binding:</strong>{" "}
                    Pseudonymous <span className="mono">applicantIdCommit</span> stops borrowing a
                    wealthy friend&apos;s account
                  </li>
                  <li>
                    <strong style={{ color: "var(--text)" }}>14-Day Expiry &amp; Instant Revocation:</strong>{" "}
                    Contract-enforced monotonic epoch + 1-click{" "}
                    <span className="mono">revokeReceipt()</span> with next-window re-apply
                  </li>
                </ul>
              </div>

              <div className="card" style={{ borderColor: "rgba(124, 92, 255, 0.35)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <EyeOff size={18} color="#7c5cff" style={{ flexShrink: 0 }} />
                  <strong style={{ fontSize: 16 }}>Local Private Witness (Never Leaves Device)</strong>
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 10, fontSize: 14, color: "var(--muted)" }}>
                  <li>
                    <strong style={{ color: "var(--text)" }}>Exact Monthly Salary:</strong> Threshold-only
                    proof confirms you meet the rent bar without exposing exact earnings
                  </li>
                  <li>
                    <strong style={{ color: "var(--text)" }}>Total Bank Balance &amp; Transactions:</strong>{" "}
                    Zero bank statements, zero spending history uploaded to brokers
                  </li>
                  <li>
                    <strong style={{ color: "var(--text)" }}>Raw Identity &amp; Employer Name:</strong>{" "}
                    Legal ID is only presented once at final lease signing, never during 20 viewings
                  </li>
                  <li>
                    <strong style={{ color: "var(--text)" }}>Attestation Nonce &amp; Tenant Secret:</strong>{" "}
                    Blinds commitments against brute-force guessing while proving revoke ownership
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Realistic Unit Economics & Adoption Path */}
        <section style={{ padding: "56px 0" }}>
          <div className="container">
            <div style={{ marginBottom: 24 }}>
              <span className="badge badge-neutral" style={{ marginBottom: 10 }}>
                Incentive-Aligned Unit Economics
              </span>
              <h2 className="display-md">One Reusable Tenant Pass Replaces $35–$50 Per-Listing Fees.</h2>
            </div>

            <div className="grid-3">
              <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 16 }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span className="badge badge-ok">First Pass / Sandbox</span>
                    <strong className="tabular" style={{ fontSize: 18 }}>$0 Free</strong>
                  </div>
                  <h3 style={{ margin: "0 0 8px", fontSize: 17 }}>Try Private Pre-Qualification</h3>
                  <p style={{ margin: 0, fontSize: 13.5, color: "var(--muted)", lineHeight: 1.55 }}>
                    Zero friction for landlords (walletless off-chain verifier is always $0) and
                    free first pass for tenants testing private viewing qualification.
                  </p>
                </div>
                <Link href="/app" className="btn-ghost" style={{ width: "fit-content" }}>
                  Try as Tenant <ArrowUpRight size={14} />
                </Link>
              </div>

              <div className="card" style={{ borderColor: "rgba(124, 92, 255, 0.45)", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 16 }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span className="badge badge-violet">Active Renters</span>
                    <strong className="tabular" style={{ fontSize: 18, color: "#c4b5fd" }}>$1.99 / 30d</strong>
                  </div>
                  <h3 style={{ margin: "0 0 8px", fontSize: 17 }}>Reusable Multi-Listing Pass</h3>
                  <p style={{ margin: 0, fontSize: 13.5, color: "var(--muted)", lineHeight: 1.55 }}>
                    Covers Plaid/Tink Open Banking attestation cost once, then lets renters mint
                    unlimited listing-bound Viewing Passes across 20+ apartments instead of paying
                    $35–$50 per application.
                  </p>
                </div>
                <Link href="/app?tab=landlord" className="btn-primary" style={{ width: "fit-content" }}>
                  Try Walletless Verifier <ArrowUpRight size={14} />
                </Link>
              </div>

              <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 16 }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span className="badge badge-cyan">Property Portals</span>
                    <strong className="tabular" style={{ fontSize: 18 }}>B2B Portal API</strong>
                  </div>
                  <h3 style={{ margin: "0 0 8px", fontSize: 17 }}>Embedded Pre-Qual Badge</h3>
                  <p style={{ margin: 0, fontSize: 13.5, color: "var(--muted)", lineHeight: 1.55 }}>
                    White-label Midnight verification SDK for Zillow/StreetEasy-style portals and
                    co-living marketplaces—subsidizing Open Banking calls to eliminate broker spam.
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
                <FileWarning size={13} color="#22d3ee" /> Compact Contract Compiled on Ubuntu Linux CI · Transparent Browser Sandbox
              </span>
            </footer>
          </div>
        </section>
      </main>
    </>
  );
}
