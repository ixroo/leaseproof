"use client";

import Link from "next/link";
import { ArrowLeft, Printer, ShieldCheck } from "lucide-react";

const SLIDES = [
  {
    num: "01",
    tag: "LeaseProof · AKINDO × Midnight Wave 3",
    title: "Pre-qualify for apartment viewings—without spraying your bank statements, payslips, or ID to 20 brokers.",
    points: [
      "Privacy-first rental pre-qualification & Viewing Pass built on hardened Midnight Compact smart contracts.",
      "Walletless off-chain ledger verification for landlords; threshold-only proofs disclose zero raw salary, balance, or PDFs.",
      "Apache-2.0 open-source with Ubuntu Linux Compact CI compilation & 17 automated unit + 12 adversarial security tests.",
    ],
  },
  {
    num: "02",
    tag: "The Real-World Crisis (NMHC & Snappt Data)",
    title: "93.3% of landlords face application fraud—while honest renters leak bank PDFs over WhatsApp.",
    points: [
      "84.3% of rental fraud comes from Photoshopped or AI-generated pay stubs and bank statements (NMHC Pulse Survey).",
      "6.4%–12.5% of 14M+ analyzed rental applications contained doctored income documents (Snappt).",
      "LeaseProof targets the high-leakage Pre-Qualification & Viewing stage (replacing 20× PDF spraying); final lease signing still uses standard legal ID & eviction checks.",
    ],
  },
  {
    num: "03",
    tag: "Why Midnight Dual-Ledger ZK Is Required",
    title: "Public chains expose finances. PDFs are easily forged. Midnight solves both simultaneously.",
    points: [
      "Private Witnesses (Local): monthlyIncome, liquidBalance, currencyCode, tenantSecret, and attestationNonce never leave the tenant's device.",
      "Hardened Compact Circuit: verifies issuer-anchored attestation on-ledger, ISO-4217 currency parity, monotonic ledger epoch, anti-straw-applicant KYC binding, and exact thresholds.",
      "Public Ledger Output: discloses ONLY a windowed listingNullifier, listing-bound receiptId, applicantIdCommit, and status (QUALIFIED / REVOKED / EXPIRED).",
    ],
  },
  {
    num: "04",
    tag: "1 Flexible Contract · 2 Circuit Modes · 3 Rental Verticals",
    title: "One parameterized Compact contract serving salaried tenants, freelancers, and vehicle leases.",
    points: [
      "Mode 0 — Apartment & House Viewing: proves monthly income >= 3x rent AND liquid deposit >= 2x rent in matching ISO-4217 currency.",
      "Mode 1 — Freelancer & Co-Living Runway: proves liquid savings >= 6x rent with $0 corporate payslip required.",
      "Mode 0 — Vehicle & Equipment Lease: instant affordability pre-qualification with anti-forward listing binding.",
    ],
  },
  {
    num: "05",
    tag: "Hardened Security Architecture (contracts/leaseproof.compact)",
    title: "Admin-Gated Registry, Issuer-Anchored Attestations & 12 Rejected Attack Vectors.",
    points: [
      "Eliminates local re-hash bypass: attesters call anchorAttestation() using their authenticated issuer key; local salary edits fail ATTESTATION_NOT_ANCHORED / TAMPERED_COMMITMENT.",
      "Eliminates cross-listing forwarding & straw applicants: every receipt is bound to (listingId, applicantIdCommit, 14-day expiry) and checked off-chain without a wallet.",
      "17 Vitest Tests Passing: verifies UNAUTHORIZED_ADMIN, UNAUTHORIZED_ISSUER_KEY, TAMPERED_COMMITMENT, LISTING_MISMATCH, CURRENCY_MISMATCH, REPLAY_ATTACK (even with rotated secret), EXPIRED_ATTESTATION, and UNAUTHORIZED_REVOKE.",
    ],
  },
  {
    num: "06",
    tag: "Zero Friction UX (Transparent Sandbox + Walletless Verifier)",
    title: "3-Role Interactive Workspace with Live Split-Screen Privacy Audit.",
    points: [
      "Tenant Proof Studio: 1-click personas, ISO-4217 currency selector, KYC Identity Binding, live 'Public Ledger vs. Local Witness' inspector, and 1-click Revoke Pass.",
      "Landlord Verifier (Walletless): reads public ledger off-chain—no ZK proving or wallet needed; flags QUALIFIED, REVOKED, EXPIRED (14d), and LISTING_MISMATCH.",
      "Attack & Attester Lab: judges can trigger 8 red-team attacks in 1 click plus Simulate +15 Days to watch on-chain expiry & next-window re-apply live.",
    ],
  },
  {
    num: "07",
    tag: "Why Web2 Substitutes Fail & Incentive-Aligned Unit Economics",
    title: "Why Web2 Screening Fails Both Sides — And How LeaseProof Gets Paid.",
    points: [
      "Why Web2 Fails: WhatsApp PDFs are trivial to Photoshop (84.3% fraud); Web2 portals (Snappt/Zillow) still centralize raw bank PDFs, violate GDPR minimization, and charge renters $35–$50 per single listing.",
      "$0 Forever for Landlords & Brokers: walletless off-chain verifier removes adoption friction and eliminates GDPR PDF storage liability.",
      "$1.99 / 30-Day Reusable Tenant Pass (First Pass Free): covers Plaid/Tink Open Banking attestation cost once and replaces $35–$50 per-application fees across 20+ listings, plus B2B Portal API for co-living marketplaces.",
    ],
  },
  {
    num: "08",
    tag: "Team, Grant Ask & Wave 4–5 Roadmap",
    title: "Solo Full-Stack ZK Builder · Clear Pilot Ask · Production Midnight Preprod Path.",
    points: [
      "Builder: Independent Web3 & full-stack product builder (@Szoool · github.com/ixroo) shipping end-to-end Compact smart contracts, automated CI/runtime test suites, and consumer-grade Next.js interfaces.",
      "Wave 3 / Wave 4 Grant Ask: Funding covers Plaid/Tink EU Open Banking sandbox & production webhook infrastructure, Midnight Preprod testnet deployment with Lace Wallet + Proof Server, and onboarding 3–5 independent co-living/letting agency pilot partners.",
      "Shipped Today (Wave 3): Hardened Compact 0.36.1 contract compiled & executed on Ubuntu Linux CI (contracts/witnesses.ts + @midnight-ntwrk/compact-runtime), 17 adversarial tests, Lace Wallet DApp Connector + Walletless /verify pass.",
    ],
  },
];

