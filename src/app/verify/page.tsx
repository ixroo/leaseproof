"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, EyeOff, Fingerprint, ShieldCheck, XCircle } from "lucide-react";

function VerifyPassContent() {
  const params = useSearchParams();
  const receipt = params.get("receipt") ?? "0x7f3a9e8b21c4...demo";
  const listing = params.get("listing") ?? "SoHo Lofts · 1BR Apartment ($2,400/mo)";
  const issuer = params.get("issuer") ?? "Argyle Verified Payroll";
  const applicant = params.get("applicant") ?? "0x4e8c91a3...kyc-bound";
  const status = params.get("status") ?? "1";
  const isQualified = status === "1";
  const isExpired = status === "3";

  const borderColor = isQualified
    ? "rgba(16, 185, 129, 0.45)"
    : isExpired
      ? "rgba(245, 158, 11, 0.45)"
      : "rgba(239, 68, 68, 0.45)";

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div
        className="card reveal"
        style={{
          width: "100%",
          maxWidth: 580,
          borderColor,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, gap: 10, flexWrap: "wrap" }}>
          <Link href="/" className="brand-lockup" style={{ fontSize: 16 }}>
            <span className="brand-mark" aria-hidden="true">
              <ShieldCheck size={16} />
            </span>
            <span>LeaseProof Viewing Pass</span>
          </Link>
          <span className={`badge ${isQualified ? "badge-ok" : isExpired ? "badge-warn" : "badge-danger"}`}>
            {isQualified ? (
              <>
                <CheckCircle2 size={13} /> VERIFIED QUALIFIED
              </>
            ) : isExpired ? (
              <>
                <Clock size={13} /> PASS EXPIRED (14D)
              </>
            ) : (
              <>
                <XCircle size={13} /> REVOKED BY TENANT
              </>
            )}
          </span>
        </div>

        <h1 style={{ margin: "0 0 8px", fontSize: 22 }}>{listing}</h1>
        <p style={{ margin: "0 0 18px", fontSize: 13.5, color: "var(--muted)", lineHeight: 1.55 }}>
          Walletless Off-Chain Midnight Ledger Verification Pass. Issuer-anchored attestation
          confirmed by <strong style={{ color: "var(--text)" }}>{issuer}</strong>—bound strictly to
          this listing and applicant identity without exposing raw salary, balance, or bank PDFs.
        </p>

        <div className="card-subtle" style={{ display: "grid", gap: 10, fontSize: 13, marginBottom: 18 }}>
          <div>
            <span style={{ color: "var(--muted)", display: "block", fontSize: 11.5 }}>
              Midnight Receipt ID (Listing-Bound)
            </span>
            <strong className="mono" style={{ color: "var(--cyan)", wordBreak: "break-all" }}>
              {receipt}
            </strong>
          </div>
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 8 }}>
            <span style={{ color: "var(--muted)", display: "flex", alignItems: "center", gap: 5, fontSize: 11.5 }}>
              <Fingerprint size={12} color="#7c5cff" /> Anti-Straw-Applicant KYC Binding Commit
            </span>
            <strong className="mono" style={{ color: "var(--text)", wordBreak: "break-all", fontSize: 12 }}>
              {applicant}
            </strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: 8, gap: 10, flexWrap: "wrap" }}>
            <span style={{ color: "var(--muted)" }}>Privacy Disclosure Model</span>
            <strong style={{ color: "var(--green)", display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5 }}>
              <EyeOff size={14} /> Zero Raw Values Disclosed (Threshold-Only Proof)
            </strong>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/app" className="btn-primary">
            Open Full ZK Workspace
          </Link>
          <Link href="/" className="btn-ghost">
            <ArrowLeft size={14} /> Home
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function VerifyPassPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, color: "#98a2b8" }}>Verifying pass...</div>}>
      <VerifyPassContent />
    </Suspense>
  );
}
