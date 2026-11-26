"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  EyeOff,
  Fingerprint,
  ShieldCheck,
  XCircle,
} from "lucide-react";

function VerifyPassContent() {
  const params = useSearchParams();
  const [inspectOpen, setInspectOpen] = useState(false);

  const rawReceipt = params.get("receipt");
  const isSampleMode = !rawReceipt || rawReceipt.endsWith("demo");
  const receipt = rawReceipt ?? "0x7f3a9e8b21c4a09d...sample-preview";
  const listing = params.get("listing") ?? "SoHo Lofts, Unit 4B ($2,400/mo)";
  const issuer = params.get("issuer") ?? "Argyle Verified Payroll";
  const applicant = params.get("applicant") ?? "0x4e8c91a3...kyc-bound";
  const status = params.get("status") ?? "1";
  const isQualified = status === "1";
  const isExpired = status === "3";

  const milestones = [
    { label: "Bank attested", done: true },
    { label: "ZK proof valid", done: true },
    { label: isQualified ? "Pass active" : isExpired ? "Window ended" : "Revoked", done: isQualified },
    { label: "14-day expiry", done: isQualified },
  ];

  return (
    <>
      <header className="site-header">
        <div className="site-header-inner">
          <Link href="/" className="brand-lockup">
            <span className="brand-mark" aria-hidden="true">
              <ShieldCheck size={17} strokeWidth={2.4} />
            </span>
            <span>LeaseProof</span>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <Link href="/app?tab=landlord" className="btn-secondary btn-sm">
              <span className="hide-sm">Landlord desk</span>
              <span className="show-sm">Verifier</span>
            </Link>
            <Link href="/app" className="btn-primary btn-sm">
              <span className="hide-sm">Open workspace</span>
              <span className="show-sm">App</span>
            </Link>
          </div>
        </div>
      </header>

      <main style={{ minHeight: "calc(100svh - 66px)", display: "grid", placeItems: "center", padding: "36px 20px 64px" }}>
        <div style={{ width: "100%", maxWidth: 600, display: "grid", gap: 16 }}>
          {isSampleMode && (
            <div
              role="note"
              style={{
                borderRadius: 12,
                padding: "14px 16px",
                background: "var(--ochre-soft)",
                border: "1px solid var(--ochre-border)",
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                fontSize: 13.5,
                lineHeight: 1.5,
              }}
            >
              <AlertTriangle size={18} color="var(--ochre)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong style={{ color: "var(--ochre)", display: "block", marginBottom: 2 }}>
                  Sample Preview Mode
                </strong>
                <span style={{ color: "var(--ink-secondary)" }}>
                  This is an example Viewing Pass preview, not a live tenant check. Issue a pass in
                  the Workspace to test a real shareable verification link.
                </span>
              </div>
            </div>
          )}

          {/* Physical Architectural Viewing Pass (Scrolltide Night-Window / Transit Ticket aesthetic) */}
          <div className="viewing-pass">
            <div className="viewing-pass-head">
              <div>
                <div style={{ fontSize: 12.5, color: "var(--ink-muted)", marginBottom: 4 }}>
                  Walletless Midnight Viewing Pass
                </div>
                <h1 className="display-sub" style={{ fontSize: 24 }}>
                  {listing}
                </h1>
              </div>

              <span
                className={`status-tag ${
                  isSampleMode
                    ? "status-warn"
                    : isQualified
                      ? "status-teal"
                      : isExpired
                        ? "status-warn"
                        : "status-danger"
                }`}
              >
                {isSampleMode ? (
                  <>
                    <AlertTriangle size={13} /> Sample preview
                  </>
                ) : isQualified ? (
                  <>
                    <CheckCircle2 size={13} /> Verified qualified
                  </>
                ) : isExpired ? (
                  <>
                    <Clock size={13} /> Pass expired (14d)
                  </>
                ) : (
                  <>
                    <XCircle size={13} /> Revoked by tenant
                  </>
                )}
              </span>
            </div>

            {/* 4-Step Verification Milestone Rail */}
            <div
              style={{
                padding: "0 24px 20px",
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                gap: 8,
              }}
              className="verify-rail"
            >
              {milestones.map((m) => (
                <div key={m.label} style={{ display: "grid", gap: 6 }}>
                  <div
                    style={{
                      height: 3,
                      borderRadius: 999,
                      background: m.done ? "var(--teal)" : "var(--rule-strong)",
                    }}
                  />
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: m.done ? "var(--ink)" : "var(--ink-muted)" }}>
                    {m.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="viewing-pass-tear" />

            <div className="viewing-pass-body" style={{ display: "grid", gap: 16 }}>
              <p style={{ margin: 0, fontSize: 14.5, color: "var(--ink-secondary)", lineHeight: 1.55 }}>
                Issuer-anchored qualification confirmed by{" "}
                <strong style={{ color: "var(--ink)" }}>{issuer}</strong>. Strictly bound to this
                listing and applicant without exposing exact salary, balance, or bank PDFs.
              </p>

              {/* Consistent Stacked Proof Metadata */}
              <div style={{ borderTop: "1px solid var(--rule)", paddingTop: 14, display: "grid", gap: 14 }}>
                <div>
                  <div style={{ fontSize: 12, color: "var(--ink-muted)", marginBottom: 3 }}>
                    Midnight Receipt ID (listing-bound)
                  </div>
                  <strong className="mono" style={{ fontSize: 13, color: "var(--ink)", wordBreak: "break-all" }}>
                    {receipt}
                  </strong>
                </div>

                <div style={{ borderTop: "1px solid var(--rule)", paddingTop: 12 }}>
                  <div style={{ fontSize: 12, color: "var(--ink-muted)", display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                    <Fingerprint size={13} color="var(--teal)" /> Applicant identity binding
                  </div>
                  <strong className="mono" style={{ fontSize: 13, color: "var(--ink)", wordBreak: "break-all" }}>
                    {applicant}
                  </strong>
                </div>

                <div style={{ borderTop: "1px solid var(--rule)", paddingTop: 12 }}>
                  <div style={{ fontSize: 12, color: "var(--ink-muted)", display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                    <EyeOff size={13} color="var(--teal)" /> Privacy disclosure guarantee
                  </div>
                  <strong style={{ fontSize: 14, color: "var(--teal)" }}>
                    Zero raw values disclosed (threshold-only proof)
                  </strong>
                </div>
              </div>

              {/* Expandable Blueprint Cryptographic Proof Inspector */}
              <div style={{ borderTop: "1px solid var(--rule)", paddingTop: 14 }}>
                <button
                  type="button"
                  onClick={() => setInspectOpen((o) => !o)}
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "var(--paper)",
                    border: "1px solid var(--rule)",
                    borderRadius: 8,
                    padding: "10px 14px",
                    fontFamily: "var(--font-body)",
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: "var(--ink)",
                    cursor: "pointer",
                  }}
                >
                  <span>Inspect Midnight Blueprint proof schema</span>
                  {inspectOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {inspectOpen && (
                  <div
                    className="mono"
                    style={{
                      marginTop: 10,
                      borderRadius: 10,
                      padding: 16,
                      background: "#0d1b2a",
                      color: "#cbd5e1",
                      fontSize: 12,
                      display: "grid",
                      gap: 7,
                    }}
                  >
                    <div style={{ color: "#5eead4" }}>contract: contracts/leaseproof.compact (Compact 0.36.1)</div>
                    <div>verificationMode: off-chain public ledger read (zero wallet)</div>
                    <div>antiForwarding: receiptListingId == expectedListingId</div>
                    <div>antiReplay: windowed nullifier bound to applicantIdCommit</div>
                    <div>revocation: tenant-only via revokeReceipt(receiptId)</div>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", paddingTop: 4 }}>
                <Link href="/app" className="btn-primary">
                  Open full ZK workspace
                </Link>
                <Link href="/" className="btn-secondary">
                  <ArrowLeft size={14} /> Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        @media (max-width: 560px) {
          .verify-rail {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
      `}</style>
    </>
  );
}

export default function VerifyPassPage() {
  return (
    <Suspense fallback={<div style={{ padding: 48, color: "var(--ink-muted)" }}>Verifying pass...</div>}>
      <VerifyPassContent />
    </Suspense>
  );
}
