"use client";

import Link from "next/link";
import { ArrowLeft, Printer, ShieldCheck } from "lucide-react";

const SLIDES = [
  {
    num: "01",
    tag: "LeaseProof · AKINDO × Midnight Wave 3",
    title: "Prove you qualify to rent—without handing landlords your bank statements, payslips, or ID.",
    points: [
      "Privacy-first rental & lease qualification built natively on Midnight Compact smart contracts.",
      "Walletless verification for landlords; 0 bits of salary, balance, or identity disclosed on-chain.",
      "Open-source under Apache-2.0 with GitHub Actions Linux Compact compilation & 17 automated unit/adversarial tests.",
    ],
  },
  {
    num: "02",
    tag: "The Real-World Crisis (NMHC & Snappt Data)",
    title: "93.3% of landlords face application fraud—while honest renters leak bank PDFs over WhatsApp.",
    points: [
      "84.3% of rental fraud comes from Photoshopped or AI-generated pay stubs and bank statements (NMHC Pulse Survey).",
      "6.4%–12.5% of 14M+ analyzed rental applications contained doctored income documents (Snappt), driving $4.2M/yr bad debt per large operator.",
      "Meanwhile, EU GDPR Art. 5(1)(c) forbids excessive personal financial data collection when a binary check suffices.",
    ],
  },
  {
    num: "03",
    tag: "Why Midnight Dual-Ledger ZK Is Required",
    title: "Public chains expose finances. PDFs are easily forged. Midnight solves both simultaneously.",
    points: [
      "Private Witnesses (Local): monthlyIncomeUsd, liquidBalanceUsd, tenantSecret, attestationNonce never leave the user's device.",
      "Compact ZK Circuits: verify issuer registry membership, attestation freshness, commitment integrity, and exact rent/deposit thresholds.",
      "Public Ledger Output: discloses ONLY a listing-scoped nullifier, receiptId, and binary QUALIFIED / REVOKED verdict.",
    ],
  },
  {
    num: "04",
    tag: "One Compact Contract · Three Real-World Templates",
    title: "Serving salaried tenants, freelancers without payslips, and vehicle/asset leases.",
    points: [
      "Mode 0 — Apartment / House Lease: proves monthly income >= 3x rent AND liquid balance >= 2x deposit.",
      "Mode 1 — Freelancer & Co-Living Runway: proves liquid savings >= 6x rent with $0 corporate payslip required.",
      "Mode 0 — Vehicle / Equipment Lease: instant affordability verification for EV subscriptions and equipment rentals.",
    ],
  },
  {
    num: "05",
    tag: "Engineering & Security (contracts/leaseproof.compact)",
    title: "7 Exported Compact Circuits + 8 Rejected Adversarial Attacks.",
    points: [
      "Circuits: registerIssuer, revokeIssuer, createListing, submitQualificationProof, revokeReceipt, verifyReceipt + pure hash helpers.",
      "Tenant-Controlled Revocation: unlike non-revocable off-chain bundles, tenants can call revokeReceipt() anytime if they choose another unit.",
      "8 Adversarial Tests Verified: INSUFFICIENT_INCOME, INSUFFICIENT_BALANCE, UNTRUSTED_ISSUER, REVOKED_ISSUER, REPLAY_ATTACK, EXPIRED_ATTESTATION, TAMPERED_COMMITMENT, UNAUTHORIZED_REVOKE.",
    ],
  },
  {
    num: "06",
    tag: "Zero Friction UX (Walletless Verifier)",
    title: "3-Role Interactive Workspace + Split-Screen Privacy Inspector.",
    points: [
      "Tenant Proof Studio: 1-click realistic personas, instant pass generation, live 'Anyone Can See vs. Nobody Can See' audit, and 1-click Revoke Pass.",
      "Landlord Verifier: zero wallet required—paste any Receipt ID or open /verify link for 3-second cryptographic certainty.",
      "Attack & Attester Lab: judges can trigger all 8 fraud attacks in 1 click without waiting behind gated tutorials.",
    ],
  },
  {
    num: "07",
    tag: "Business Viability & Real-World Attesters",
    title: "Sits on top of existing Open Banking & Payroll APIs (Plaid, Tink, Argyle, Finch).",
    points: [
      "Free ($0) for Tenants: drives rapid organic adoption across renters, freelancers, and expats.",
      "$2 / Verified Pass for Landlords & Agencies: 10x cheaper than $15–$50 manual PDF screening, eliminating fraud and GDPR breach liability.",
      "Enterprise SDK: embedded ZK qualification widget for rental portals and co-living networks.",
    ],
  },
  {
    num: "08",
    tag: "Roadmap & Midnight Ecosystem Attribution",
    title: "From Wave 3 Working MVP to Production Open-Banking ZK Rails.",
    points: [
      "Wave 3 (Shipped): Compiling Compact contract on Ubuntu CI, 17 automated unit & adversarial tests, 3-role web workspace, walletless /verify pass.",
      "Next Milestone 1: Deploy contracts/leaseproof.compact to Midnight Preprod with Lace wallet + Plaid/Tink sandbox webhook attester.",
      "Next Milestone 2: Multi-tenant co-signer aggregation circuit (combined household income proof without revealing individual salaries).",
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
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/app" className="btn-ghost">
              <ArrowLeft size={14} /> Open Workspace
            </Link>
            <button type="button" className="btn-primary" onClick={() => window.print()}>
              <Printer size={15} /> Print / Save PDF
            </button>
          </div>
        </div>
      </header>

      <main className="container" style={{ padding: "36px 24px 72px", display: "grid", gap: 22 }}>
        {SLIDES.map((s) => (
          <article
            key={s.num}
            className="card"
            style={{
              padding: "36px 38px",
              pageBreakAfter: "always",
              borderColor: "var(--border-strong)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span className="badge badge-violet">{s.tag}</span>
              <span className="mono" style={{ fontSize: 13, color: "var(--muted)" }}>
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
