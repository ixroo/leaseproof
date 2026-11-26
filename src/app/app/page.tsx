"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
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
  Wallet,
  XCircle,
} from "lucide-react";
import {
  connectMidnightLace,
  shortMidnightAddr,
  type LaceConnectionResult,
} from "@/lib/midnight/laceWallet";
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
import { CairnVerifier } from "@/components/CairnVerifier";

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
  APARTMENT: "Apartment / House",
  FREELANCER_COLIVING: "Freelancer Runway",
  VEHICLE_LEASE: "Vehicle Lease",
};

export default function LeaseProofWorkspacePage() {
  const [engine, setEngine] = useState(() => createSeededLeaseProofEngine(1_795_600_000));
  const [snapshot, setSnapshot] = useState<LedgerSnapshot>(() => engine.getSnapshot());
  const [activeTab, setActiveTab] = useState<RoleTab>("tenant");
  const [attackSeq, setAttackSeq] = useState(1);
  const [proofSeq, setProofSeq] = useState(0);

  // Tenant Studio form state (local private witnesses)
  const [selectedListingId, setSelectedListingId] = useState("apt-soho-204");
  const [selectedIssuerId, setSelectedIssuerId] = useState("argyle-payroll");
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>(840);
  const [tenantLabel, setTenantLabel] = useState("Maya (Senior Designer)");
  const [kycIdSeed, setKycIdSeed] = useState("kyc-maya-ssn-9042");
  const [tenantSecret, setTenantSecret] = useState("tenant-secret-maya-2026");
  const [monthlyIncome, setMonthlyIncome] = useState(9500);
  const [liquidBalance, setLiquidBalance] = useState(18000);
  const [lastResult, setLastResult] = useState<CircuitExecutionResult | null>(null);
  const [activeReceiptId, setActiveReceiptId] = useState<string | null>(null);

  // Landlord Verifier state
  const [verifyInput, setVerifyInput] = useState("");
  const [verifyExpectedListingId, setVerifyExpectedListingId] = useState("apt-soho-204");
  const [verifiedLookup, setVerifiedLookup] = useState<VerifyReceiptResult | null>(null);
  const [newListingTitle, setNewListingTitle] = useState("Shibuya Studio · 1K Minimalist");
  const [newListingLoc, setNewListingLoc] = useState("Tokyo");
  const [newListingMode, setNewListingMode] = useState<ListingMode>(0);
  const [newListingCurrency, setNewListingCurrency] = useState<CurrencyCode>(840);
  const [newListingRent, setNewListingRent] = useState(2100);
  const [newListingMinIncome, setNewListingMinIncome] = useState(6300);
  const [newListingMinBalance, setNewListingMinBalance] = useState(4200);

  // Attack Lab & Lace Wallet state
  const [attackLogs, setAttackLogs] = useState<AttackLogEntry[]>([]);
  const [laceWallet, setLaceWallet] = useState<LaceConnectionResult | null>(null);
  const [toast, setToast] = useState<{ tone: "ok" | "danger"; title: string; detail: string } | null>(null);

  const showToast = (tone: "ok" | "danger", title: string, detail: string, durationMs = 4200) => {
    setToast({ tone, title, detail });
    setTimeout(() => {
      setToast((cur) => (cur?.title === title ? null : cur));
    }, durationMs);
  };

  const handleConnectLace = async () => {
    const res = await connectMidnightLace();
    setLaceWallet(res);
    if (res.connected && res.address) {
      showToast(
        "ok",
        `${res.walletName ?? "Lace"} connected (${shortMidnightAddr(res.address)})`,
        res.proverServerUri
          ? `Midnight ${res.networkId ?? "preprod"} (v${res.apiVersion ?? "4"}) · Prover: ${res.proverServerUri}`
          : `Midnight DApp Connector v${res.apiVersion ?? "4"} (${res.networkId ?? "preprod"}) active.`,
        5200
      );
    } else if (res.cardanoOnlyDetected) {
      showToast(
        "ok",
        "Lace Detected (Cardano Mode)",
        res.error ?? "Switch or add a Midnight wallet in Lace, then press F5 to reload this tab.",
        7000
      );
    } else {
      showToast(
        "ok",
        "Walletless Sandbox Mode Active",
        res.error ?? "Lace extension not detected—test every circuit invariant instantly without a wallet.",
        6500
      );
    }
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
      setTenantLabel("Rafi (Indie Founder · €0 Payslip)");
      setKycIdSeed(`kyc-rafi-${uniq}`);
      setTenantSecret(`secret-rafi-${uniq}`);
      setMonthlyIncome(0);
      setLiquidBalance(14500);
    } else {
      setSelectedListingId("ev-fleet-model3");
      setSelectedIssuerId("plaid-us");
      setCurrencyCode(978);
      setTenantLabel("Sora (EV Lease Applicant)");
      setKycIdSeed(`kyc-sora-${uniq}`);
      setTenantSecret(`secret-sora-${uniq}`);
      setMonthlyIncome(5400);
      setLiquidBalance(9000);
    }
    setLastResult(null);
  };

  const resetLedger = () => {
    const fresh = createSeededLeaseProofEngine(1_795_600_000);
    setEngine(fresh);
    syncLedger(fresh);
    setActiveReceiptId(null);
    setLastResult(null);
    setVerifiedLookup(null);
    setVerifyInput("");
    setAttackLogs([]);
    showToast("ok", "Sandbox Reset", "Midnight public ledger restored to seeded Wave 3 state.");
  };

  const handleGenerateProof = () => {
    const issuerSecret = DEMO_ISSUER_SECRETS[selectedIssuerId] ?? "unregistered-secret";
    const now = engine.getCurrentEpoch();
    const witness = engine.issueAndAnchorAttestation({
      tenantLabel,
      tenantSecret: tenantSecret.trim() || "tenant-secret-default",
      kycIdSeed: kycIdSeed.trim() || "kyc-default",
      issuerId: selectedIssuerId,
      issuerSecret,
      currencyCode,
      monthlyIncome,
      liquidBalance,
      expiresAtEpoch: now + 86400 * 30,
    });
    const res = engine.submitQualificationProof(selectedListingId, witness);
    setLastResult(res);
    syncLedger();

    if (res.ok && res.receipt) {
      setProofSeq((n) => n + 1);
      setActiveReceiptId(res.receipt.receiptId);
      setVerifyInput(res.receipt.receiptId);
      setVerifyExpectedListingId(res.receipt.listingId);
      setVerifiedLookup(engine.queryPublicReceipt(res.receipt.receiptId, res.receipt.listingId));
      showToast(
        "ok",
        "Viewing Pass Issued",
        "Issuer-anchored commitment verified. Exact salary and balance stay local."
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
        "Viewing Pass Revoked",
        "Ledger status flipped to REVOKED (2). Brokers can no longer verify this pass."
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
      "Ledger Epoch Advanced +15 Days",
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
      showToast("ok", "Listing Published", `${res.listing.title} is now live in Tenant Studio.`);
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
    showToast("ok", "Shareable Verifier Link Copied", "Works across any browser without a wallet.");
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
    setAttackLogs((prev) => [entry, ...prev].slice(0, 8));
    showToast(blocked ? "ok" : "danger", `Blocked (${actualCode})`, reason);
  };

  const activeIsExpired =
    activeReceipt !== null && snapshot.currentLedgerEpoch > activeReceipt.expiresAtEpoch;

  return (
    <>
      {/* Obsidian Studio Top Header */}
      <header className="site-header-noir site-header-wide">
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
            <span className="hide-sm" style={{ color: "var(--bone-muted)", fontWeight: 500, fontSize: 13.5 }}>
              Compact Sandbox
            </span>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              className="tabular hide-sm"
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                color: "#5eead4",
                padding: "5px 11px",
                borderRadius: 999,
                background: "rgba(20, 184, 166, 0.14)",
                border: "1px solid rgba(94, 234, 212, 0.3)",
              }}
            >
              {snapshot.totalVerifiedPasses} verified{" "}
              {snapshot.totalVerifiedPasses === 1 ? "pass" : "passes"}
            </span>
            <button
              type="button"
              className={laceWallet?.connected ? "btn-liquid-glass" : "btn-noir-ghost"}
              style={{ minHeight: 38, padding: "0 13px", fontSize: 13 }}
              onClick={handleConnectLace}
              title="Connect Midnight Lace Wallet (DApp Connector API)"
            >
              <Wallet size={14} />
              {laceWallet?.connected && laceWallet.address
                ? shortMidnightAddr(laceWallet.address)
                : "Connect Lace"}
            </button>
            <Link
              href="/deck"
              className="btn-noir-ghost hide-sm"
              style={{ minHeight: 38, padding: "0 12px", fontSize: 13 }}
            >
              <Presentation size={14} /> Deck
            </Link>
            <button
              type="button"
              className="btn-noir-ghost"
              style={{ minHeight: 38, padding: "0 12px", fontSize: 13 }}
              onClick={resetLedger}
              title="Reset sandbox ledger"
              aria-label="Reset sandbox"
            >
              <RotateCcw size={13} /> <span className="hide-sm">Reset</span>
            </button>
          </div>
        </div>

        {/* Always-Visible Liquid Glass Role Switcher Bar (Works on 1440px, 1115px, 768px & 390px!) */}
        <div
          style={{
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            background: "rgba(16, 18, 23, 0.92)",
          }}
        >
          <div
            className="site-header-inner"
            style={{ height: "auto", paddingTop: 10, paddingBottom: 10, flexWrap: "wrap", gap: 12 }}
          >
            <div className="glass-tab-track" role="tablist" aria-label="LeaseProof workspace roles">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "tenant"}
                className={`glass-tab-btn ${activeTab === "tenant" ? "is-active" : ""}`}
                onClick={() => setActiveTab("tenant")}
              >
                <KeyRound size={15} /> Tenant Studio
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "landlord"}
                className={`glass-tab-btn ${activeTab === "landlord" ? "is-active" : ""}`}
                onClick={() => setActiveTab("landlord")}
              >
                <UserCheck size={15} /> Landlord Verifier
                <span className="mono tabular" style={{ fontSize: 11.5, opacity: 0.75 }}>
                  ({snapshot.receipts.length})
                </span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "attacks"}
                className={`glass-tab-btn ${activeTab === "attacks" ? "is-active" : ""}`}
                onClick={() => setActiveTab("attacks")}
              >
                <ShieldAlert size={15} /> Attack &amp; Attester Lab
              </button>
            </div>

            <span className="mono hide-sm" style={{ fontSize: 12, color: "var(--bone-muted)" }}>
              1:1 Browser Mirror · contracts/leaseproof.compact (Compact 0.36.1)
            </span>
          </div>
        </div>
      </header>

      <main className="container-wide" style={{ paddingTop: 32, paddingBottom: 80 }}>
        {/* TAB 1: TENANT PROOF STUDIO */}
        {activeTab === "tenant" && (
          <section className="workspace-grid">
            {/* Left Sheet: Local Private Witness Inputs */}
            <div style={{ display: "grid", gap: 20 }}>
              <div className="sheet">
                <div style={{ marginBottom: 20 }}>
                  <h1 className="display-sub" style={{ marginBottom: 6 }}>
                    Issue a Private Viewing Pass
                  </h1>
                  <p style={{ margin: 0, fontSize: 14.5, color: "var(--ink-secondary)" }}>
                    Your financial inputs stay strictly on your device as local Compact witnesses.
                  </p>
                </div>

                {/* One-Click Realistic Personas */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
                  <button type="button" className="btn-secondary btn-sm" onClick={() => applyPersona("salaried")}>
                    <Sparkles size={13} color="var(--teal)" /> Salaried Tenant (USD)
                  </button>
                  <button type="button" className="btn-secondary btn-sm" onClick={() => applyPersona("freelancer")}>
                    <Sparkles size={13} color="var(--teal)" /> Freelancer · €0 Payslip
                  </button>
                  <button type="button" className="btn-secondary btn-sm" onClick={() => applyPersona("ev")}>
                    <Sparkles size={13} color="var(--teal)" /> EV Lease (EUR)
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 16 }}>
                  <div style={{ minWidth: 0 }}>
                    <label className="field-label" htmlFor="listing-select">
                      Target Property / Lease Listing
                    </label>
                    <select
                      id="listing-select"
                      className="input-field"
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
                      <div style={{ fontSize: 12.5, color: "var(--ink-muted)", marginTop: 6 }}>
                        Required ({CURRENCY_META[selectedListing.currencyCode].code}):{" "}
                        {selectedListing.mode === 0
                          ? `Income >= ${fmtMoney(selectedListing.minIncome, selectedListing.currencyCode)}/mo and Balance >= ${fmtMoney(selectedListing.minBalance, selectedListing.currencyCode)}`
                          : `Liquid Runway >= ${fmtMoney(selectedListing.minBalance, selectedListing.currencyCode)} (No payslip required)`}
                      </div>
                    )}
                  </div>

                  <div className="grid-2" style={{ alignItems: "end" }}>
                    <div>
                      <label className="field-label" htmlFor="issuer-select">
                        Verified Bank / Payroll Attester
                      </label>
                      <select
                        id="issuer-select"
                        className="input-field"
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
                        Currency (ISO-4217)
                      </label>
                      <select
                        id="currency-select"
                        className="input-field"
                        value={currencyCode}
                        onChange={(e) => setCurrencyCode(Number(e.target.value) as CurrencyCode)}
                      >
                        <option value={840}>840 · USD ($)</option>
                        <option value={978}>978 · EUR (€)</option>
                        <option value={360}>360 · IDR (Rp)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid-2" style={{ alignItems: "end" }}>
                    <div>
                      <label className="field-label" htmlFor="income-input">
                        Private Monthly Income ({CURRENCY_META[currencyCode].code})
                      </label>
                      <input
                        id="income-input"
                        type="number"
                        className="input-field tabular"
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
                        className="input-field tabular"
                        value={liquidBalance}
                        onChange={(e) => setLiquidBalance(Math.max(0, Number(e.target.value) || 0))}
                      />
                    </div>
                  </div>

                  <div className="grid-2" style={{ alignItems: "end" }}>
                    <div>
                      <label className="field-label" htmlFor="kyc-input">
                        Identity Binding Seed
                      </label>
                      <input
                        id="kyc-input"
                        type="text"
                        className="input-field mono"
                        value={kycIdSeed}
                        onChange={(e) => setKycIdSeed(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="field-label" htmlFor="secret-input">
                        Pass Revocation Secret
                      </label>
                      <input
                        id="secret-input"
                        type="text"
                        className="input-field mono"
                        value={tenantSecret}
                        onChange={(e) => setTenantSecret(e.target.value)}
                      />
                    </div>
                  </div>

                  <button type="button" className="btn-primary" onClick={handleGenerateProof} style={{ marginTop: 4 }}>
                    <ShieldCheck size={16} /> Generate Midnight ZK Qualification Pass
                  </button>
                </div>
              </div>

              {lastResult && !lastResult.ok && (
                <div
                  className="sheet-tight"
                  style={{
                    borderColor: "var(--vermilion-border)",
                    background: "var(--vermilion-soft)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--vermilion)", marginBottom: 4 }}>
                    <XCircle size={17} />
                    <strong>Compact Circuit Refused: {lastResult.errorCode}</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: 13.5, color: "var(--ink-secondary)" }}>
                    {lastResult.humanReason}
                  </p>
                </div>
              )}
            </div>

            {/* Right Column: Physical Viewing Pass + Split-Screen Privacy Inspector */}
            <div style={{ display: "grid", gap: 20 }}>
              {activeReceipt ? (
                <div className="viewing-pass">
                  <div className="viewing-pass-head">
                    <div>
                      <div style={{ fontSize: 12, color: "var(--ink-muted)", marginBottom: 4 }}>
                        Issued Viewing Pass · 14-day validity
                      </div>
                      <h2 className="display-sub" style={{ fontSize: 20 }}>
                        {activeReceipt.listingTitle}
                      </h2>
                      <div style={{ fontSize: 13, color: "var(--ink-secondary)", marginTop: 2 }}>
                        Verified by {activeReceipt.issuerName}
                      </div>
                    </div>

                    <CairnVerifier
                      triggerKey={`${activeReceipt.receiptId}-${proofSeq}-${activeReceipt.status}-${activeIsExpired}`}
                      isQualified={activeReceipt.status === 1 && !activeIsExpired}
                      statusLabel={
                        activeReceipt.status === 2
                          ? "REVOKED (2)"
                          : activeIsExpired
                            ? "EXPIRED (3)"
                            : "QUALIFIED (1)"
                      }
                    />
                  </div>

                  <div className="viewing-pass-tear" />

                  <div className="viewing-pass-body" style={{ display: "grid", gap: 14 }}>
                    <div>
                      <div style={{ fontSize: 11.5, color: "var(--ink-muted)", marginBottom: 2 }}>
                        Listing-bound Receipt ID
                      </div>
                      <div className="mono" style={{ fontSize: 12, color: "var(--ink)", wordBreak: "break-all" }}>
                        {activeReceipt.receiptId}
                      </div>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      <button
                        type="button"
                        className="btn-secondary btn-sm"
                        onClick={() => copyVerifierUrl(activeReceipt)}
                      >
                        <Copy size={13} /> Copy Verifier Link
                      </button>
                      <button
                        type="button"
                        className="btn-teal btn-sm"
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
                          className="btn-danger btn-sm"
                          onClick={() => handleRevokeActivePass(activeReceipt.receiptId)}
                        >
                          <ShieldOff size={13} /> Revoke Pass
                        </button>
                      )}
                      <button type="button" className="btn-secondary btn-sm" onClick={handleAdvance15Days}>
                        <Clock size={13} /> Simulate +15 Days
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="viewing-pass"
                  style={{
                    borderStyle: "dashed",
                    background: "var(--surface-tint)",
                    boxShadow: "none",
                  }}
                >
                  <div className="viewing-pass-head">
                    <div>
                      <div style={{ fontSize: 12, color: "var(--ink-muted)", marginBottom: 4 }}>
                        Viewing Pass Preview · Ready to prove
                      </div>
                      <h2 className="display-sub" style={{ fontSize: 19 }}>
                        {selectedListing?.title ?? "Select a listing"}
                      </h2>
                      <div style={{ fontSize: 13, color: "var(--ink-secondary)", marginTop: 2 }}>
                        Attester:{" "}
                        {snapshot.issuers.find((i) => i.id === selectedIssuerId)?.name ?? selectedIssuerId}
                      </div>
                    </div>
                    <span className="status-tag status-neutral">Unissued</span>
                  </div>

                  <div className="viewing-pass-tear" />

                  <div className="viewing-pass-body" style={{ display: "grid", gap: 8 }}>
                    <div style={{ fontSize: 13, color: "var(--ink-secondary)", lineHeight: 1.5 }}>
                      Click <strong>Generate Midnight ZK Qualification Pass</strong> on the left to bind a
                      14-day proof to <span className="mono">{selectedListing?.id}</span>. Your exact income
                      and bank balance never leave this browser.
                    </div>
                  </div>
                </div>
              )}

              {/* Split-Screen Privacy Audit (Zero Card-in-Card: Single Sheet divided cleanly!) */}
              <div className="sheet">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>
                  <strong style={{ fontFamily: "var(--font-display)", fontSize: 17 }}>
                    Split-Screen Privacy Inspector
                  </strong>
                  <span className="status-tag status-teal">Zero raw values disclosed</span>
                </div>

                <div className="inspector-split">
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 700, color: "var(--ink)", marginBottom: 12 }}>
                      <EyeOff size={14} /> Stays Local (Private Witness)
                    </div>
                    <div className="ledger-row">
                      <span style={{ fontSize: 13, color: "var(--ink-muted)", flexShrink: 0 }}>Exact income</span>
                      <strong className="tabular" style={{ fontSize: 13.5, textAlign: "right" }}>
                        {fmtMoney(monthlyIncome, currencyCode)}/mo
                      </strong>
                    </div>
                    <div className="ledger-row">
                      <span style={{ fontSize: 13, color: "var(--ink-muted)", flexShrink: 0 }}>Exact balance</span>
                      <strong className="tabular" style={{ fontSize: 13.5, textAlign: "right" }}>
                        {fmtMoney(liquidBalance, currencyCode)}
                      </strong>
                    </div>
                    <div className="ledger-row">
                      <span style={{ fontSize: 13, color: "var(--ink-muted)", flexShrink: 0 }}>KYC seed</span>
                      <span
                        className="mono"
                        style={{
                          fontSize: 12,
                          minWidth: 0,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          textAlign: "right",
                        }}
                        title={kycIdSeed}
                      >
                        {kycIdSeed}
                      </span>
                    </div>
                  </div>

                  <div className="inspector-right">
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 700, color: "var(--teal)", marginBottom: 12 }}>
                      <CheckCircle2 size={14} /> Published to Midnight Ledger
                    </div>
                    {activeReceipt ? (
                      <>
                        <div className="ledger-row">
                          <span style={{ fontSize: 13, color: "var(--ink-muted)", flexShrink: 0 }}>Verdict</span>
                          <strong
                            style={{
                              fontSize: 13.5,
                              color:
                                activeReceipt.status === 2
                                  ? "var(--vermilion)"
                                  : activeIsExpired
                                    ? "var(--ochre)"
                                    : "var(--teal)",
                            }}
                          >
                            {activeReceipt.status === 2
                              ? "REVOKED (2)"
                              : activeIsExpired
                                ? "EXPIRED (3)"
                                : "QUALIFIED (1)"}
                          </strong>
                        </div>
                        <div className="ledger-row">
                          <span style={{ fontSize: 13, color: "var(--ink-muted)", flexShrink: 0 }}>Bound listing</span>
                          <span className="mono" style={{ fontSize: 12.5, textAlign: "right" }}>{activeReceipt.listingId}</span>
                        </div>
                        <div className="ledger-row">
                          <span style={{ fontSize: 13, color: "var(--ink-muted)", flexShrink: 0 }}>KYC commit</span>
                          <span
                            className="mono"
                            style={{
                              fontSize: 12,
                              minWidth: 0,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              textAlign: "right",
                            }}
                          >
                            {activeReceipt.applicantIdCommit.slice(0, 14)}...
                          </span>
                        </div>
                      </>
                    ) : (
                      <p style={{ margin: 0, fontSize: 13.5, color: "var(--ink-muted)", lineHeight: 1.55 }}>
                        Generate a pass on the left to inspect what hits the Midnight ledger versus
                        what stays sealed on your device.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TAB 2: LANDLORD VERIFIER (WALLETLESS OFF-CHAIN LEDGER READ) */}
        {activeTab === "landlord" && (
          <section className="workspace-grid">
            <div style={{ display: "grid", gap: 20 }}>
              <div className="sheet">
                <div style={{ marginBottom: 18 }}>
                  <h2 className="display-sub" style={{ marginBottom: 6 }}>
                    Walletless Landlord Verifier
                  </h2>
                  <p style={{ margin: 0, fontSize: 14.5, color: "var(--ink-secondary)" }}>
                    Reads Midnight public ledger maps off-chain with zero wallet. Verifies status,
                    14-day expiry, and strict listing binding so cheap-room passes cannot be
                    forwarded to luxury apartments.
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 14, marginBottom: 16 }}>
                  <div style={{ minWidth: 0 }}>
                    <label className="field-label" htmlFor="verify-listing-select">
                      Your Property Listing (Must Match Receipt)
                    </label>
                    <select
                      id="verify-listing-select"
                      className="input-field"
                      value={verifyExpectedListingId}
                      onChange={(e) => {
                        setVerifyExpectedListingId(e.target.value);
                        setVerifiedLookup(null);
                      }}
                    >
                      {snapshot.listings.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.title} ({l.id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <input
                      type="text"
                      className="input-field mono"
                      style={{ flex: 1, minWidth: 220, fontSize: 13 }}
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
                    style={{
                      padding: "16px 18px",
                      borderRadius: 12,
                      background:
                        verifiedLookup.status === 1 ? "var(--teal-soft)" : "var(--vermilion-soft)",
                      border: `1px solid ${
                        verifiedLookup.status === 1 ? "var(--teal-border)" : "var(--vermilion-border)"
                      }`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 6,
                      }}
                    >
                      <strong>{verifiedLookup.receipt?.listingTitle ?? "Lookup Result"}</strong>
                      <span
                        className={`status-tag ${
                          verifiedLookup.status === 1 ? "status-teal" : "status-danger"
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
                    <div style={{ fontSize: 13.5, color: "var(--ink-secondary)" }}>
                      {verifiedLookup.humanReason}
                    </div>
                  </div>
                )}
              </div>

              <div className="sheet">
                <h3 className="display-sub" style={{ fontSize: 17, marginBottom: 14 }}>
                  Recent Public Ledger Receipts ({snapshot.receipts.length})
                </h3>
                {snapshot.receipts.length === 0 ? (
                  <p style={{ margin: 0, fontSize: 14, color: "var(--ink-muted)" }}>
                    No passes issued yet. Switch to Tenant Studio to generate a pass.
                  </p>
                ) : (
                  <div>
                    {snapshot.receipts.map((rec) => {
                      const expired = snapshot.currentLedgerEpoch > rec.expiresAtEpoch;
                      const label = rec.status === 2 ? "REVOKED" : expired ? "EXPIRED" : "QUALIFIED";
                      return (
                        <div key={rec.receiptId} className="ledger-row" style={{ flexWrap: "wrap" }}>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <strong style={{ fontSize: 14 }}>{rec.listingTitle}</strong>
                            <div className="mono" style={{ fontSize: 12, color: "var(--ink-muted)" }}>
                              {rec.receiptId.slice(0, 20)}... · {rec.issuerName}
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span className={`status-tag ${label === "QUALIFIED" ? "status-teal" : "status-danger"}`}>
                              {label}
                            </span>
                            <button
                              type="button"
                              className="btn-secondary btn-sm"
                              onClick={() => {
                                setVerifyInput(rec.receiptId);
                                handleVerifyReceipt(rec.receiptId, verifyExpectedListingId);
                              }}
                            >
                              Check selected
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="sheet">
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 16 }}>
                <Building2 size={18} color="var(--teal)" />
                <h3 className="display-sub" style={{ fontSize: 19 }}>
                  Publish Custom Rental Listing
                </h3>
              </div>

              <div style={{ display: "grid", gap: 14 }}>
                <div>
                  <label className="field-label" htmlFor="new-title">
                    Listing Title
                  </label>
                  <input
                    id="new-title"
                    type="text"
                    className="input-field"
                    value={newListingTitle}
                    onChange={(e) => setNewListingTitle(e.target.value)}
                  />
                </div>
                <div className="grid-3" style={{ alignItems: "end" }}>
                  <div>
                    <label className="field-label" htmlFor="new-loc">
                      City
                    </label>
                    <input
                      id="new-loc"
                      type="text"
                      className="input-field"
                      value={newListingLoc}
                      onChange={(e) => setNewListingLoc(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="new-mode">
                      Mode
                    </label>
                    <select
                      id="new-mode"
                      className="input-field"
                      value={newListingMode}
                      onChange={(e) => setNewListingMode(Number(e.target.value) as ListingMode)}
                    >
                      <option value={0}>Income + Deposit</option>
                      <option value={1}>Runway Only</option>
                    </select>
                  </div>
                  <div>
                    <label className="field-label" htmlFor="new-curr">
                      Currency
                    </label>
                    <select
                      id="new-curr"
                      className="input-field"
                      value={newListingCurrency}
                      onChange={(e) => setNewListingCurrency(Number(e.target.value) as CurrencyCode)}
                    >
                      <option value={840}>USD ($)</option>
                      <option value={978}>EUR (€)</option>
                      <option value={360}>IDR (Rp)</option>
                    </select>
                  </div>
                </div>
                <div className="grid-3" style={{ alignItems: "end" }}>
                  <div>
                    <label className="field-label" htmlFor="new-rent">
                      Rent / mo
                    </label>
                    <input
                      id="new-rent"
                      type="number"
                      className="input-field tabular"
                      value={newListingRent}
                      onChange={(e) => setNewListingRent(Number(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="new-inc">
                      Min Income
                    </label>
                    <input
                      id="new-inc"
                      type="number"
                      className="input-field tabular"
                      disabled={newListingMode === 1}
                      value={newListingMode === 1 ? 0 : newListingMinIncome}
                      onChange={(e) => setNewListingMinIncome(Number(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="new-bal">
                      Min Balance
                    </label>
                    <input
                      id="new-bal"
                      type="number"
                      className="input-field tabular"
                      value={newListingMinBalance}
                      onChange={(e) => setNewListingMinBalance(Number(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <button type="button" className="btn-primary" onClick={handleCreateListing} style={{ marginTop: 4 }}>
                  <PlusCircle size={15} /> Publish Listing to Ledger
                </button>
              </div>
            </div>
          </section>
        )}

        {/* TAB 3: ATTACK & ATTESTER LAB */}
        {activeTab === "attacks" && (
          <section className="workspace-grid">
            <div className="sheet">
              <div style={{ marginBottom: 18 }}>
                <h2 className="display-sub" style={{ marginBottom: 6 }}>
                  Red-Team Cryptographic Attack Lab (8 Attacks)
                </h2>
                <p style={{ margin: 0, fontSize: 14.5, color: "var(--ink-secondary)" }}>
                  Trigger real fraud attacks in one click—including local salary re-hashing,
                  cross-listing forwarding, unauthorized admin registration, currency spoofing, and
                  secret-rotation replay.
                </p>
              </div>

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
                      gap: 3,
                      padding: "12px 14px",
                      width: "100%",
                      whiteSpace: "normal",
                      textAlign: "left",
                      minHeight: 62,
                    }}
                    onClick={() => runAdversarialAttack(atk.id)}
                  >
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--vermilion)" }}>
                      {atk.title}
                    </span>
                    <span className="mono" style={{ fontSize: 11.5, color: "var(--ink-secondary)" }}>
                      assert → {atk.code}
                    </span>
                  </button>
                ))}
              </div>

              {attackLogs.length > 0 && (
                <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid var(--rule)" }}>
                  <strong style={{ display: "block", fontSize: 14, marginBottom: 10 }}>
                    Live Rejection Log
                  </strong>
                  {attackLogs.map((log) => (
                    <div key={log.id} className="ledger-row" style={{ flexDirection: "column", alignItems: "stretch", gap: 4 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                        <strong className="mono" style={{ fontSize: 12.5, color: "var(--vermilion)" }}>
                          BLOCKED · {log.actualCode}
                        </strong>
                        <span className="tabular" style={{ fontSize: 12, color: "var(--ink-muted)" }}>
                          {log.runLabel}
                        </span>
                      </div>
                      <div style={{ fontSize: 13.5, fontWeight: 600 }}>{log.label}</div>
                      <div style={{ fontSize: 13, color: "var(--ink-secondary)" }}>{log.reason}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="sheet">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <AlertTriangle size={18} color="var(--teal)" />
                <h3 className="display-sub" style={{ fontSize: 19 }}>
                  Admin-Gated Attester Registry
                </h3>
              </div>
              <p style={{ margin: "0 0 18px", fontSize: 14, color: "var(--ink-secondary)" }}>
                Protected by constructor-pinned <span className="mono">registryAdminCommit</span>.
                Anchored commitments on ledger:{" "}
                <strong className="tabular" style={{ color: "var(--ink)" }}>
                  {snapshot.anchoredAttestationCount}
                </strong>
                .
              </p>

              <div>
                {snapshot.issuers.map((iss) => (
                  <div key={iss.id} className="ledger-row">
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <strong
                        style={{
                          fontSize: 14.5,
                          display: "block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {iss.name}
                      </strong>
                      <div style={{ fontSize: 12.5, color: "var(--ink-muted)" }}>
                        {iss.providerType} · <span className="mono">{iss.id}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      <span className={`status-tag ${iss.active ? "status-teal" : "status-danger"}`}>
                        {iss.active ? "Active" : "Revoked"}
                      </span>
                      <button
                        type="button"
                        className={iss.active ? "btn-danger btn-sm" : "btn-secondary btn-sm"}
                        onClick={() => {
                          if (iss.active) engine.revokeIssuer(iss.id, DEFAULT_ADMIN_SECRET);
                          else engine.reinstateIssuer(iss.id, DEFAULT_ADMIN_SECRET);
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

      {toast && (
        <div
          className="toast-banner"
          role="status"
          style={{
            borderColor:
              toast.tone === "ok" ? "rgba(94, 234, 212, 0.45)" : "rgba(248, 113, 113, 0.5)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div>
              <strong
                style={{
                  display: "block",
                  fontSize: 13.5,
                  color: toast.tone === "ok" ? "#5eead4" : "#fca5a5",
                  marginBottom: 3,
                }}
              >
                {toast.title}
              </strong>
              <span style={{ fontSize: 12.5, color: "var(--bone-muted)", lineHeight: 1.45, display: "block" }}>
                {toast.detail}
              </span>
            </div>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => setToast(null)}
              style={{
                background: "transparent",
                border: 0,
                color: "var(--bone-muted)",
                cursor: "pointer",
                padding: "2px 4px",
                fontSize: 16,
                lineHeight: 1,
                flexShrink: 0,
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}
