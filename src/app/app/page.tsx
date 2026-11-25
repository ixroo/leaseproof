"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Copy,
  EyeOff,
  KeyRound,
  PlusCircle,
  Presentation,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  Sparkles,
  UserCheck,
  XCircle,
} from "lucide-react";
import {
  createSeededLeaseProofEngine,
  type CircuitExecutionResult,
  type LedgerSnapshot,
  type ListingMode,
  type PublicReceiptRecord,
  type TemplateType,
} from "@/lib/zk/leaseproofEngine";

type RoleTab = "tenant" | "landlord" | "attacks";

interface AttackLogEntry {
  id: string;
  label: string;
  expectedCode: string;
  actualCode: string;
  blocked: boolean;
  reason: string;
  timestamp: string;
}

const fmtUsd = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

const TEMPLATE_LABEL: Record<TemplateType, string> = {
  APARTMENT: "Apartment / House Lease",
  FREELANCER_COLIVING: "Freelancer / Co-Living Runway",
  VEHICLE_LEASE: "Vehicle / Equipment Lease",
};

export default function LeaseProofWorkspace() {
  const [engine, setEngine] = useState(() => createSeededLeaseProofEngine());
  const [snapshot, setSnapshot] = useState<LedgerSnapshot>(() => engine.getSnapshot());
  const [activeTab, setActiveTab] = useState<RoleTab>("tenant");
  const [attackSeq, setAttackSeq] = useState(1);

  // Tenant Proof Studio state
  const [selectedListingId, setSelectedListingId] = useState("apt-soho-204");
  const [selectedIssuerId, setSelectedIssuerId] = useState("argyle-payroll");
  const [tenantLabel, setTenantLabel] = useState("Maya (Senior Designer)");
  const [tenantSecret, setTenantSecret] = useState("tenant-secret-maya-2026");
  const [monthlyIncome, setMonthlyIncome] = useState(9500);
  const [liquidBalance, setLiquidBalance] = useState(18000);
  const [lastResult, setLastResult] = useState<CircuitExecutionResult | null>(null);
  const [activeReceiptId, setActiveReceiptId] = useState<string | null>(null);

  // Landlord Verifier state
  const [verifyInput, setVerifyInput] = useState("");
  const [verifiedLookup, setVerifiedLookup] = useState<{
    status: 0 | 1 | 2;
    receipt: PublicReceiptRecord | null;
  } | null>(null);
  const [newListingTitle, setNewListingTitle] = useState("Shibuya Loft · 1BR ($2,100/mo)");
  const [newListingLoc, setNewListingLoc] = useState("Tokyo, Japan");
  const [newListingMode, setNewListingMode] = useState<ListingMode>(0);
  const [newListingRent, setNewListingRent] = useState(2100);
  const [newListingMinIncome, setNewListingMinIncome] = useState(6300);
  const [newListingMinBalance, setNewListingMinBalance] = useState(4200);

  // Attack Lab state
  const [attackLogs, setAttackLogs] = useState<AttackLogEntry[]>([]);
  const [toast, setToast] = useState<{ tone: "ok" | "danger"; title: string; detail: string } | null>(null);

  const showToast = (tone: "ok" | "danger", title: string, detail: string) => {
    setToast({ tone, title, detail });
    setTimeout(() => {
      setToast((cur) => (cur?.title === title ? null : cur));
    }, 3600);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab === "landlord" || tab === "attacks" || tab === "tenant") {
      queueMicrotask(() => setActiveTab(tab));
    }
  }, []);

  const selectedListing =
    snapshot.listings.find((l) => l.id === selectedListingId) ?? snapshot.listings[0];

  const activeReceipt =
    snapshot.receipts.find((r) => r.receiptId === activeReceiptId) ??
    snapshot.receipts[0] ??
    null;

  const syncLedger = (target = engine) => setSnapshot(target.getSnapshot());

  const applyPersona = (kind: "salaried" | "freelancer" | "ev") => {
    const uniq = Math.random().toString(36).slice(2, 6);
    if (kind === "salaried") {
      setSelectedListingId("apt-soho-204");
      setSelectedIssuerId("argyle-payroll");
      setTenantLabel("Maya (Senior Designer)");
      setTenantSecret(`secret-maya-${uniq}`);
      setMonthlyIncome(9500);
      setLiquidBalance(18000);
    } else if (kind === "freelancer") {
      setSelectedListingId("coliving-lisbon-09");
      setSelectedIssuerId("tink-eu");
      setTenantLabel("Rafi (Remote Freelancer · $0 Payslip)");
      setTenantSecret(`secret-rafi-${uniq}`);
      setMonthlyIncome(0);
      setLiquidBalance(14500);
    } else {
      setSelectedListingId("ev-fleet-model3");
      setSelectedIssuerId("tink-eu");
      setTenantLabel("Lukas (Berlin Engineer)");
      setTenantSecret(`secret-lukas-${uniq}`);
      setMonthlyIncome(4200);
      setLiquidBalance(6500);
    }
  };

  const handleGenerateProof = () => {
    const now = Math.floor(new Date().getTime() / 1000);
    const witness = engine.issueSignedAttestation({
      tenantLabel,
      tenantSecret,
      issuerId: selectedIssuerId,
      monthlyIncomeUsd: monthlyIncome,
      liquidBalanceUsd: liquidBalance,
      expiresAtEpoch: now + 86400 * 30,
    });
    const res = engine.submitQualificationProof(
      selectedListingId,
      witness,
      now,
      now + 86400 * 14
    );
    setLastResult(res);
    syncLedger();

    if (res.ok && res.receipt) {
      setActiveReceiptId(res.receipt.receiptId);
      setVerifyInput(res.receipt.receiptId);
      setVerifiedLookup({ status: 1, receipt: res.receipt });
      showToast(
        "ok",
        "ZK Qualification Pass Issued",
        `0 bits of salary/balance disclosed · Receipt ${res.receipt.receiptId.slice(0, 14)}...`
      );
    } else {
      showToast(
        "danger",
        `Circuit Rejected (${res.errorCode})`,
        res.humanReason ?? "Proof failed Compact invariant."
      );
    }
  };

  const handleRevokeActivePass = (receiptId: string) => {
    const res = engine.revokeReceipt(receiptId, tenantSecret);
    syncLedger();
    if (res.ok && res.receipt) {
      if (verifyInput === receiptId) {
        setVerifiedLookup({ status: 2, receipt: res.receipt });
      }
      showToast(
        "ok",
        "Verification Pass Revoked",
        "Midnight ledger updated to REVOKED (2). Landlord can no longer use this pass."
      );
    } else {
      showToast(
        "danger",
        `Revocation Blocked (${res.errorCode})`,
        res.humanReason ?? "Only the tenant who generated this pass can revoke it."
      );
    }
  };

  const handleVerifyReceipt = (idToVerify?: string) => {
    const target = (idToVerify ?? verifyInput).trim();
    if (!target) return;
    const out = engine.verifyReceipt(target);
    setVerifiedLookup(out);
    if (out.status === 1) {
      showToast("ok", "Pass Verified: QUALIFIED", "Cryptographic proof valid · 0 sensitive data exposed.");
    } else if (out.status === 2) {
      showToast("danger", "Pass Status: REVOKED", "Tenant revoked this Verification Pass.");
    } else {
      showToast("danger", "Receipt Not Found", "No matching proof receipt on Midnight ledger.");
    }
  };

  const handleCreateListing = () => {
    const id = `listing-${Math.random().toString(36).slice(2, 7)}`;
    const res = engine.createListing({
      id,
      title: newListingTitle.trim() || "Custom Rental Unit",
      location: newListingLoc.trim() || "Remote / Global",
      template: newListingMode === 1 ? "FREELANCER_COLIVING" : "APARTMENT",
      mode: newListingMode,
      monthlyRentUsd: Math.max(200, newListingRent),
      minIncomeUsd: newListingMode === 1 ? 0 : Math.max(0, newListingMinIncome),
      minBalanceUsd: Math.max(100, newListingMinBalance),
      landlordName: "Custom Landlord Desk",
    });
    syncLedger();
    if (res.ok && res.listing) {
      setSelectedListingId(res.listing.id);
      showToast("ok", "Listing Published On-Chain", `${res.listing.title} is now active in Tenant Studio.`);
    } else {
      showToast("danger", `Listing Rejected (${res.errorCode})`, res.humanReason ?? "Invalid thresholds.");
    }
  };

  const copyVerifierUrl = (rec: PublicReceiptRecord) => {
    const url = `${window.location.origin}/verify?receipt=${encodeURIComponent(
      rec.receiptId
    )}&listing=${encodeURIComponent(rec.listingTitle)}&issuer=${encodeURIComponent(
      rec.issuerName
    )}&status=${rec.status}&template=${encodeURIComponent(rec.listingTemplate)}`;
    navigator.clipboard?.writeText(url);
    showToast("ok", "Walletless Verifier Link Copied", "Share with any landlord—no wallet required.");
  };

  const runAdversarialAttack = (attackId: number) => {
    const sandbox = createSeededLeaseProofEngine();
    const now = 1_795_600_000;
    const validAtt = now + 86400 * 30;
    const validPass = now + 86400 * 14;
    let label = "";
    let expectedCode = "";
    let res: CircuitExecutionResult;

    switch (attackId) {
      case 1: {
        label = "Salary $1 Below 3× Rent ($7,199 vs $7,200)";
        expectedCode = "INSUFFICIENT_INCOME";
        const w = sandbox.issueSignedAttestation({
          tenantLabel: "Attacker 1",
          tenantSecret: "atk-1",
          issuerId: "argyle-payroll",
          monthlyIncomeUsd: 7199,
          liquidBalanceUsd: 15000,
          expiresAtEpoch: validAtt,
        });
        res = sandbox.submitQualificationProof("apt-soho-204", w, now, validPass);
        break;
      }
      case 2: {
        label = "Freelancer Short on 6-Month Runway ($9,599 vs $9,600)";
        expectedCode = "INSUFFICIENT_BALANCE";
        const w = sandbox.issueSignedAttestation({
          tenantLabel: "Attacker 2",
          tenantSecret: "atk-2",
          issuerId: "tink-eu",
          monthlyIncomeUsd: 5000,
          liquidBalanceUsd: 9599,
          expiresAtEpoch: validAtt,
        });
        res = sandbox.submitQualificationProof("coliving-lisbon-09", w, now, validPass);
        break;
      }
      case 3: {
        label = "Fake Photoshopped Bank Attester";
        expectedCode = "UNTRUSTED_ISSUER";
        const w = sandbox.issueSignedAttestation({
          tenantLabel: "Attacker 3",
          tenantSecret: "atk-3",
          issuerId: "fake-pdf-bank",
          monthlyIncomeUsd: 50000,
          liquidBalanceUsd: 100000,
          expiresAtEpoch: validAtt,
        });
        res = sandbox.submitQualificationProof("apt-soho-204", w, now, validPass);
        break;
      }
      case 4: {
        label = "Proof Signed by Revoked Open Banking Provider";
        expectedCode = "REVOKED_ISSUER";
        const w = sandbox.issueSignedAttestation({
          tenantLabel: "Attacker 4",
          tenantSecret: "atk-4",
          issuerId: "plaid-us",
          monthlyIncomeUsd: 12000,
          liquidBalanceUsd: 20000,
          expiresAtEpoch: validAtt,
        });
        sandbox.revokeIssuer("plaid-us");
        res = sandbox.submitQualificationProof("apt-soho-204", w, now, validPass);
        break;
      }
      case 5: {
        label = "Duplicate Replay Attack on Same Listing";
        expectedCode = "REPLAY_ATTACK";
        const w = sandbox.issueSignedAttestation({
          tenantLabel: "Attacker 5",
          tenantSecret: "atk-5",
          issuerId: "plaid-us",
          monthlyIncomeUsd: 10000,
          liquidBalanceUsd: 15000,
          expiresAtEpoch: validAtt,
        });
        sandbox.submitQualificationProof("apt-soho-204", w, now, validPass);
        res = sandbox.submitQualificationProof("apt-soho-204", w, now + 10, validPass);
        break;
      }
      case 6: {
        label = "Stale 90-Day-Old Expired Bank Statement";
        expectedCode = "EXPIRED_ATTESTATION";
        const w = sandbox.issueSignedAttestation({
          tenantLabel: "Attacker 6",
          tenantSecret: "atk-6",
          issuerId: "tink-eu",
          monthlyIncomeUsd: 10000,
          liquidBalanceUsd: 15000,
          expiresAtEpoch: now - 3600,
        });
        res = sandbox.submitQualificationProof("apt-soho-204", w, now, validPass);
        break;
      }
      case 7: {
        label = "Tenant Inflates Salary Locally After Bank Signs";
        expectedCode = "TAMPERED_COMMITMENT";
        const w = sandbox.issueSignedAttestation({
          tenantLabel: "Attacker 7",
          tenantSecret: "atk-7",
          issuerId: "argyle-payroll",
          monthlyIncomeUsd: 4000,
          liquidBalanceUsd: 15000,
          expiresAtEpoch: validAtt,
        });
        const tampered = { ...w, monthlyIncomeUsd: 14000 };
        res = sandbox.submitQualificationProof("apt-soho-204", tampered, now, validPass);
        break;
      }
      default: {
        label = "Stranger Tries to Revoke Tenant's Pass";
        expectedCode = "UNAUTHORIZED_REVOKE";
        const w = sandbox.issueSignedAttestation({
          tenantLabel: "Honest Tenant",
          tenantSecret: "real-owner-secret",
          issuerId: "plaid-us",
          monthlyIncomeUsd: 10000,
          liquidBalanceUsd: 15000,
          expiresAtEpoch: validAtt,
        });
        const ok = sandbox.submitQualificationProof("apt-soho-204", w, now, validPass);
        res = sandbox.revokeReceipt(ok.receipt!.receiptId, "hijacker-wrong-secret", now + 5);
        break;
      }
    }

    const seq = attackSeq;
    setAttackSeq((s) => s + 1);
    const entry: AttackLogEntry = {
      id: `${attackId}-${seq}`,
      label,
      expectedCode,
      actualCode: res.errorCode ?? "UNEXPECTED_PASS",
      blocked: !res.ok && res.errorCode === expectedCode,
      reason: res.humanReason ?? "Rejected by Compact circuit assertion.",
      timestamp: `Run #${seq}`,
    };
    setAttackLogs((prev) => [entry, ...prev].slice(0, 12));
    showToast(
      entry.blocked ? "ok" : "danger",
      entry.blocked ? `Attack Blocked: ${entry.actualCode}` : "Unexpected Result",
      entry.reason
    );
  };

  const resetLedger = () => {
    const fresh = createSeededLeaseProofEngine();
    setEngine(fresh);
    syncLedger(fresh);
    setLastResult(null);
    setActiveReceiptId(null);
    setVerifiedLookup(null);
    setAttackLogs([]);
    showToast("ok", "Ledger Reset", "Fresh Midnight dual-ledger state initialized.");
  };

  return (
    <>
      <header className="site-header site-header-app">
        <div className="site-header-inner">
          <Link href="/" className="brand-lockup">
            <span className="brand-mark" aria-hidden="true">
              <ShieldCheck size={18} strokeWidth={2.4} />
            </span>
            <span>LeaseProof</span>
            <span className="nav-divider">|</span>
            <span className="nav-sub">Midnight ZK Audit Workspace</span>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="badge badge-ok tabular">
              {snapshot.totalVerifiedPasses} Verified{" "}
              {snapshot.totalVerifiedPasses === 1 ? "Pass" : "Passes"}
            </span>
            <Link href="/deck" className="btn-ghost hide-mobile">
              <Presentation size={15} /> Pitch Deck
            </Link>
            <button type="button" className="btn-ghost hide-mobile" onClick={resetLedger}>
              <RotateCcw size={14} /> Reset Demo
            </button>
          </div>
        </div>
      </header>

      <div className="app-shell">
        {/* Desktop Sidebar */}
        <aside className="app-sidebar">
          <div className="side-group-label">ZK WORKSPACE ROLES</div>
          <button
            type="button"
            className={`side-nav-btn ${activeTab === "tenant" ? "is-active" : ""}`}
            onClick={() => setActiveTab("tenant")}
          >
            <KeyRound size={16} style={{ flexShrink: 0 }} />
            1. Tenant Proof Studio
          </button>
          <button
            type="button"
            className={`side-nav-btn ${activeTab === "landlord" ? "is-active" : ""}`}
            onClick={() => setActiveTab("landlord")}
          >
            <UserCheck size={16} style={{ flexShrink: 0 }} />
            2. Landlord Verifier
          </button>
          <button
            type="button"
            className={`side-nav-btn ${activeTab === "attacks" ? "is-active" : ""}`}
            onClick={() => setActiveTab("attacks")}
          >
            <ShieldAlert size={16} style={{ flexShrink: 0 }} />
            3. Attack &amp; Attester Lab
          </button>

          <div className="side-group-label" style={{ marginTop: 14 }}>
            DELIVERABLES
          </div>
          <Link href="/deck" className="side-nav-btn" style={{ textDecoration: "none" }}>
            <Presentation size={16} style={{ flexShrink: 0 }} />
            8-Slide Pitch Deck
          </Link>
          <Link href="/" className="side-nav-btn" style={{ textDecoration: "none" }}>
            <ArrowLeft size={16} style={{ flexShrink: 0 }} />
            Back to Overview
          </Link>

          <div className="card-subtle" style={{ marginTop: "auto", fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>
            <strong style={{ color: "var(--text)", display: "block", marginBottom: 4 }}>
              Compact Circuit Mirror
            </strong>
            Executes identical assertions, SHA-256 commitments &amp; nullifiers as{" "}
            <span className="mono" style={{ color: "var(--cyan)" }}>
              leaseproof.compact
            </span>{" "}
            (compiled on GitHub Actions Ubuntu CI).
          </div>
        </aside>

        {/* Main Full-Bleed Workspace */}
        <main className="app-main">
          {/* TAB 1: TENANT PROOF STUDIO */}
          {activeTab === "tenant" && (
            <section className="workspace-split reveal">
              {/* Left: Private Local Witness Form */}
              <div style={{ display: "grid", gap: 16 }}>
                <div className="card">
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
                    <div>
                      <span className="badge badge-violet" style={{ marginBottom: 6 }}>
                        Local Private Witness · Stays On Your Device
                      </span>
                      <h1 style={{ margin: 0, fontSize: 22, letterSpacing: "-0.02em" }}>
                        Generate Private Qualification Pass
                      </h1>
                    </div>
                  </div>

                  {/* 1-Click Persona Presets */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
                    <button type="button" className="btn-ghost" onClick={() => applyPersona("salaried")}>
                      <Sparkles size={14} color="#7c5cff" /> Load Salaried Tenant (Apartment)
                    </button>
                    <button type="button" className="btn-ghost" onClick={() => applyPersona("freelancer")}>
                      <Sparkles size={14} color="#22d3ee" /> Load Freelancer ($0 Payslip · Co-Living)
                    </button>
                    <button type="button" className="btn-ghost" onClick={() => applyPersona("ev")}>
                      <Sparkles size={14} color="#10b981" /> Load EV Lease Applicant
                    </button>
                  </div>

                  <div style={{ display: "grid", gap: 14 }}>
                    <div>
                      <label className="field-label" htmlFor="listing-select">
                        Target Property / Lease Listing
                      </label>
                      <select
                        id="listing-select"
                        className="input-dark"
                        value={selectedListingId}
                        onChange={(e) => setSelectedListingId(e.target.value)}
                      >
                        {snapshot.listings.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.title} — {TEMPLATE_LABEL[l.template]}
                          </option>
                        ))}
                      </select>
                      {selectedListing && (
                        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>
                          Public requirement:{" "}
                          {selectedListing.mode === 0
                            ? `Income ≥ ${fmtUsd(selectedListing.minIncomeUsd)}/mo AND Liquid Balance ≥ ${fmtUsd(selectedListing.minBalanceUsd)}`
                            : `Liquid Runway ≥ ${fmtUsd(selectedListing.minBalanceUsd)} (No payslip required)`}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="field-label" htmlFor="issuer-select">
                        Open Banking / Payroll Attester
                      </label>
                      <select
                        id="issuer-select"
                        className="input-dark"
                        value={selectedIssuerId}
                        onChange={(e) => setSelectedIssuerId(e.target.value)}
                      >
                        {snapshot.issuers.map((iss) => (
                          <option key={iss.id} value={iss.id}>
                            {iss.name} ({iss.active ? "Active" : "REVOKED"})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid-2">
                      <div>
                        <label className="field-label" htmlFor="income-input">
                          Private Monthly Income ($ USD)
                        </label>
                        <input
                          id="income-input"
                          type="number"
                          className="input-dark tabular"
                          value={monthlyIncome}
                          onChange={(e) => setMonthlyIncome(Math.max(0, Number(e.target.value) || 0))}
                        />
                      </div>
                      <div>
                        <label className="field-label" htmlFor="balance-input">
                          Private Liquid Balance ($ USD)
                        </label>
                        <input
                          id="balance-input"
                          type="number"
                          className="input-dark tabular"
                          value={liquidBalance}
                          onChange={(e) => setLiquidBalance(Math.max(0, Number(e.target.value) || 0))}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="field-label" htmlFor="secret-input">
                        Private Tenant Secret (Derives Owner Commit &amp; Scoped Nullifier)
                      </label>
                      <input
                        id="secret-input"
                        type="text"
                        className="input-dark mono"
                        value={tenantSecret}
                        onChange={(e) => setTenantSecret(e.target.value)}
                      />
                    </div>

                    <button type="button" className="btn-primary" onClick={handleGenerateProof}>
                      <ShieldCheck size={16} /> Generate Midnight ZK Qualification Pass
                    </button>
                  </div>
                </div>

                {/* Circuit Execution Feedback */}
                {lastResult && !lastResult.ok && (
                  <div className="card" style={{ borderColor: "rgba(239, 68, 68, 0.45)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#f87171", marginBottom: 6 }}>
                      <XCircle size={18} style={{ flexShrink: 0 }} />
                      <strong>Compact Circuit Refused: {lastResult.errorCode}</strong>
                    </div>
                    <p style={{ margin: 0, fontSize: 13.5, color: "var(--muted)", lineHeight: 1.5 }}>
                      {lastResult.humanReason}
                    </p>
                  </div>
                )}
              </div>

              {/* Right: Live Split-Screen Privacy Inspector + Issued Pass Card */}
              <div style={{ display: "grid", gap: 16 }}>
                <div className="card" style={{ borderColor: "rgba(124, 92, 255, 0.35)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <strong style={{ fontSize: 16 }}>Split-Screen Privacy Inspector</strong>
                    <span className="badge badge-ok">0 Bits Leaked</span>
                  </div>

                  <div className="grid-2" style={{ gap: 12 }}>
                    <div className="card-subtle" style={{ borderColor: "rgba(124, 92, 255, 0.28)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#c4b5fd", marginBottom: 10 }}>
                        <EyeOff size={14} /> NOBODY CAN SEE (LOCAL)
                      </div>
                      <div style={{ display: "grid", gap: 8, fontSize: 12.5 }}>
                        <div>
                          <div style={{ color: "var(--muted)" }}>Monthly Income</div>
                          <strong className="tabular">{fmtUsd(monthlyIncome)}/mo</strong>
                        </div>
                        <div>
                          <div style={{ color: "var(--muted)" }}>Liquid Bank Balance</div>
                          <strong className="tabular">{fmtUsd(liquidBalance)}</strong>
                        </div>
                        <div>
                          <div style={{ color: "var(--muted)" }}>Tenant Secret</div>
                          <strong className="mono">{tenantSecret.slice(0, 14)}...</strong>
                        </div>
                      </div>
                    </div>

                    <div className="card-subtle" style={{ borderColor: "rgba(16, 185, 129, 0.3)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#34d399", marginBottom: 10 }}>
                        <CheckCircle2 size={14} /> ANYONE CAN SEE (LEDGER)
                      </div>
                      {activeReceipt ? (
                        <div style={{ display: "grid", gap: 8, fontSize: 12.5 }}>
                          <div>
                            <div style={{ color: "var(--muted)" }}>Verdict</div>
                            <strong
                              style={{
                                color: activeReceipt.status === 1 ? "var(--green)" : "var(--red)",
                              }}
                            >
                              {activeReceipt.status === 1 ? "QUALIFIED (1)" : "REVOKED (2)"}
                            </strong>
                          </div>
                          <div>
                            <div style={{ color: "var(--muted)" }}>Attester</div>
                            <strong>{activeReceipt.issuerName}</strong>
                          </div>
                          <div>
                            <div style={{ color: "var(--muted)" }}>Scoped Nullifier</div>
                            <strong className="mono">{activeReceipt.nullifier.slice(0, 14)}...</strong>
                          </div>
                        </div>
                      ) : (
                        <div style={{ fontSize: 12.5, color: "var(--muted)" }}>
                          Generate a pass on the left to inspect the exact public Midnight ledger
                          commitment.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Active Issued Pass with Tenant-Controlled Revocation */}
                {activeReceipt && (
                  <div
                    className="card"
                    style={{
                      borderColor:
                        activeReceipt.status === 1
                          ? "rgba(16, 185, 129, 0.42)"
                          : "rgba(239, 68, 68, 0.42)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 10,
                      }}
                    >
                      <span
                        className={`badge ${
                          activeReceipt.status === 1 ? "badge-ok" : "badge-danger"
                        }`}
                      >
                        {activeReceipt.status === 1
                          ? "VERIFIED QUALIFIED · ACTIVE"
                          : "REVOKED BY TENANT"}
                      </span>
                      <span className="mono" style={{ fontSize: 11.5, color: "var(--muted)" }}>
                        {activeReceipt.proofDurationMs}ms circuit
                      </span>
                    </div>

                    <h3 style={{ margin: "0 0 6px", fontSize: 17 }}>{activeReceipt.listingTitle}</h3>
                    <div className="mono" style={{ fontSize: 12, color: "var(--cyan)", marginBottom: 14, wordBreak: "break-all" }}>
                      Receipt: {activeReceipt.receiptId}
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      <button
                        type="button"
                        className="btn-ghost"
                        onClick={() => copyVerifierUrl(activeReceipt)}
                      >
                        <Copy size={14} /> Copy Walletless Verifier Link
                      </button>
                      <button
                        type="button"
                        className="btn-ghost"
                        onClick={() => {
                          setVerifyInput(activeReceipt.receiptId);
                          setVerifiedLookup({ status: activeReceipt.status, receipt: activeReceipt });
                          setActiveTab("landlord");
                        }}
                      >
                        Inspect as Landlord
                      </button>
                      {activeReceipt.status === 1 && (
                        <button
                          type="button"
                          className="btn-danger"
                          onClick={() => handleRevokeActivePass(activeReceipt.receiptId)}
                        >
                          <ShieldOff size={14} /> Revoke Pass (Tenant Consent)
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* TAB 2: LANDLORD VERIFIER (WALLETLESS) */}
          {activeTab === "landlord" && (
            <section className="workspace-split reveal">
              {/* Left: Instant Walletless Receipt Verifier */}
              <div style={{ display: "grid", gap: 16 }}>
                <div className="card">
                  <span className="badge badge-ok" style={{ marginBottom: 8 }}>
                    Zero Wallet · Zero PDF Storage · GDPR Compliant
                  </span>
                  <h2 style={{ margin: "0 0 8px", fontSize: 21 }}>
                    Landlord Walletless Verification Desk
                  </h2>
                  <p style={{ margin: "0 0 14px", fontSize: 13.5, color: "var(--muted)", lineHeight: 1.55 }}>
                    Paste any Tenant Receipt ID to verify qualification directly against the
                    Midnight public ledger—without ever seeing salary, bank statements, or ID scans.
                  </p>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                    <input
                      type="text"
                      className="input-dark mono"
                      style={{ flex: 1, minWidth: 220, fontSize: 12.5 }}
                      placeholder="0x... receipt ID"
                      aria-label="Receipt ID to verify"
                      value={verifyInput}
                      onChange={(e) => setVerifyInput(e.target.value)}
                    />
                    <button type="button" className="btn-primary" onClick={() => handleVerifyReceipt()}>
                      Verify Receipt
                    </button>
                  </div>

                  {verifiedLookup && (
                    <div
                      className="card-subtle"
                      style={{
                        borderColor:
                          verifiedLookup.status === 1
                            ? "rgba(16, 185, 129, 0.45)"
                            : "rgba(239, 68, 68, 0.45)",
                      }}
                    >
                      {verifiedLookup.receipt ? (
                        <div style={{ display: "grid", gap: 8, fontSize: 13.5 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <strong>{verifiedLookup.receipt.listingTitle}</strong>
                            <span
                              className={`badge ${
                                verifiedLookup.status === 1 ? "badge-ok" : "badge-danger"
                              }`}
                            >
                              {verifiedLookup.status === 1 ? "QUALIFIED" : "REVOKED"}
                            </span>
                          </div>
                          <div style={{ color: "var(--muted)" }}>
                            Attested by <strong style={{ color: "var(--text)" }}>{verifiedLookup.receipt.issuerName}</strong>{" "}
                            · Template: {TEMPLATE_LABEL[verifiedLookup.receipt.listingTemplate]}
                          </div>
                          <div style={{ color: "var(--green)", fontSize: 12.5 }}>
                            Privacy Check: Salary = Hidden · Balance = Hidden · Tenant ID = Hidden (0 bits leaked)
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: "#f87171", fontSize: 13.5 }}>
                          Receipt not found on Midnight public ledger (Status: 0).
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Recent Public Ledger Receipts */}
                <div className="card">
                  <h3 style={{ margin: "0 0 12px", fontSize: 16 }}>
                    Recent Public Ledger Receipts ({snapshot.receipts.length})
                  </h3>
                  {snapshot.receipts.length === 0 ? (
                    <p style={{ margin: 0, fontSize: 13.5, color: "var(--muted)" }}>
                      No passes issued yet. Switch to Tab 1 (Tenant Proof Studio) and generate a pass
                      in 1 click.
                    </p>
                  ) : (
                    <div style={{ display: "grid", gap: 10 }}>
                      {snapshot.receipts.map((rec) => (
                        <div
                          key={rec.receiptId}
                          className="card-subtle"
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 10,
                            flexWrap: "wrap",
                          }}
                        >
                          <div>
                            <strong style={{ fontSize: 13.5 }}>{rec.listingTitle}</strong>
                            <div className="mono" style={{ fontSize: 11.5, color: "var(--muted)" }}>
                              {rec.receiptId.slice(0, 22)}... · {rec.issuerName}
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span className={`badge ${rec.status === 1 ? "badge-ok" : "badge-danger"}`}>
                              {rec.status === 1 ? "QUALIFIED" : "REVOKED"}
                            </span>
                            <button
                              type="button"
                              className="btn-ghost"
                              style={{ padding: "6px 10px", fontSize: 12 }}
                              onClick={() => {
                                setVerifyInput(rec.receiptId);
                                handleVerifyReceipt(rec.receiptId);
                              }}
                            >
                              Verify
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Create Custom Rental Listing */}
              <div className="card">
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <Building2 size={18} color="#7c5cff" />
                  <h3 style={{ margin: 0, fontSize: 18 }}>Publish Custom Rental Listing</h3>
                </div>
                <p style={{ margin: "0 0 14px", fontSize: 13, color: "var(--muted)" }}>
                  Calls <span className="mono">createListing()</span> on Midnight to set exact
                  income/runway thresholds for applicants.
                </p>

                <div style={{ display: "grid", gap: 12 }}>
                  <div>
                    <label className="field-label" htmlFor="new-title">Listing Title</label>
                    <input
                      id="new-title"
                      type="text"
                      className="input-dark"
                      value={newListingTitle}
                      onChange={(e) => setNewListingTitle(e.target.value)}
                    />
                  </div>
                  <div className="grid-2">
                    <div>
                      <label className="field-label" htmlFor="new-loc">City / Jurisdiction</label>
                      <input
                        id="new-loc"
                        type="text"
                        className="input-dark"
                        value={newListingLoc}
                        onChange={(e) => setNewListingLoc(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="field-label" htmlFor="new-mode">Qualification Mode</label>
                      <select
                        id="new-mode"
                        className="input-dark"
                        value={newListingMode}
                        onChange={(e) => setNewListingMode(Number(e.target.value) as ListingMode)}
                      >
                        <option value={0}>Mode 0 · Income + Deposit</option>
                        <option value={1}>Mode 1 · Freelancer Runway Only</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid-3">
                    <div>
                      <label className="field-label" htmlFor="new-rent">Rent ($/mo)</label>
                      <input
                        id="new-rent"
                        type="number"
                        className="input-dark tabular"
                        value={newListingRent}
                        onChange={(e) => setNewListingRent(Number(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="field-label" htmlFor="new-inc">Min Income ($)</label>
                      <input
                        id="new-inc"
                        type="number"
                        className="input-dark tabular"
                        disabled={newListingMode === 1}
                        value={newListingMode === 1 ? 0 : newListingMinIncome}
                        onChange={(e) => setNewListingMinIncome(Number(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="field-label" htmlFor="new-bal">Min Balance ($)</label>
                      <input
                        id="new-bal"
                        type="number"
                        className="input-dark tabular"
                        value={newListingMinBalance}
                        onChange={(e) => setNewListingMinBalance(Number(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  <button type="button" className="btn-primary" onClick={handleCreateListing}>
                    <PlusCircle size={16} /> Publish Listing to Ledger
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* TAB 3: ATTACK & ATTESTER LAB */}
          {activeTab === "attacks" && (
            <section className="workspace-split reveal">
              {/* Left: 8 Instant 1-Click Adversarial Attacks */}
              <div className="card">
                <span className="badge badge-danger" style={{ marginBottom: 8 }}>
                  Instant Security Verification · Zero Waiting
                </span>
                <h2 style={{ margin: "0 0 8px", fontSize: 21 }}>
                  Try to Cheat the Compact ZK Circuit (8 Attacks)
                </h2>
                <p style={{ margin: "0 0 16px", fontSize: 13.5, color: "var(--muted)", lineHeight: 1.55 }}>
                  Click any real-world rental fraud attack below. Every attempt is executed directly
                  against LeaseProof&apos;s circuit assertions and rejected cryptographically.
                </p>

                <div className="grid-2" style={{ gap: 10 }}>
                  {[
                    { id: 1, title: "1. Salary $1 Short ($7,199)", code: "INSUFFICIENT_INCOME" },
                    { id: 2, title: "2. Freelancer Short Runway", code: "INSUFFICIENT_BALANCE" },
                    { id: 3, title: "3. Fake Photoshopped Bank", code: "UNTRUSTED_ISSUER" },
                    { id: 4, title: "4. Revoked Bank Attester", code: "REVOKED_ISSUER" },
                    { id: 5, title: "5. Duplicate Replay Attack", code: "REPLAY_ATTACK" },
                    { id: 6, title: "6. Expired 90-Day Statement", code: "EXPIRED_ATTESTATION" },
                    { id: 7, title: "7. Inflate Salary After Sign", code: "TAMPERED_COMMITMENT" },
                    { id: 8, title: "8. Stranger Revokes Pass", code: "UNAUTHORIZED_REVOKE" },
                  ].map((atk) => (
                    <button
                      key={atk.id}
                      type="button"
                      className="btn-danger"
                      style={{
                        flexDirection: "column",
                        alignItems: "flex-start",
                        gap: 4,
                        padding: "12px 14px",
                        width: "100%",
                        whiteSpace: "normal",
                        textAlign: "left",
                      }}
                      onClick={() => runAdversarialAttack(atk.id)}
                    >
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: "#fee2e2" }}>
                        {atk.title}
                      </span>
                      <span className="mono" style={{ fontSize: 11, opacity: 0.85 }}>
                        assert → {atk.code}
                      </span>
                    </button>
                  ))}
                </div>

                {attackLogs.length > 0 && (
                  <div style={{ marginTop: 18, display: "grid", gap: 8 }}>
                    <strong style={{ fontSize: 13.5 }}>Live Rejection Log</strong>
                    {attackLogs.map((log) => (
                      <div
                        key={log.id}
                        className="card-subtle"
                        style={{ borderColor: "rgba(239, 68, 68, 0.35)", fontSize: 12.5 }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                          <strong style={{ color: "#fca5a5" }}>
                            BLOCKED · {log.actualCode}
                          </strong>
                          <span className="tabular" style={{ color: "var(--muted)" }}>
                            {log.timestamp}
                          </span>
                        </div>
                        <div style={{ color: "var(--text)", marginBottom: 2 }}>{log.label}</div>
                        <div style={{ color: "var(--muted)" }}>{log.reason}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Live Attester Registry */}
              <div className="card">
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <AlertTriangle size={18} color="#22d3ee" />
                  <h3 style={{ margin: 0, fontSize: 18 }}>Trusted Open Banking / Payroll Registry</h3>
                </div>
                <p style={{ margin: "0 0 14px", fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>
                  Revoke any attester live on the ledger to test how{" "}
                  <span className="mono">submitQualificationProof()</span> immediately blocks new
                  proofs from compromised providers.
                </p>

                <div style={{ display: "grid", gap: 10 }}>
                  {snapshot.issuers.map((iss) => (
                    <div
                      key={iss.id}
                      className="card-subtle"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: 14 }}>{iss.name}</strong>
                        <div style={{ fontSize: 12, color: "var(--muted)" }}>
                          {iss.providerType} · <span className="mono">{iss.id}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span className={`badge ${iss.active ? "badge-ok" : "badge-danger"}`}>
                          {iss.active ? "ACTIVE" : "REVOKED"}
                        </span>
                        <button
                          type="button"
                          className={iss.active ? "btn-danger" : "btn-ghost"}
                          style={{ padding: "6px 12px", fontSize: 12 }}
                          onClick={() => {
                            if (iss.active) engine.revokeIssuer(iss.id);
                            else engine.reinstateIssuer(iss.id);
                            syncLedger();
                          }}
                        >
                          {iss.active ? "Revoke" : "Reinstate"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="mobile-nav" aria-label="Workspace roles">
        <button
          type="button"
          className={`mobile-nav-btn ${activeTab === "tenant" ? "is-active" : ""}`}
          onClick={() => setActiveTab("tenant")}
        >
          1. Tenant
        </button>
        <button
          type="button"
          className={`mobile-nav-btn ${activeTab === "landlord" ? "is-active" : ""}`}
          onClick={() => setActiveTab("landlord")}
        >
          2. Landlord
        </button>
        <button
          type="button"
          className={`mobile-nav-btn ${activeTab === "attacks" ? "is-active" : ""}`}
          onClick={() => setActiveTab("attacks")}
        >
          3. Attack Lab
        </button>
      </nav>

      {/* Sonner-inspired Tactile Toast */}
      {toast && (
        <div
          className="toast-banner"
          role="status"
          style={{
            borderColor:
              toast.tone === "ok" ? "rgba(16, 185, 129, 0.45)" : "rgba(239, 68, 68, 0.45)",
          }}
        >
          <strong
            style={{
              display: "block",
              fontSize: 13.5,
              color: toast.tone === "ok" ? "#34d399" : "#f87171",
              marginBottom: 3,
            }}
          >
            {toast.title}
          </strong>
          <span style={{ fontSize: 12.5, color: "var(--muted)" }}>{toast.detail}</span>
        </div>
      )}
    </>
  );
}
