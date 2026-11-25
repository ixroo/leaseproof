// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";
import {
  computeAttestationCommitment,
  createSeededLeaseProofEngine,
  DEFAULT_ADMIN_SECRET,
  DEMO_ISSUER_SECRETS,
  deriveIssuerKeyCommit,
  PASS_VALIDITY_SEC,
} from "../leaseproofEngine";

const NOW = 1_795_600_000;
const VALID_ATT_EXPIRY = NOW + 86_400 * 30;

describe("LeaseProof Hardened Compact Engine — Honest Flows & Re-Apply Window", () => {
  it("1. Qualifies salaried tenant for USD Apartment (mode 0) & verifies listing-bound receipt", () => {
    const engine = createSeededLeaseProofEngine(NOW);
    const witness = engine.issueAndAnchorAttestation({
      tenantLabel: "Maya",
      tenantSecret: "secret-maya-1",
      kycIdSeed: "kyc-maya-ssn-9921",
      issuerId: "argyle-payroll",
      issuerSecret: DEMO_ISSUER_SECRETS["argyle-payroll"],
      currencyCode: 840,
      monthlyIncome: 9500,
      liquidBalance: 18000,
      expiresAtEpoch: VALID_ATT_EXPIRY,
    });

    const res = engine.submitQualificationProof("apt-soho-204", witness);
    expect(res.ok).toBe(true);
    expect(res.receipt?.expiresAtEpoch).toBe(NOW + PASS_VALIDITY_SEC);

    const verify = engine.queryPublicReceipt(res.receipt!.receiptId, "apt-soho-204");
    expect(verify.status).toBe(1);
  });

  it("2. Qualifies freelancer with €0 payslip for EUR Co-Living Runway (mode 1)", () => {
    const engine = createSeededLeaseProofEngine(NOW);
    const witness = engine.issueAndAnchorAttestation({
      tenantLabel: "Rafi",
      tenantSecret: "secret-rafi-1",
      kycIdSeed: "kyc-rafi-passport-441",
      issuerId: "tink-eu",
      issuerSecret: DEMO_ISSUER_SECRETS["tink-eu"],
      currencyCode: 978,
      monthlyIncome: 0,
      liquidBalance: 14500,
      expiresAtEpoch: VALID_ATT_EXPIRY,
    });

    const res = engine.submitQualificationProof("coliving-lisbon-09", witness);
    expect(res.ok).toBe(true);
    expect(res.receipt?.currencyCode).toBe(978);
    expect(res.receipt?.listingMode).toBe(1);
  });

  it("3. Qualifies applicant for EUR EV Lease (mode 0) & allows same tenant across multiple listings", () => {
    const engine = createSeededLeaseProofEngine(NOW);
    const witness = engine.issueAndAnchorAttestation({
      tenantLabel: "Lukas",
      tenantSecret: "secret-lukas-1",
      kycIdSeed: "kyc-lukas-de-108",
      issuerId: "tink-eu",
      issuerSecret: DEMO_ISSUER_SECRETS["tink-eu"],
      currencyCode: 978,
      monthlyIncome: 4200,
      liquidBalance: 12000,
      expiresAtEpoch: VALID_ATT_EXPIRY,
    });

    const r1 = engine.submitQualificationProof("ev-fleet-model3", witness);
    const r2 = engine.submitQualificationProof("coliving-lisbon-09", witness);
    expect(r1.ok).toBe(true);
    expect(r2.ok).toBe(true);
    expect(r1.receipt!.nullifier).not.toBe(r2.receipt!.nullifier);
  });

  it("4. Marks pass EXPIRED (3) after 14 days via on-chain epoch advance AND lets tenant re-apply in next window", () => {
    const engine = createSeededLeaseProofEngine(NOW);
    const witness = engine.issueAndAnchorAttestation({
      tenantLabel: "Elena",
      tenantSecret: "secret-elena-1",
      kycIdSeed: "kyc-elena-us-552",
      issuerId: "plaid-us",
      issuerSecret: DEMO_ISSUER_SECRETS["plaid-us"],
      currencyCode: 840,
      monthlyIncome: 8500,
      liquidBalance: 12000,
      expiresAtEpoch: NOW + PASS_VALIDITY_SEC * 3,
    });

    const first = engine.submitQualificationProof("apt-soho-204", witness);
    expect(first.ok).toBe(true);

    // Advance on-chain epoch past 14-day window
    const adv = engine.advanceEpoch(NOW + PASS_VALIDITY_SEC + 10, DEFAULT_ADMIN_SECRET);
    expect(adv.ok).toBe(true);

    // Old pass is now EXPIRED (status 3)
    const checkOld = engine.queryPublicReceipt(first.receipt!.receiptId, "apt-soho-204");
    expect(checkOld.status).toBe(3);

    // Tenant can cleanly re-apply in the new 14-day window!
    const second = engine.submitQualificationProof("apt-soho-204", witness);
    expect(second.ok).toBe(true);
    expect(second.receipt!.receiptId).not.toBe(first.receipt!.receiptId);
  });

  it("5. Allows tenant to revoke their own pass via revokeReceipt()", () => {
    const engine = createSeededLeaseProofEngine(NOW);
    const witness = engine.issueAndAnchorAttestation({
      tenantLabel: "Maya",
      tenantSecret: "secret-revoke-owner",
      kycIdSeed: "kyc-maya-rev",
      issuerId: "plaid-us",
      issuerSecret: DEMO_ISSUER_SECRETS["plaid-us"],
      currencyCode: 840,
      monthlyIncome: 9000,
      liquidBalance: 10000,
      expiresAtEpoch: VALID_ATT_EXPIRY,
    });

    const sub = engine.submitQualificationProof("apt-soho-204", witness);
    expect(sub.ok).toBe(true);
    expect(engine.revokeReceipt(sub.receipt!.receiptId, "secret-revoke-owner").ok).toBe(true);
    expect(engine.queryPublicReceipt(sub.receipt!.receiptId, "apt-soho-204").status).toBe(2);
  });
});

