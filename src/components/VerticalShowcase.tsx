"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Car, CheckCircle2, Laptop } from "lucide-react";

type VerticalKey = "apartment" | "freelancer" | "vehicle";

const VERTICALS: Record<
  VerticalKey,
  {
    tab: string;
    heading: string;
    summary: string;
    requirement: string;
    currency: string;
    attester: string;
    sampleUnit: string;
    passBadge: string;
    privateHidden: string;
  }
> = {
  apartment: {
    tab: "Apartment & House",
    heading: "Standard salaried apartment viewings",
    summary:
      "Confirm you clear the 3x monthly rent and 2x deposit requirement before touring—without attaching payroll PDFs to twenty broker threads.",
    requirement: "Monthly income >= 3x rent and liquid savings >= 2x deposit",
    currency: "USD (ISO-4217 840)",
    attester: "Argyle Verified Payroll",
    sampleUnit: "SoHo Lofts, 1BR ($2,400/mo)",
    passBadge: "Income + Deposit verified",
    privateHidden: "Exact $9,500/mo salary, employer name, and full checking balance",
  },
  freelancer: {
    tab: "Freelancer Runway",
    heading: "Remote workers & founders with zero corporate payslip",
    summary:
      "Traditional brokers reject self-employed renters who lack W-2 pay stubs. LeaseProof proves 6+ months of liquid rent runway in the listing's exact currency.",
    requirement: "Liquid savings >= 6x monthly rent (no payslip required)",
    currency: "EUR (ISO-4217 978)",
    attester: "Tink Open Banking (EU)",
    sampleUnit: "Nomad House Lisbon (€1,600/mo)",
    passBadge: "6-month runway verified",
    privateHidden: "Total bank balance, client invoices, and spending transactions",
  },
  vehicle: {
    tab: "Vehicle & Equipment",
    heading: "EV subscriptions and commercial equipment leases",
    summary:
      "Lock affordability verification to one specific vehicle or asset listing with anti-straw-applicant identity binding and automatic 14-day expiry.",
    requirement: "Monthly income >= 4x lease payment and deposit >= 3x",
    currency: "EUR (ISO-4217 978)",
    attester: "Plaid Open Banking",
    sampleUnit: "Polestar 2 Mobility Lease (€690/mo)",
    passBadge: "Lease threshold verified",
    privateHidden: "Full credit history, payroll stub, and unrelated bank accounts",
  },
};

export function VerticalShowcase() {
  const [active, setActive] = useState<VerticalKey>("apartment");
  const item = VERTICALS[active];

  return (
    <div style={{ display: "grid", gap: 28 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <div style={{ maxWidth: 620 }}>
          <h2 className="display-section" style={{ marginBottom: 10 }}>
            One contract for salaried renters, freelancers, and mobility leases.
          </h2>
          <p className="lead-copy">
            Every Viewing Pass is locked to one listing, matched to its exact currency, and expires
            automatically after 14 days.
          </p>
        </div>

        <div className="segmented-track" role="tablist" aria-label="Rental vertical selector">
          <button
            type="button"
            role="tab"
            aria-selected={active === "apartment"}
            className={`segmented-btn ${active === "apartment" ? "is-active" : ""}`}
            onClick={() => setActive("apartment")}
          >
            <Building2 size={15} /> Apartment &amp; House
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={active === "freelancer"}
            className={`segmented-btn ${active === "freelancer" ? "is-active" : ""}`}
            onClick={() => setActive("freelancer")}
          >
            <Laptop size={15} /> Freelancer Runway
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={active === "vehicle"}
            className={`segmented-btn ${active === "vehicle" ? "is-active" : ""}`}
            onClick={() => setActive("vehicle")}
          >
            <Car size={15} /> Vehicle &amp; Equipment
          </button>
        </div>
      </div>

      {/* Single Calm Architectural Stage (Replaces generic 3 equal boxes!) */}
      <div className="sheet">
        <div className="grid-2" style={{ gap: 36, alignItems: "center" }}>
          <div style={{ display: "grid", gap: 16 }}>
            <h3 className="display-sub">{item.heading}</h3>
            <p className="prose" style={{ margin: 0, color: "var(--ink-secondary)", fontSize: 15.5 }}>
              {item.summary}
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", paddingTop: 4 }}>
              <Link href="/app" className="btn-primary">
                Try this preset in Workspace
              </Link>
              <Link href="/app?tab=landlord" className="btn-secondary">
                Inspect verifier view
              </Link>
            </div>
          </div>

          <div style={{ borderLeft: "1px solid var(--rule)", paddingLeft: 28 }} className="vertical-spec-col">
            <div className="ledger-row">
              <span style={{ fontSize: 13.5, color: "var(--ink-muted)" }}>Example listing</span>
              <strong style={{ fontSize: 14.5, textAlign: "right" }}>{item.sampleUnit}</strong>
            </div>
            <div className="ledger-row">
              <span style={{ fontSize: 13.5, color: "var(--ink-muted)" }}>Circuit check</span>
              <strong style={{ fontSize: 14, textAlign: "right", color: "var(--teal)" }}>
                {item.requirement}
              </strong>
            </div>
            <div className="ledger-row">
              <span style={{ fontSize: 13.5, color: "var(--ink-muted)" }}>Verified source</span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{item.attester}</span>
            </div>
            <div className="ledger-row">
              <span style={{ fontSize: 13.5, color: "var(--ink-muted)" }}>Currency parity</span>
              <span className="mono" style={{ fontSize: 13 }}>{item.currency}</span>
            </div>
            <div className="ledger-row">
              <span style={{ fontSize: 13.5, color: "var(--ink-muted)" }}>Stays private locally</span>
              <span style={{ fontSize: 13.5, color: "var(--ink-secondary)", textAlign: "right", maxWidth: 260 }}>
                {item.privateHidden}
              </span>
            </div>
            <div className="ledger-row">
              <span style={{ fontSize: 13.5, color: "var(--ink-muted)" }}>Public pass output</span>
              <span className="status-tag status-teal">
                <CheckCircle2 size={13} /> {item.passBadge}
              </span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 760px) {
          .vertical-spec-col {
            border-left: 0 !important;
            border-top: 1px solid var(--rule);
            padding-left: 0 !important;
            padding-top: 20px;
          }
        }
      `}</style>
    </div>
  );
}
