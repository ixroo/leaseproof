"use client";

import Link from "next/link";
import { ArrowLeft, Printer, ShieldCheck } from "lucide-react";

const SLIDES = [
  {
    num: "01",
    theme: "dark" as const,
    tag: "LeaseProof · Midnight Wave 3",
    title: "Qualify for apartment viewings without sending bank PDFs to twenty brokers.",
    points: [
      "Privacy-first Rental Pre-Qualification & Viewing Pass built on hardened Midnight Compact 0.36.1 smart contracts.",
      "Walletless off-chain verification for landlords; threshold-only proofs keep exact salary, balance, and PDFs sealed locally.",
      "Apache-2.0 open-source with Ubuntu Linux CI compiling 7 circuits + executing contracts/witnesses.ts directly on @midnight-ntwrk/compact-runtime@0.21.0.",
    ],
  },
  {
    num: "02",
    theme: "light" as const,
    tag: "The Real-World Crisis (NMHC & Snappt)",
    title: "93.3% of landlords face application fraud while honest renters leak bank PDFs over WhatsApp.",
    points: [
      "84.3% of rental fraud comes from Photoshopped or AI-generated pay stubs and bank statements (NMHC Pulse Survey).",
      "6.4%–12.5% of 14M+ analyzed rental applications contained doctored income documents (Snappt).",
      "LeaseProof targets the high-leakage Pre-Qualification & Viewing stage (replacing 20x PDF spraying); final lease signing still uses standard legal ID & eviction checks.",
    ],
  },
  {
    num: "03",
    theme: "dark" as const,
    tag: "Midnight Dual-Ledger Architecture",
    title: "Public chains expose finances. PDFs are easily forged. Midnight solves both simultaneously.",
    points: [
      "Private Witnesses (contracts/witnesses.ts — local only): monthlyIncomeUsd, liquidBalanceUsd, attestationCurrency, tenantSecret, and attestationNonce never leave the device.",
      "Hardened Compact Circuit: verifies issuer-anchored attestation on-ledger, ISO-4217 currency parity, monotonic ledger epoch, anti-straw-applicant KYC binding, and exact thresholds.",
      "Public Ledger Output: discloses ONLY a windowed listingNullifier, listing-bound receiptId, applicantIdCommit, and status (QUALIFIED / REVOKED / EXPIRED).",
    ],
  },
  {
    num: "04",
    theme: "light" as const,
    tag: "1 Flexible Contract · 2 Modes · 3 Rental Verticals",
    title: "One parameterized Compact contract serving salaried tenants, freelancers, and mobility leases.",
    points: [
      "Mode 0 — Apartment & House Viewing: proves monthly income >= 3x rent AND liquid deposit >= 2x rent in matching ISO-4217 currency.",
      "Mode 1 — Freelancer & Co-Living Runway: proves liquid savings >= 6x rent with $0 corporate payslip required.",
      "Mode 0 — Vehicle & Equipment Lease: instant affordability pre-qualification with anti-forward listing binding.",
    ],
  },
  {
    num: "05",
    theme: "dark" as const,
    tag: "Hardened Security & Real Runtime Execution",
    title: "Admin-gated registry, issuer-anchored attestations & 12 rejected attack vectors.",
    points: [
      "Eliminates local re-hash bypass: attesters call anchorAttestation() using their authenticated issuer key; local salary edits fail TAMPERED_COMMITMENT.",
      "Eliminates cross-listing forwarding & straw applicants: every receipt is bound to (listingId, applicantIdCommit, 14-day expiry) and read off-chain without a wallet.",
      "Verified Green in Ubuntu Linux CI Run #10: compact compile (7 circuits) + npm run test:compact (real compiled artifact) + 17 Vitest adversarial tests.",
    ],
  },
  {
    num: "06",
    theme: "light" as const,
    tag: "Zero-Friction Consumer UX",
    title: "Midnight Lace Wallet DApp Connector paired with Walletless Landlord Verification.",
    points: [
      "Tenant Studio: Connect Midnight Lace (window.midnight.mnLace) or run instant transparent 1:1 browser sandbox with 1-click personas and Cairn dot-matrix proof feedback.",
      "Landlord Verifier (Walletless): reads public ledger off-chain—zero wallet, zero signup; flags QUALIFIED, REVOKED, EXPIRED (14d), and LISTING_MISMATCH.",
      "8-Attack Red-Team Lab: judges trigger all 8 cryptographic attacks in 1 click plus Simulate +15 Days to inspect automatic expiry & next-window re-apply.",
    ],
  },
  {
    num: "07",
    theme: "dark" as const,
    tag: "Why Web2 Substitutes Fail & Unit Economics",
    title: "Why Web2 screening fails both sides—and how LeaseProof gets paid.",
    points: [
      "Why Web2 Fails: WhatsApp PDFs are trivial to Photoshop (84.3% fraud); Web2 portals (Snappt/Zillow) still centralize raw bank PDFs, violate GDPR Art. 5(1)(c), and charge renters $35–$50 per single listing.",
      "$0 Forever for Landlords & Brokers: walletless off-chain verifier removes adoption friction and eliminates GDPR PDF storage liability.",
      "$1.99 / 30-Day Reusable Tenant Pass (First Pass Free): covers Plaid/Tink Open Banking attestation cost once and replaces $35–$50 per-listing fees across 20+ apartments, plus B2B Portal API.",
    ],
  },
  {
    num: "08",
    theme: "light" as const,
    tag: "Team, Grant Ask & Wave 4–5 Roadmap",
    title: "Solo full-stack ZK builder · Clear pilot ask · Midnight Preprod path.",
    points: [
      "Builder: Independent Web3 & full-stack product builder (@Szoool · github.com/ixroo) shipping end-to-end Compact smart contracts, CI runtime test suites, and consumer-grade Next.js apps.",
      "Wave 3 / Wave 4 Grant Ask: Funding covers Plaid/Tink EU Open Banking webhook infrastructure, live Midnight Preprod deployment with Lace Wallet + Proof Server, and onboarding 3–5 co-living / agency pilot partners.",
      "Live Today: https://leaseproof-one.vercel.app · Apache-2.0 repo github.com/ixroo/leaseproof (topic midnightntwrk) · 1080p Launch Film youtu.be/ElK-rK5Qaco.",
    ],
  },
];

