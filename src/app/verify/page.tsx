"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, EyeOff, ShieldCheck, XCircle } from "lucide-react";

function VerifyPassContent() {
  const params = useSearchParams();
  const receipt = params.get("receipt") ?? "0x7f3a9e8b21c4...demo";
  const listing = params.get("listing") ?? "SoHo Lofts · 1BR Apartment ($2,400/mo)";
  const issuer = params.get("issuer") ?? "Argyle Verified Payroll";
  const status = params.get("status") ?? "1";
  const isQualified = status === "1";

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div
        className="card reveal"
        style={{
          width: "100%",
          maxWidth: 560,
          borderColor: isQualified ? "rgba(16, 185, 129, 0.45)" : "rgba(239, 68, 68, 0.45)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <Link href="/" className="brand-lockup" style={{ fontSize: 16 }}>
            <span className="brand-mark" aria-hidden="true">
              <ShieldCheck size={16} />
            </span>
            <span>LeaseProof Pass</span>
          </Link>
          <span className={`badge ${isQualified ? "badge-ok" : "badge-danger"}`}>
            {isQualified ? (
              <>
                <CheckCircle2 size={13} /> VERIFIED QUALIFIED
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
          Walletless Midnight ZK Verification Pass. Cryptographic proof confirmed by{" "}
          <strong style={{ color: "var(--text)" }}>{issuer}</strong> without disclosing tenant
          salary, bank balance, or ID documents.
        </p>

        <div className="card-subtle" style={{ display: "grid", gap: 10, fontSize: 13, marginBottom: 18 }}>
          <div>
            <span style={{ color: "var(--muted)", display: "block", fontSize: 11.5 }}>
              Midnight Receipt ID
            </span>
            <strong className="mono" style={{ color: "var(--cyan)", wordBreak: "break-all" }}>
              {receipt}
            </strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: 8 }}>
            <span style={{ color: "var(--muted)" }}>Exposed Salary / Balance / ID</span>
            <strong style={{ color: "var(--green)", display: "inline-flex", alignItems: "center", gap: 5 }}>
              <EyeOff size={14} /> 0 Bits Leaked
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