export default function PitchDeckPage() {
  return (
    <>
      <header className="site-header no-print">
        <div className="site-header-inner">
          <Link href="/" className="brand-lockup">
            <span className="brand-mark" aria-hidden="true">
              <ShieldCheck size={18} />
            </span>
            <span>LeaseProof</span>
            <span className="nav-divider">|</span>
            <span className="nav-sub">8-Slide Pitch Deck</span>
          </Link>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
            <Link href="/app" className="btn-ghost">
              <ArrowLeft size={14} />
              <span className="hide-xs">Open Workspace</span>
              <span className="show-xs">App</span>
            </Link>
            <button type="button" className="btn-primary" onClick={() => window.print()}>
              <Printer size={15} />
              <span className="hide-xs">Print / Save PDF</span>
              <span className="show-xs">Print</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container" style={{ padding: "32px 20px 72px", display: "grid", gap: 22 }}>
        {SLIDES.map((s) => (
          <article
            key={s.num}
            className="card"
            style={{
              padding: "clamp(20px, 4vw, 38px)",
              pageBreakAfter: "always",
              borderColor: "var(--border-strong)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 10,
                marginBottom: 14,
              }}
            >
              <span className="badge badge-violet">{s.tag}</span>
              <span
                className="mono"
                style={{ fontSize: 12.5, color: "var(--muted)", whiteSpace: "nowrap", flexShrink: 0 }}
              >
                SLIDE {s.num} / 08
              </span>
            </div>
            <h2 className="display-md" style={{ marginBottom: 18 }}>
              {s.title}
            </h2>
            <ul
              style={{
                margin: 0,
                paddingLeft: 20,
                display: "grid",
                gap: 12,
                fontSize: 15.5,
                color: "var(--muted)",
                lineHeight: 1.6,
              }}
            >
              {s.points.map((pt) => (
                <li key={pt} style={{ color: "var(--text)" }}>
                  {pt}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </main>
    </>
  );
}