describe("LeaseProof Hardened Compact Engine — 12 Adversarial Attack Rejections", () => {
  it("Attack 1 (TAMPERED_COMMITMENT even with local re-hash): Rejects forged commitment not anchored by issuer", () => {
    const engine = createSeededLeaseProofEngine(NOW);
    const honest = engine.issueAndAnchorAttestation({
      tenantLabel: "Clever Attacker",
      tenantSecret: "secret-atk-1",
      kycIdSeed: "kyc-atk-1",
      issuerId: "argyle-payroll",
      issuerSecret: DEMO_ISSUER_SECRETS["argyle-payroll"],
      currencyCode: 840,
      monthlyIncome: 3000,
      liquidBalance: 10000,
      expiresAtEpoch: VALID_ATT_EXPIRY,
    });

    // Attacker inflates salary to $30,000 AND recomputes a valid local SHA-256 hash!
    const issuerHash = engine.getSnapshot().issuers.find((i) => i.id === "argyle-payroll")!.idHash;
    const forgedCommit = computeAttestationCommitment({
      issuerIdHash: issuerHash,
      applicantIdCommit: honest.applicantIdCommit,
      currencyCode: 840,
      monthlyIncome: 30000,
      liquidBalance: 10000,
      attestationExpiryEpoch: VALID_ATT_EXPIRY,
      nonce: honest.attestationNonce,
    });
    const forgedWitness = {
      ...honest,
      monthlyIncome: 30000,
      attestedCommitment: forgedCommit,
    };

    // Still REJECTED because forgedCommit was never anchored on-chain by Argyle!
    const res = engine.submitQualificationProof("apt-soho-204", forgedWitness);
    expect(res.ok).toBe(false);
    expect(res.errorCode).toBe("TAMPERED_COMMITMENT");
  });

  it("Attack 2 (UNAUTHORIZED_ADMIN): Rejects attacker trying to self-register fake bank or revoke Plaid", () => {
    const engine = createSeededLeaseProofEngine(NOW);
    const fakeReg = engine.registerIssuer({
      id: "fake-bank",
      name: "Fake Bank",
      providerType: "Open Banking",
      issuerKeyCommit: deriveIssuerKeyCommit("fake-sk"),
      callerAdminSecret: "wrong-admin-secret",
    });
    expect(fakeReg.ok).toBe(false);
    expect(fakeReg.errorCode).toBe("UNAUTHORIZED_ADMIN");

    const fakeRev = engine.revokeIssuer("plaid-us", "wrong-admin-secret");
    expect(fakeRev.ok).toBe(false);
    expect(fakeRev.errorCode).toBe("UNAUTHORIZED_ADMIN");
  });

  it("Attack 3 (UNAUTHORIZED_ISSUER_KEY): Rejects attacker trying to anchor attestation without bank's private key", () => {
    const engine = createSeededLeaseProofEngine(NOW);
    const res = engine.anchorAttestation("plaid-us", "0x1234", "wrong-issuer-secret");
    expect(res.ok).toBe(false);
    expect(res.errorCode).toBe("UNAUTHORIZED_ISSUER_KEY");
  });

  it("Attack 4 (LISTING_MISMATCH): Blocks forwarding a cheap-room receipt to a luxury apartment", () => {
    const engine = createSeededLeaseProofEngine(NOW);
    engine.createListing({
      id: "cheap-dorm-500",
      title: "Budget Dorm ($500/mo)",
      location: "Austin, TX",
      template: "APARTMENT",
      mode: 0,
      currencyCode: 840,
      monthlyRent: 500,
      minIncome: 1500,
      minBalance: 1000,
      landlordName: "Campus Housing",
    });

    const lowEarner = engine.issueAndAnchorAttestation({
      tenantLabel: "Low Earner",
      tenantSecret: "secret-dorm",
      kycIdSeed: "kyc-dorm-1",
      issuerId: "plaid-us",
      issuerSecret: DEMO_ISSUER_SECRETS["plaid-us"],
      currencyCode: 840,
      monthlyIncome: 2000,
      liquidBalance: 1500,
      expiresAtEpoch: VALID_ATT_EXPIRY,
    });

    const dormPass = engine.submitQualificationProof("cheap-dorm-500", lowEarner);
    expect(dormPass.ok).toBe(true);

    // Try forwarding cheap-dorm receipt to $2,400/mo SoHo Loft!
    const luxuryCheck = engine.queryPublicReceipt(dormPass.receipt!.receiptId, "apt-soho-204");
    expect(luxuryCheck.status).toBe(0);
    expect(luxuryCheck.errorCode).toBe("LISTING_MISMATCH");
  });

  it("Attack 5 (CURRENCY_MISMATCH): Blocks submitting EUR attestation against USD listing", () => {
    const engine = createSeededLeaseProofEngine(NOW);
    const eurWitness = engine.issueAndAnchorAttestation({
      tenantLabel: "FX Spoofer",
      tenantSecret: "secret-fx",
      kycIdSeed: "kyc-fx-1",
      issuerId: "tink-eu",
      issuerSecret: DEMO_ISSUER_SECRETS["tink-eu"],
      currencyCode: 978, // EUR
      monthlyIncome: 10000,
      liquidBalance: 20000,
      expiresAtEpoch: VALID_ATT_EXPIRY,
    });

    const res = engine.submitQualificationProof("apt-soho-204", eurWitness); // USD (840) listing!
    expect(res.ok).toBe(false);
    expect(res.errorCode).toBe("CURRENCY_MISMATCH");
  });

  it("Attack 6 (REPLAY_ATTACK even with new random tenantSecret): Attester-bound nullifier stops spam", () => {
    const engine = createSeededLeaseProofEngine(NOW);
    const w1 = engine.issueAndAnchorAttestation({
      tenantLabel: "Spammer",
      tenantSecret: "random-secret-A",
      kycIdSeed: "kyc-same-person-99",
      issuerId: "plaid-us",
      issuerSecret: DEMO_ISSUER_SECRETS["plaid-us"],
      currencyCode: 840,
      monthlyIncome: 10000,
      liquidBalance: 15000,
      expiresAtEpoch: VALID_ATT_EXPIRY,
    });
    expect(engine.submitQualificationProof("apt-soho-204", w1).ok).toBe(true);

    // Same person rotates tenantSecret to random-secret-B!
    const w2 = engine.issueAndAnchorAttestation({
      tenantLabel: "Spammer",
      tenantSecret: "random-secret-B",
      kycIdSeed: "kyc-same-person-99", // Same KYC identity!
      issuerId: "plaid-us",
      issuerSecret: DEMO_ISSUER_SECRETS["plaid-us"],
      currencyCode: 840,
      monthlyIncome: 10000,
      liquidBalance: 15000,
      expiresAtEpoch: VALID_ATT_EXPIRY,
      nonce: "second-nonce-99",
    });
    const dup = engine.submitQualificationProof("apt-soho-204", w2);
    expect(dup.ok).toBe(false);
    expect(dup.errorCode).toBe("REPLAY_ATTACK");
  });

  it("Attack 7 (EPOCH_CANNOT_GO_BACKWARD): Rejects backdating on-chain clock to revive expired attestation", () => {
    const engine = createSeededLeaseProofEngine(NOW);
    const backdate = engine.advanceEpoch(NOW - 86400, DEFAULT_ADMIN_SECRET);
    expect(backdate.ok).toBe(false);
    expect(backdate.errorCode).toBe("EPOCH_CANNOT_GO_BACKWARD");
  });

  it("Attack 8 (INSUFFICIENT_INCOME): Rejects salary $1 below 3x rent", () => {
    const engine = createSeededLeaseProofEngine(NOW);
    const w = engine.issueAndAnchorAttestation({
      tenantLabel: "Short Income",
      tenantSecret: "s8",
      kycIdSeed: "k8",
      issuerId: "argyle-payroll",
      issuerSecret: DEMO_ISSUER_SECRETS["argyle-payroll"],
      currencyCode: 840,
      monthlyIncome: 7199,
      liquidBalance: 15000,
      expiresAtEpoch: VALID_ATT_EXPIRY,
    });
    expect(engine.submitQualificationProof("apt-soho-204", w).errorCode).toBe("INSUFFICIENT_INCOME");
  });

  it("Attack 9 (INSUFFICIENT_BALANCE): Rejects freelancer $1 below 6-month runway", () => {
    const engine = createSeededLeaseProofEngine(NOW);
    const w = engine.issueAndAnchorAttestation({
      tenantLabel: "Short Runway",
      tenantSecret: "s9",
      kycIdSeed: "k9",
      issuerId: "tink-eu",
      issuerSecret: DEMO_ISSUER_SECRETS["tink-eu"],
      currencyCode: 978,
      monthlyIncome: 5000,
      liquidBalance: 9599,
      expiresAtEpoch: VALID_ATT_EXPIRY,
    });
    expect(engine.submitQualificationProof("coliving-lisbon-09", w).errorCode).toBe(
      "INSUFFICIENT_BALANCE"
    );
  });

  it("Attack 10 (UNTRUSTED_ISSUER & REVOKED_ISSUER): Rejects unregistered and revoked attesters", () => {
    const engine = createSeededLeaseProofEngine(NOW);
    const fakeW = engine.issueAndAnchorAttestation({
      tenantLabel: "Fake Bank",
      tenantSecret: "s10",
      kycIdSeed: "k10",
      issuerId: "photoshop-bank",
      issuerSecret: "none",
      currencyCode: 840,
      monthlyIncome: 50000,
      liquidBalance: 100000,
      expiresAtEpoch: VALID_ATT_EXPIRY,
      skipAnchor: true,
    });
    expect(engine.submitQualificationProof("apt-soho-204", fakeW).errorCode).toBe("UNTRUSTED_ISSUER");

    const revW = engine.issueAndAnchorAttestation({
      tenantLabel: "Revoked Bank",
      tenantSecret: "s10b",
      kycIdSeed: "k10b",
      issuerId: "plaid-us",
      issuerSecret: DEMO_ISSUER_SECRETS["plaid-us"],
      currencyCode: 840,
      monthlyIncome: 12000,
      liquidBalance: 20000,
      expiresAtEpoch: VALID_ATT_EXPIRY,
    });
    engine.revokeIssuer("plaid-us", DEFAULT_ADMIN_SECRET);
    expect(engine.submitQualificationProof("apt-soho-204", revW).errorCode).toBe("REVOKED_ISSUER");
  });

  it("Attack 11 (EXPIRED_ATTESTATION): Rejects stale attestation past on-chain currentLedgerEpoch", () => {
    const engine = createSeededLeaseProofEngine(NOW);
    const stale = engine.issueAndAnchorAttestation({
      tenantLabel: "Stale",
      tenantSecret: "s11",
      kycIdSeed: "k11",
      issuerId: "plaid-us",
      issuerSecret: DEMO_ISSUER_SECRETS["plaid-us"],
      currencyCode: 840,
      monthlyIncome: 10000,
      liquidBalance: 15000,
      expiresAtEpoch: NOW - 1,
    });
    expect(engine.submitQualificationProof("apt-soho-204", stale).errorCode).toBe("EXPIRED_ATTESTATION");
  });

  it("Attack 12 (UNAUTHORIZED_REVOKE): Rejects stranger/landlord trying to revoke tenant's pass", () => {
    const engine = createSeededLeaseProofEngine(NOW);
    const w = engine.issueAndAnchorAttestation({
      tenantLabel: "Protected",
      tenantSecret: "owner-secret-12",
      kycIdSeed: "k12",
      issuerId: "plaid-us",
      issuerSecret: DEMO_ISSUER_SECRETS["plaid-us"],
      currencyCode: 840,
      monthlyIncome: 10000,
      liquidBalance: 15000,
      expiresAtEpoch: VALID_ATT_EXPIRY,
    });
    const ok = engine.submitQualificationProof("apt-soho-204", w);
    expect(ok.ok).toBe(true);
    expect(engine.revokeReceipt(ok.receipt!.receiptId, "attacker-secret").errorCode).toBe(
      "UNAUTHORIZED_REVOKE"
    );
  });
});
