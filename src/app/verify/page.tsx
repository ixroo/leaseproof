"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  EyeOff,
  Fingerprint,
  ShieldCheck,
  XCircle,
} from "lucide-react";

function VerifyPassContent() {
  const params = useSearchParams();
  const rawReceipt = params.get("receipt");
  const isSampleMode = !rawReceipt || rawReceipt.endsWith("demo");
  const receipt = rawReceipt ?? "0x7f3a9e8b21c4...sample-preview";
  const listing = params.get("listing") ?? "SoHo Lofts · 1BR Apartment ($2,400/mo)";
  const issuer = params.get("issuer") ?? "Argyle Verified Payroll";
  const applicant = params.get("applicant") ?? "0x4e8c91a3...kyc-bound";
  const status = params.get("status") ?? "1";
  const isQualified = status === "1";
  const isExpired = status === "3";

  const borderColor = isSampleMode
    ? "rgba(245, 158, 11, 0.45)"
    : isQualified
      ? "rgba(16, 185, 129, 0.45)"
      : isExpired
        ? "rgba(245, 158, 11, 0.45)"
        : "rgba(239, 68, 68, 0.45)";

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 560, display: "grid", gap: 12 }}>
        {isSampleMode && (
          <div
            className="card-subtle"
            role="note"
            style={{
              borderColor: "rgba(245, 158, 11, 0.45)",
              background: "rgba(245, 158, 11, 0.08)",
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            <AlertTriangle size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong style={{ color: "#fcd34d", display: "block", marginBottom: 2 }}>
                Sample Preview Mode
              </strong>
              <span style={{ color: "var(--muted)" }}>
                This is an example Viewing Pass preview, not a live tenant verification. Generate a
                pass in the Workspace to inspect a real shareable link.
              </span>
            </div>
          </div>
        )}

        <div className="viewing-pass-card reveal" style={{ borderColor }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 18,
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <Link href="/" className="brand-lockup" style={{ fontSize: 16 }}>
              <span className="brand-mark" aria-hidden="true">
                <ShieldCheck size={16} />
              </span>
              <span>LeaseProof Pass</span>
            </Link>
            <span
              className={`badge ${
                isSampleMode
                  ? "badge-warn"
                  : isQualified
                    ? "badge-ok"
                    : isExpired
                      ? "badge-warn"
                      : "badge-danger"
              }`}
            >
              {isSampleMode ? (
                <>
                  <AlertTriangle size={13} /> SAMPLE PREVIEW
                </>
              ) : isQualified ? (
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
            Walletless Midnight Verification Pass confirmed by{" "}
            <strong style={{ color: "var(--text)" }}>{issuer}</strong>—locked strictly to this
            listing and applicant without exposing raw salary, bank balance, or PDFs.
          </p>

          {/* 100% Consistent Stacked Rows */}
          <div className="card-subtle" style={{ display: "grid", gap: 12, fontSize: 13, marginBottom: 18 }}>
            <div>
              <span style={{ color: "var(--muted)", display: "block", fontSize: 11.5, marginBottom: 3 }}>
                Midnight Receipt ID (Listing-Bound)
              </span>
              <strong className="mono" style={{ color: "var(--cyan)", wordBreak: "break-all" }}>
                {receipt}
              </strong>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10 }}>
              <span
                style={{
                  color: "var(--muted)",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 11.5,
                  marginBottom: 3,
                }}
              >
                <Fingerprint size={12} color="#7c5cff" /> Applicant Identity Binding
              </span>
              <strong className="mono" style={{ color: "var(--text)", wordBreak: "break-all", fontSize: 12.5 }}>
                {applicant}
              </strong>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10 }}>
              <span
                style={{
                  color: "var(--muted)",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 11.5,
                  marginBottom: 3,
                }}
              >
                <EyeOff size={12} color="#10b981" /> Privacy Disclosure Guarantee
              </span>
              <strong style={{ color: "var(--green)", fontSize: 13 }}>
                Zero Raw Values Disclosed (Threshold-Only Proof)
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