export default function PitchDeckPage() {
  return (
    <>
      <header className="site-header-noir no-print">
        <div className="site-header-inner">
          <Link href="/" className="brand-lockup" style={{ color: "var(--bone)" }}>
            <span
              className="brand-mark"
              aria-hidden="true"
              style={{
                background: "linear-gradient(135deg, #f4f4f0, #a8b0ba)",
                color: "#0e1014",
              }}
            >
              <ShieldCheck size={17} strokeWidth={2.4} />
            </span>
            <span>LeaseProof</span>
            <span className="hide-sm" style={{ color: "var(--bone-muted)", fontWeight: 500, fontSize: 14 }}>
              Pitch deck
            </span>
          </Link>

          <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
            <Link href="/app" className="btn-noir-ghost" style={{ minHeight: 38, padding: "0 13px", fontSize: 13.5 }}>
              <ArrowLeft size={14} />
              <span className="hide-sm">Open workspace</span>
              <span className="show-sm">App</span>
            </Link>
            <button
              type="button"
              className="btn-liquid-glass"
              style={{ minHeight: 38, padding: "0 14px", fontSize: 13.5 }}
              onClick={() => window.print()}
            >
              <Printer size={14} />
              <span className="hide-sm">Print / Save PDF</span>
              <span className="show-sm">Print</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container" style={{ padding: "36px 24px 80px", display: "grid", gap: 24 }}>
        {SLIDES.map((s) => {
          const dark = s.theme === "dark";
          return (
            <article
              key={s.num}
              style={{
                background: dark ? "var(--obsidian)" : "var(--surface)",
                color: dark ? "var(--bone)" : "var(--ink)",
                border: `1px solid ${dark ? "var(--obsidian-border)" : "var(--rule-strong)"}`,
                borderRadius: 20,
                padding: "clamp(24px, 4vw, 44px)",
                boxShadow: dark ? "0 24px 60px -20px rgba(0,0,0,0.45)" : "var(--shadow-sheet)",
                pageBreakAfter: "always",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 10,
                  marginBottom: 18,
                  paddingBottom: 14,
                  borderBottom: `1px solid ${dark ? "var(--obsidian-border)" : "var(--rule)"}`,
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: dark ? "#5eead4" : "var(--teal)",
                  }}
                >
                  {s.tag}
                </span>
                <span
                  className="mono tabular"
                  style={{
                    fontSize: 12.5,
                    color: dark ? "var(--bone-muted)" : "var(--ink-muted)",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {s.num} / 08
                </span>
              </div>

              <h2
                className="display-section"
                style={{
                  color: dark ? "var(--bone)" : "var(--ink)",
                  marginBottom: 22,
                  fontSize: "clamp(24px, 2.8vw, 34px)",
                }}
              >
                {s.title}
              </h2>

              <ul
                style={{
                  margin: 0,
                  paddingLeft: 20,
                  display: "grid",
                  gap: 14,
                  fontSize: 15.5,
                  lineHeight: 1.62,
                  color: dark ? "#d4cfc9" : "var(--ink-secondary)",
                }}
              >
                {s.points.map((pt) => (
                  <li key={pt}>{pt}</li>
                ))}
              </ul>
            </article>
          );
        })}
      </main>
    </>
  );
}
