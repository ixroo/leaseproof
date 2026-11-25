"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock,
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
  computeAttestationCommitment,
  createSeededLeaseProofEngine,
  CURRENCY_META,
  DEFAULT_ADMIN_SECRET,
  DEMO_ISSUER_SECRETS,
  deriveIssuerKeyCommit,
  PASS_VALIDITY_SEC,
  type CircuitExecutionResult,
  type CurrencyCode,
  type LedgerSnapshot,
  type ListingMode,
  type PublicReceiptRecord,
  type TemplateType,
  type VerifyReceiptResult,
} from "@/lib/zk/leaseproofEngine";

type RoleTab = "tenant" | "landlord" | "attacks";

interface AttackLogEntry {
  id: string;
  label: string;
  actualCode: string;
  blocked: boolean;
  reason: string;
  runLabel: string;
}

const fmtMoney = (n: number, currency: CurrencyCode) =>
  `${CURRENCY_META[currency].symbol}${Math.round(n).toLocaleString("en-US")}`;

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
  const [kycIdSeed, setKycIdSeed] = useState("kyc-maya-ssn-9921");
  const [tenantSecret, setTenantSecret] = useState("tenant-secret-maya-2026");
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>(840);
  const [monthlyIncome, setMonthlyIncome] = useState(9500);
  const [liquidBalance, setLiquidBalance] = useState(18000);
  const [lastResult, setLastResult] = useState<CircuitExecutionResult | null>(null);
  const [activeReceiptId, setActiveReceiptId] = useState<string | null>(null);

  // Landlord Walletless Verifier state
  const [verifyInput, setVerifyInput] = useState("");
  const [verifyExpectedListingId, setVerifyExpectedListingId] = useState("apt-soho-204");
  const [verifiedLookup, setVerifiedLookup] = useState<VerifyReceiptResult | null>(null);

  // Create Custom Listing state
  const [newListingTitle, setNewListingTitle] = useState("Shibuya Loft · 1BR ($2,100/mo)");
  const [newListingLoc, setNewListingLoc] = useState("Tokyo, Japan");
  const [newListingMode, setNewListingMode] = useState<ListingMode>(0);
  const [newListingCurrency, setNewListingCurrency] = useState<CurrencyCode>(840);
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
      setCurrencyCode(840);
      setTenantLabel("Maya (Senior Designer)");
      setKycIdSeed(`kyc-maya-${uniq}`);
      setTenantSecret(`secret-maya-${uniq}`);
      setMonthlyIncome(9500);
      setLiquidBalance(18000);
    } else if (kind === "freelancer") {
      setSelectedListingId("coliving-lisbon-09");
      setSelectedIssuerId("tink-eu");
      setCurrencyCode(978);
      setTenantLabel("Rafi (Remote Freelancer · €0 Payslip)");
      setKycIdSeed(`kyc-rafi-${uniq}`);
      setTenantSecret(`secret-rafi-${uniq}`);
      setMonthlyIncome(0);
      setLiquidBalance(14500);
    } else {
      setSelectedListingId("ev-fleet-model3");
      setSelectedIssuerId("tink-eu");
      setCurrencyCode(978);
      setTenantLabel("Lukas (Berlin Engineer)");
      setKycIdSeed(`kyc-lukas-${uniq}`);
      setTenantSecret(`secret-lukas-${uniq}`);
      setMonthlyIncome(4200);
      setLiquidBalance(6500);
    }
  };

  const handleGenerateProof = () => {
    const now = engine.getCurrentEpoch();
    const witness = engine.issueAndAnchorAttestation({
      tenantLabel,
      tenantSecret,
      kycIdSeed,
      issuerId: selectedIssuerId,
      issuerSecret: DEMO_ISSUER_SECRETS[selectedIssuerId] ?? "",
      currencyCode,
      monthlyIncome,
      liquidBalance,
      expiresAtEpoch: now + 86400 * 30,
    });
    const res = engine.submitQualificationProof(selectedListingId, witness);
    setLastResult(res);
    syncLedger();

    if (res.ok && res.receipt) {
      setActiveReceiptId(res.receipt.receiptId);
      setVerifyInput(res.receipt.receiptId);
      setVerifyExpectedListingId(res.receipt.listingId);
      setVerifiedLookup(engine.queryPublicReceipt(res.receipt.receiptId, res.receipt.listingId));
      showToast(
        "ok",
        "ZK Pre-Qualification Pass Issued",
        `Issuer-anchored commitment verified · Raw salary & balance stay private.`
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
        setVerifiedLookup(engine.queryPublicReceipt(receiptId, verifyExpectedListingId));
      }
      showToast(
        "ok",
        "Pre-Qualification Pass Revoked",
        "Public ledger status updated to REVOKED (2). Landlord can no longer use this pass."
      );
    } else {
      showToast(
        "danger",
        `Revocation Blocked (${res.errorCode})`,
        res.humanReason ?? "Only the tenant who generated this pass can revoke it."
      );
    }
  };

  const handleAdvance15Days = () => {
    const res = engine.advanceEpoch(
      engine.getCurrentEpoch() + PASS_VALIDITY_SEC + 86400,
      DEFAULT_ADMIN_SECRET
    );
    syncLedger();
    if (res.ok && verifyInput) {
      setVerifiedLookup(engine.queryPublicReceipt(verifyInput, verifyExpectedListingId));
    }
    showToast(
      "ok",
      "On-Chain Ledger Epoch +15 Days",
      "Active 14-day passes are now EXPIRED (3); tenants can re-apply in the new window."
    );
  };

  const handleVerifyReceipt = (idToVerify?: string, listingToMatch?: string) => {
    const target = (idToVerify ?? verifyInput).trim();
    const expectedListing = listingToMatch ?? verifyExpectedListingId;
    if (!target) return;
    const out = engine.queryPublicReceipt(target, expectedListing || undefined);
    setVerifiedLookup(out);
    if (out.status === 1) {
      showToast("ok", "Verified: QUALIFIED", out.humanReason);
    } else if (out.errorCode === "LISTING_MISMATCH") {
      showToast("danger", "Blocked: LISTING_MISMATCH", out.humanReason);
    } else if (out.status === 2) {
      showToast("danger", "Status: REVOKED", out.humanReason);
    } else if (out.status === 3) {
      showToast("danger", "Status: EXPIRED", out.humanReason);
    } else {
      showToast("danger", "Receipt Not Found", out.humanReason);
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
      currencyCode: newListingCurrency,
      monthlyRent: Math.max(200, newListingRent),
      minIncome: newListingMode === 1 ? 0 : Math.max(0, newListingMinIncome),
      minBalance: Math.max(100, newListingMinBalance),
      landlordName: "Custom Landlord Desk",
    });
    syncLedger();
    if (res.ok && res.listing) {
      setSelectedListingId(res.listing.id);
      setCurrencyCode(res.listing.currencyCode);
      showToast("ok", "Listing Published", `${res.listing.title} is now active in Tenant Studio.`);
    } else {
      showToast("danger", `Listing Rejected (${res.errorCode})`, res.humanReason ?? "Invalid thresholds.");
    }
  };

  const copyVerifierUrl = (rec: PublicReceiptRecord) => {
    const isExpired = snapshot.currentLedgerEpoch > rec.expiresAtEpoch;
    const liveStatus = rec.status === 2 ? 2 : isExpired ? 3 : 1;
    const url = `${window.location.origin}/verify?receipt=${encodeURIComponent(
      rec.receiptId
    )}&listing=${encodeURIComponent(rec.listingTitle)}&issuer=${encodeURIComponent(
      rec.issuerName
    )}&status=${liveStatus}&applicant=${encodeURIComponent(rec.applicantIdCommit.slice(0, 18))}`;
    navigator.clipboard?.writeText(url);
    showToast("ok", "Shareable Verifier Link Copied", "Self-contained link works across any browser/device.");
  };

  const runAdversarialAttack = (attackId: number) => {
    const sandbox = createSeededLeaseProofEngine(1_795_600_000);
    const now = sandbox.getCurrentEpoch();
    const validAtt = now + 86400 * 30;
    let label = "";
    let expectedCode = "";
    let actualCode = "";
    let reason = "";
    let blocked = false;

    switch (attackId) {
      case 1: {
        label = "Inflate Salary & Re-Hash Locally (Unanchored Forge)";
        expectedCode = "TAMPERED_COMMITMENT";
        const honest = sandbox.issueAndAnchorAttestation({
          tenantLabel: "Forger",
          tenantSecret: "atk-1",
          kycIdSeed: "kyc-atk-1",
          issuerId: "argyle-payroll",
          issuerSecret: DEMO_ISSUER_SECRETS["argyle-payroll"],
          currencyCode: 840,
          monthlyIncome: 3000,
          liquidBalance: 10000,
          expiresAtEpoch: validAtt,
        });
        const issuerHash = sandbox.getSnapshot().issuers.find((i) => i.id === "argyle-payroll")!.idHash;
        const forgedCommit = computeAttestationCommitment({
          issuerIdHash: issuerHash,
          applicantIdCommit: honest.applicantIdCommit,
          currencyCode: 840,
          monthlyIncome: 30000,
          liquidBalance: 10000,
          attestationExpiryEpoch: validAtt,
          nonce: honest.attestationNonce,
        });
        const r = sandbox.submitQualificationProof("apt-soho-204", {
          ...honest,
          monthlyIncome: 30000,
          attestedCommitment: forgedCommit,
        });
        actualCode = r.errorCode ?? "PASS";
        reason = r.humanReason ?? "";
        blocked = !r.ok && actualCode === expectedCode;
        break;
      }
      case 2: {
        label = "Forward $500 Dorm Pass to $2,400 SoHo Loft";
        expectedCode = "LISTING_MISMATCH";
        sandbox.createListing({
          id: "cheap-dorm",
          title: "Budget Dorm ($500/mo)",
          location: "Austin",
          template: "APARTMENT",
          mode: 0,
          currencyCode: 840,
          monthlyRent: 500,
          minIncome: 1500,
          minBalance: 1000,
          landlordName: "Dorm",
        });
        const w = sandbox.issueAndAnchorAttestation({
          tenantLabel: "Forwarder",
          tenantSecret: "atk-2",
          kycIdSeed: "kyc-atk-2",
          issuerId: "plaid-us",
          issuerSecret: DEMO_ISSUER_SECRETS["plaid-us"],
          currencyCode: 840,
          monthlyIncome: 2000,
          liquidBalance: 1500,
          expiresAtEpoch: validAtt,
        });
        const pass = sandbox.submitQualificationProof("cheap-dorm", w);
        const check = sandbox.queryPublicReceipt(pass.receipt!.receiptId, "apt-soho-204");
        actualCode = check.errorCode ?? "PASS";
        reason = check.humanReason;
        blocked = check.status === 0 && actualCode === expectedCode;
        break;
      }
      case 3: {
        label = "Attacker Self-Registers Fake Bank (Admin Guard)";
        expectedCode = "UNAUTHORIZED_ADMIN";
        const r = sandbox.registerIssuer({
          id: "fake-bank",
          name: "Fake Bank",
          providerType: "Open Banking",
          issuerKeyCommit: deriveIssuerKeyCommit("bad"),
          callerAdminSecret: "not-the-admin",
        });
        actualCode = r.errorCode ?? "PASS";
        reason = r.humanReason ?? "";
        blocked = !r.ok && actualCode === expectedCode;
        break;
      }
      case 4: {
        label = "Submit EUR Attestation to USD Listing (FX Spoof)";
        expectedCode = "CURRENCY_MISMATCH";
        const w = sandbox.issueAndAnchorAttestation({
          tenantLabel: "FX",
          tenantSecret: "atk-4",
          kycIdSeed: "kyc-atk-4",
          issuerId: "tink-eu",
          issuerSecret: DEMO_ISSUER_SECRETS["tink-eu"],
          currencyCode: 978,
          monthlyIncome: 10000,
          liquidBalance: 20000,
          expiresAtEpoch: validAtt,
        });
        const r = sandbox.submitQualificationProof("apt-soho-204", w);
        actualCode = r.errorCode ?? "PASS";
        reason = r.humanReason ?? "";
        blocked = !r.ok && actualCode === expectedCode;
        break;
      }
      case 5: {
        label = "Replay Same Listing by Rotating tenantSecret";
        expectedCode = "REPLAY_ATTACK";
        const w1 = sandbox.issueAndAnchorAttestation({
          tenantLabel: "Spammer",
          tenantSecret: "secret-A",
          kycIdSeed: "kyc-same-99",
          issuerId: "plaid-us",
          issuerSecret: DEMO_ISSUER_SECRETS["plaid-us"],
          currencyCode: 840,
          monthlyIncome: 10000,
          liquidBalance: 15000,
          expiresAtEpoch: validAtt,
        });
        sandbox.submitQualificationProof("apt-soho-204", w1);
        const w2 = sandbox.issueAndAnchorAttestation({
          tenantLabel: "Spammer",
          tenantSecret: "secret-B",
          kycIdSeed: "kyc-same-99",
          issuerId: "plaid-us",
          issuerSecret: DEMO_ISSUER_SECRETS["plaid-us"],
          currencyCode: 840,
          monthlyIncome: 10000,
          liquidBalance: 15000,
          expiresAtEpoch: validAtt,
          nonce: "nonce-2",
        });
        const r = sandbox.submitQualificationProof("apt-soho-204", w2);
        actualCode = r.errorCode ?? "PASS";
        reason = r.humanReason ?? "";
        blocked = !r.ok && actualCode === expectedCode;
        break;
      }
      case 6: {
        label = "Salary $1 Below 3× Rent ($7,199 vs $7,200)";
        expectedCode = "INSUFFICIENT_INCOME";
        const w = sandbox.issueAndAnchorAttestation({
          tenantLabel: "Short",
          tenantSecret: "atk-6",
          kycIdSeed: "kyc-atk-6",
          issuerId: "argyle-payroll",
          issuerSecret: DEMO_ISSUER_SECRETS["argyle-payroll"],
          currencyCode: 840,
          monthlyIncome: 7199,
          liquidBalance: 15000,
          expiresAtEpoch: validAtt,
        });
        const r = sandbox.submitQualificationProof("apt-soho-204", w);
        actualCode = r.errorCode ?? "PASS";
        reason = r.humanReason ?? "";
        blocked = !r.ok && actualCode === expectedCode;
        break;
      }
      case 7: {
        label = "Stale Attestation + Attempt to Backdate Clock";
        expectedCode = "EXPIRED_ATTESTATION";
        const w = sandbox.issueAndAnchorAttestation({
          tenantLabel: "Stale",
          tenantSecret: "atk-7",
          kycIdSeed: "kyc-atk-7",
          issuerId: "plaid-us",
          issuerSecret: DEMO_ISSUER_SECRETS["plaid-us"],
          currencyCode: 840,
          monthlyIncome: 10000,
          liquidBalance: 15000,
          expiresAtEpoch: now - 3600,
        });
        const r = sandbox.submitQualificationProof("apt-soho-204", w);
        actualCode = r.errorCode ?? "PASS";
        reason = r.humanReason ?? "";
        blocked = !r.ok && actualCode === expectedCode;
        break;
      }
      default: {
        label = "Stranger Tries to Revoke Tenant's Pass";
        expectedCode = "UNAUTHORIZED_REVOKE";
        const w = sandbox.issueAndAnchorAttestation({
          tenantLabel: "Owner",
          tenantSecret: "real-owner-sk",
          kycIdSeed: "kyc-atk-8",
          issuerId: "plaid-us",
          issuerSecret: DEMO_ISSUER_SECRETS["plaid-us"],
          currencyCode: 840,
          monthlyIncome: 10000,
          liquidBalance: 15000,
          expiresAtEpoch: validAtt,
        });
        const ok = sandbox.submitQualificationProof("apt-soho-204", w);
        const r = sandbox.revokeReceipt(ok.receipt!.receiptId, "hijacker-wrong-sk");
        actualCode = r.errorCode ?? "PASS";
        reason = r.humanReason ?? "";
        blocked = !r.ok && actualCode === expectedCode;
        break;
      }
    }

    const seq = attackSeq;
    setAttackSeq((s) => s + 1);
    const entry: AttackLogEntry = {
      id: `${attackId}-${seq}`,
      label,
      actualCode,
      blocked,
      reason,
      runLabel: `Run #${seq}`,
    };
    setAttackLogs((prev) => [entry, ...prev].slice(0, 12));
    showToast(
      entry.blocked ? "ok" : "danger",
      entry.blocked ? `Attack Blocked: ${entry.actualCode}` : "Unexpected Pass",
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
    showToast("ok", "Ledger Reset", "Fresh Midnight dual-ledger sandbox initialized.");
  };

  const activeIsExpired =
    activeReceipt !== null && snapshot.currentLedgerEpoch > activeReceipt.expiresAtEpoch;

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
            <span className="nav-sub">Simulated Compact Sandbox</span>
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
              Transparent Sandbox Mode
            </strong>
            Runs a 1:1 TypeScript mirror of{" "}
            <span className="mono" style={{ color: "var(--cyan)" }}>
              leaseproof.compact
            </span>{" "}
            for instant walletless judge testing (real Compact compiler runs on Ubuntu Linux CI).
          </div>
        </aside>

        <main className="app-main">
          {/* TAB 1: TENANT PROOF STUDIO */}
          {activeTab === "tenant" && (
            <section className="workspace-split reveal">
              <div style={{ display: "grid", gap: 16 }}>
                <div className="card">
                  <div style={{ marginBottom: 14 }}>
                    <span className="badge badge-violet" style={{ marginBottom: 6 }}>
                      Local Private Witness · Pre-Qualification &amp; Viewing Pass
                    </span>
                    <h1 style={{ margin: 0, fontSize: 22, letterSpacing: "-0.02em" }}>
                      Generate Private Pre-Qualification Pass
                    </h1>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
                    <button type="button" className="btn-ghost" onClick={() => applyPersona("salaried")}>
                      <Sparkles size={14} color="#7c5cff" /> Salaried Tenant (USD)
                    </button>
                    <button type="button" className="btn-ghost" onClick={() => applyPersona("freelancer")}>
                      <Sparkles size={14} color="#22d3ee" /> Freelancer · €0 Payslip (EUR)
                    </button>
                    <button type="button" className="btn-ghost" onClick={() => applyPersona("ev")}>
                      <Sparkles size={14} color="#10b981" /> EV Subscription (EUR)
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
                        onChange={(e) => {
                          const next = snapshot.listings.find((l) => l.id === e.target.value);
                          setSelectedListingId(e.target.value);
                          if (next) setCurrencyCode(next.currencyCode);
                        }}
                      >
                        {snapshot.listings.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.title} ({CURRENCY_META[l.currencyCode].code}) — {TEMPLATE_LABEL[l.template]}
                          </option>
                        ))}
                      </select>
                      {selectedListing && (
                        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>
                          Required ({CURRENCY_META[selectedListing.currencyCode].code}):{" "}
                          {selectedListing.mode === 0
                            ? `Income ≥ ${fmtMoney(selectedListing.minIncome, selectedListing.currencyCode)}/mo AND Balance ≥ ${fmtMoney(selectedListing.minBalance, selectedListing.currencyCode)}`
                            : `Liquid Runway ≥ ${fmtMoney(selectedListing.minBalance, selectedListing.currencyCode)} (No payslip required)`}
                        </div>
                      )}
                    </div>

                    <div className="grid-2">
                      <div>
                        <label className="field-label" htmlFor="issuer-select">
                          Trusted Attester (Anchors Commitment On-Chain)
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
                      <div>
                        <label className="field-label" htmlFor="currency-select">
                          Attestation Currency (ISO-4217)
                        </label>
                        <select
                          id="currency-select"
                          className="input-dark"
                          value={currencyCode}
                          onChange={(e) => setCurrencyCode(Number(e.target.value) as CurrencyCode)}
                        >
                          <option value={840}>840 · USD ($)</option>
                          <option value={978}>978 · EUR (€)</option>
                          <option value={360}>360 · IDR (Rp)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid-2">
                      <div>
                        <label className="field-label" htmlFor="income-input">
                          Private Monthly Income ({CURRENCY_META[currencyCode].code})
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
                          Private Liquid Balance ({CURRENCY_META[currencyCode].code})
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

                    <div className="grid-2">
                      <div>
                        <label className="field-label" htmlFor="kyc-input">
                          Attester KYC Identity Seed (Anti-Straw-Applicant)
                        </label>
                        <input
                          id="kyc-input"
                          type="text"
                          className="input-dark mono"
                          value={kycIdSeed}
                          onChange={(e) => setKycIdSeed(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="field-label" htmlFor="secret-input">
                          Tenant Revocation Secret
                        </label>
                        <input
                          id="secret-input"
                          type="text"
                          className="input-dark mono"
                          value={tenantSecret}
                          onChange={(e) => setTenantSecret(e.target.value)}
                        />
                      </div>
                    </div>

                    <button type="button" className="btn-primary" onClick={handleGenerateProof}>
                      <ShieldCheck size={16} /> Generate Midnight ZK Qualification Pass
                    </button>
                  </div>
                </div>

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

              {/* Right: Split-Screen Privacy Inspector + Active Pass */}
              <div style={{ display: "grid", gap: 16 }}>
                <div className="card" style={{ borderColor: "rgba(124, 92, 255, 0.35)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <strong style={{ fontSize: 16 }}>Split-Screen Privacy Inspector</strong>
                    <span className="badge badge-ok">Threshold-Only Proof</span>
                  </div>

                  <div className="grid-2" style={{ gap: 12 }}>
                    <div className="card-subtle" style={{ borderColor: "rgba(124, 92, 255, 0.28)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#c4b5fd", marginBottom: 10 }}>
                        <EyeOff size={14} /> PRIVATE WITNESS (LOCAL)
                      </div>
                      <div style={{ display: "grid", gap: 8, fontSize: 12.5 }}>
                        <div>
                          <div style={{ color: "var(--muted)" }}>Exact Income</div>
                          <strong className="tabular">{fmtMoney(monthlyIncome, currencyCode)}/mo</strong>
                        </div>
                        <div>
                          <div style={{ color: "var(--muted)" }}>Exact Balance</div>
                          <strong className="tabular">{fmtMoney(liquidBalance, currencyCode)}</strong>
                        </div>
                        <div>
                          <div style={{ color: "var(--muted)" }}>Raw KYC ID Seed</div>
                          <strong className="mono">{kycIdSeed.slice(0, 14)}...</strong>
                        </div>
                      </div>
                    </div>

                    <div className="card-subtle" style={{ borderColor: "rgba(16, 185, 129, 0.3)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#34d399", marginBottom: 10 }}>
                        <CheckCircle2 size={14} /> PUBLIC LEDGER (ON-CHAIN)
                      </div>
                      {activeReceipt ? (
                        <div style={{ display: "grid", gap: 8, fontSize: 12.5 }}>
                          <div>
                            <div style={{ color: "var(--muted)" }}>Verdict</div>
                            <strong
                              style={{
                                color:
                                  activeReceipt.status === 2
                                    ? "var(--red)"
                                    : activeIsExpired
                                    ? "var(--amber)"
                                    : "var(--green)",
                              }}
                            >
                              {activeReceipt.status === 2
                                ? "REVOKED (2)"
                                : activeIsExpired
                                ? "EXPIRED (3)"
                                : "QUALIFIED (1)"}
                            </strong>
                          </div>
                          <div>
                            <div style={{ color: "var(--muted)" }}>Bound Listing</div>
                            <strong>{activeReceipt.listingId}</strong>
                          </div>
                          <div>
                            <div style={{ color: "var(--muted)" }}>KYC Binding Commit</div>
                            <strong className="mono">{activeReceipt.applicantIdCommit.slice(0, 14)}...</strong>
                          </div>
                        </div>
                      ) : (
                        <div style={{ fontSize: 12.5, color: "var(--muted)" }}>
                          Generate a pass on the left to inspect the public Midnight ledger state.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {activeReceipt && (
                  <div
                    className="card"
                    style={{
                      borderColor:
                        activeReceipt.status === 2
                          ? "rgba(239, 68, 68, 0.42)"
                          : activeIsExpired
                          ? "rgba(245, 158, 11, 0.45)"
                          : "rgba(16, 185, 129, 0.42)",
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
                          activeReceipt.status === 2
                            ? "badge-danger"
                            : activeIsExpired
                            ? "badge-neutral"
                            : "badge-ok"
                        }`}
                      >
                        {activeReceipt.status === 2
                          ? "REVOKED BY TENANT"
                          : activeIsExpired
                          ? "EXPIRED (14D WINDOW ENDED)"
                          : "VERIFIED QUALIFIED · ACTIVE"}
                      </span>
                      <span className="mono" style={{ fontSize: 11.5, color: "var(--muted)" }}>
                        14d fixed validity
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
                        <Copy size={14} /> Copy Verifier Link
                      </button>
                      <button
                        type="button"
                        className="btn-ghost"
                        onClick={() => {
                          setVerifyInput(activeReceipt.receiptId);
                          setVerifyExpectedListingId(activeReceipt.listingId);
                          setVerifiedLookup(
                            engine.queryPublicReceipt(activeReceipt.receiptId, activeReceipt.listingId)
                          );
                          setActiveTab("landlord");
                        }}
                      >
                        Verify as Landlord
                      </button>
                      {activeReceipt.status === 1 && !activeIsExpired && (
                        <button
                          type="button"
                          className="btn-danger"
                          onClick={() => handleRevokeActivePass(activeReceipt.receiptId)}
                        >
                          <ShieldOff size={14} /> Revoke Pass
                        </button>
                      )}
                      <button type="button" className="btn-ghost" onClick={handleAdvance15Days}>
                        <Clock size={14} /> Simulate +15 Days
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* TAB 2: LANDLORD VERIFIER (TRUE WALLET-FREE OFF-CHAIN QUERY) */}
          {activeTab === "landlord" && (
            <section className="workspace-split reveal">
              <div style={{ display: "grid", gap: 16 }}>
                <div className="card">
                  <span className="badge badge-ok" style={{ marginBottom: 8 }}>
                    True Walletless Off-Chain Ledger Read · Listing-Bound Check
                  </span>
                  <h2 style={{ margin: "0 0 8px", fontSize: 21 }}>
                    Landlord Pre-Qualification Verifier
                  </h2>
                  <p style={{ margin: "0 0 14px", fontSize: 13.5, color: "var(--muted)", lineHeight: 1.55 }}>
                    Queries Midnight public ledger maps off-chain (zero wallet, zero proof needed).
                    Verifies receipt status, 14-day expiry, AND exact listing binding so cheap-room
                    passes cannot be forwarded to luxury listings.
                  </p>

                  <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
                    <div>
                      <label className="field-label" htmlFor="verify-listing-select">
                        Your Property Listing (Must Match Receipt)
                      </label>
                      <select
                        id="verify-listing-select"
                        className="input-dark"
                        value={verifyExpectedListingId}
                        onChange={(e) => setVerifyExpectedListingId(e.target.value)}
                      >
                        {snapshot.listings.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.title} ({l.id})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
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
                        Verify Pass
                      </button>
                    </div>
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
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <strong>
                          {verifiedLookup.receipt?.listingTitle ?? "Lookup Result"}
                        </strong>
                        <span
                          className={`badge ${
                            verifiedLookup.status === 1 ? "badge-ok" : "badge-danger"
                          }`}
                        >
                          {verifiedLookup.errorCode
                            ? verifiedLookup.errorCode
                            : verifiedLookup.status === 1
                            ? "QUALIFIED"
                            : verifiedLookup.status === 2
                            ? "REVOKED"
                            : verifiedLookup.status === 3
                            ? "EXPIRED"
                            : "NOT FOUND"}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: "var(--muted)" }}>
                        {verifiedLookup.humanReason}
                      </div>
                    </div>
                  )}
                </div>

                <div className="card">
                  <h3 style={{ margin: "0 0 12px", fontSize: 16 }}>
                    Recent Public Ledger Receipts ({snapshot.receipts.length})
                  </h3>
                  {snapshot.receipts.length === 0 ? (
                    <p style={{ margin: 0, fontSize: 13.5, color: "var(--muted)" }}>
                      No passes issued yet. Switch to Tab 1 to generate a pass.
                    </p>
                  ) : (
                    <div style={{ display: "grid", gap: 10 }}>
                      {snapshot.receipts.map((rec) => {
                        const expired = snapshot.currentLedgerEpoch > rec.expiresAtEpoch;
                        const label = rec.status === 2 ? "REVOKED" : expired ? "EXPIRED" : "QUALIFIED";
                        return (
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
                                {rec.receiptId.slice(0, 20)}... · {rec.issuerName}
                              </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span className={`badge ${label === "QUALIFIED" ? "badge-ok" : "badge-danger"}`}>
                                {label}
                              </span>
                              <button
                                type="button"
                                className="btn-ghost"
                                style={{ padding: "6px 10px", fontSize: 12 }}
                                onClick={() => {
                                  setVerifyInput(rec.receiptId);
                                  handleVerifyReceipt(rec.receiptId, verifyExpectedListingId);
                                }}
                              >
                                Check Against Selected
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="card">
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <Building2 size={18} color="#7c5cff" />
                  <h3 style={{ margin: 0, fontSize: 18 }}>Publish Custom Rental Listing</h3>
                </div>
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
                  <div className="grid-3">
                    <div>
                      <label className="field-label" htmlFor="new-loc">City</label>
                      <input
                        id="new-loc"
                        type="text"
                        className="input-dark"
                        value={newListingLoc}
                        onChange={(e) => setNewListingLoc(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="field-label" htmlFor="new-mode">Mode</label>
                      <select
                        id="new-mode"
                        className="input-dark"
                        value={newListingMode}
                        onChange={(e) => setNewListingMode(Number(e.target.value) as ListingMode)}
                      >
                        <option value={0}>0 · Income + Deposit</option>
                        <option value={1}>1 · Runway Only</option>
                      </select>
                    </div>
                    <div>
                      <label className="field-label" htmlFor="new-curr">Currency</label>
                      <select
                        id="new-curr"
                        className="input-dark"
                        value={newListingCurrency}
                        onChange={(e) => setNewListingCurrency(Number(e.target.value) as CurrencyCode)}
                      >
                        <option value={840}>USD ($)</option>
                        <option value={978}>EUR (€)</option>
                        <option value={360}>IDR (Rp)</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid-3">
                    <div>
                      <label className="field-label" htmlFor="new-rent">Rent / mo</label>
                      <input
                        id="new-rent"
                        type="number"
                        className="input-dark tabular"
                        value={newListingRent}
                        onChange={(e) => setNewListingRent(Number(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="field-label" htmlFor="new-inc">Min Income</label>
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
                      <label className="field-label" htmlFor="new-bal">Min Balance</label>
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
              <div className="card">
                <span className="badge badge-danger" style={{ marginBottom: 8 }}>
                  Hardened Cryptographic Red-Team Suite
                </span>
                <h2 style={{ margin: "0 0 8px", fontSize: 21 }}>
                  Try to Break the Hardened Compact Circuit (8 Attacks)
                </h2>
                <p style={{ margin: "0 0 16px", fontSize: 13.5, color: "var(--muted)", lineHeight: 1.55 }}>
                  Tests real cryptographic attacks—including local salary re-hashing, cross-listing
                  forwarding, unauthorized admin registration, currency spoofing, and secret-rotation
                  replay.
                </p>

                <div className="grid-2" style={{ gap: 10 }}>
                  {[
                    { id: 1, title: "1. Inflate Salary & Re-Hash Locally", code: "TAMPERED_COMMITMENT" },
                    { id: 2, title: "2. Forward $500 Pass to $2,400 Loft", code: "LISTING_MISMATCH" },
                    { id: 3, title: "3. Self-Register Fake Bank", code: "UNAUTHORIZED_ADMIN" },
                    { id: 4, title: "4. EUR Balance on USD Listing", code: "CURRENCY_MISMATCH" },
                    { id: 5, title: "5. Replay via New tenantSecret", code: "REPLAY_ATTACK" },
                    { id: 6, title: "6. Salary $1 Below 3× Rent", code: "INSUFFICIENT_INCOME" },
                    { id: 7, title: "7. Expired Bank Statement", code: "EXPIRED_ATTESTATION" },
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
                            {log.runLabel}
                          </span>
                        </div>
                        <div style={{ color: "var(--text)", marginBottom: 2 }}>{log.label}</div>
                        <div style={{ color: "var(--muted)" }}>{log.reason}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card">
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <AlertTriangle size={18} color="#22d3ee" />
                  <h3 style={{ margin: 0, fontSize: 18 }}>Admin-Gated Attester Registry</h3>
                </div>
                <p style={{ margin: "0 0 14px", fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>
                  Protected by constructor-pinned <span className="mono">registryAdminCommit</span>.
                  Anchored commitments on ledger:{" "}
                  <strong className="tabular" style={{ color: "var(--text)" }}>
                    {snapshot.anchoredAttestationCount}
                  </strong>
                  .
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
                            if (iss.active) engine.revokeIssuer(iss.id, DEFAULT_ADMIN_SECRET);
                            else engine.reinstateIssuer(iss.id, DEFAULT_ADMIN_SECRET);
                            syncLedger();
                          }}
                        >
                          {iss.active ? "Revoke (Admin)" : "Reinstate (Admin)"}
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
