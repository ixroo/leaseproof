// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";
import {
  createSeededLeaseProofEngine,
  deriveListingNullifier,
  deriveOwnerCommit,
  LeaseProofContractEngine,
} from "../leaseproofEngine";

const NOW = 1_795_600_000;
const VALID_ATT_EXPIRY = NOW + 86_400 * 30;
const VALID_PASS_EXPIRY = NOW + 86_400 * 14;

describe("LeaseProof Compact Circuit Mirror — Honest End-to-End Flows", () => {
  it("1. Qualifies salaried tenant for Apartment Lease (mode 0: 3x rent + 2x deposit) with 0 leaked bits", () => {
    const engine = createSeededLeaseProofEngine(NOW);
    const witness = engine.issueSignedAttestation({
      tenantLabel: "Maya (Senior Product Designer)",
      tenantSecret: "secret-maya-2026-alpha",
      issuerId: "argyle-payroll",
      monthlyIncomeUsd: 9500,
      liquidBalanceUsd: 18000,
      expiresAtEpoch: VALID_ATT_EXPIRY,
    });

    const res = engine.submitQualificationProof("apt-soho-204", witness, NOW, VALID_PASS_EXPIRY);
    expect(res.ok).toBe(true);
    expect(res.receipt?.status).toBe(1);
    expect(res.receipt?.leakedSalaryBits).toBe(0);
    expect(res.receipt?.leakedBalanceBits).toBe(0);
    expect(res.receipt?.leakedIdentityBits).toBe(0);
    expect(res.privacyAudit?.leakedSecretBits).toBe(0);

    const check = engine.verifyReceipt(res.receipt!.receiptId);
    expect(check.status).toBe(1);
    expect(engine.getSnapshot().totalVerifiedPasses).toBe(1);
  });

  it("2. Qualifies freelancer with $0 corporate payslip for Co-Living Runway (mode 1: 6x liquid balance)", () => {
    const engine = createSeededLeaseProofEngine(NOW);
    const witness = engine.issueSignedAttestation({
      tenantLabel: "Rafi (Independent Developer)",
      tenantSecret: "secret-rafi-freelancer",
      issuerId: "tink-eu",
      monthlyIncomeUsd: 0, // No W-2 payslip!
      liquidBalanceUsd: 14500, // >= $9,600 (6x $1,600)
      expiresAtEpoch: VALID_ATT_EXPIRY,
    });

    const res = engine.submitQualificationProof(
      "coliving-lisbon-09",
      witness,
      NOW,
      VALID_PASS_EXPIRY
    );
    expect(res.ok).toBe(true);
    expect(res.receipt?.listingMode).toBe(1);
    expect(res.receipt?.listingTemplate).toBe("FREELANCER_COLIVING");
  });

  it("3. Qualifies applicant for Vehicle Lease (mode 0: 4x lease + 3x deposit)", () => {
    const engine = createSeededLeaseProofEngine(NOW);
    const witness = engine.issueSignedAttestation({
      tenantLabel: "Lukas (Berlin Engineer)",
      tenantSecret: "secret-lukas-ev",
      issuerId: "tink-eu",
      monthlyIncomeUsd: 4200,
      liquidBalanceUsd: 6000,
      expiresAtEpoch: VALID_ATT_EXPIRY,
    });

    const res = engine.submitQualificationProof("ev-fleet-model3", witness, NOW, VALID_PASS_EXPIRY);
    expect(res.ok).toBe(true);
    expect(res.receipt?.listingTemplate).toBe("VEHICLE_LEASE");
  });

  it("4. Allows the SAME tenant to apply to multiple different listings with unlinkable listing-scoped nullifiers", () => {
    const engine = createSeededLeaseProofEngine(NOW);
    const witness = engine.issueSignedAttestation({
      tenantLabel: "Maya",
      tenantSecret: "secret-maya-multi",
      issuerId: "plaid-us",
      monthlyIncomeUsd: 11000,
      liquidBalanceUsd: 24000,
      expiresAtEpoch: VALID_ATT_EXPIRY,
    });

    const r1 = engine.submitQualificationProof("apt-soho-204", witness, NOW, VALID_PASS_EXPIRY);
    const r2 = engine.submitQualificationProof("coliving-lisbon-09", witness, NOW, VALID_PASS_EXPIRY);
    const r3 = engine.submitQualificationProof("ev-fleet-model3", witness, NOW, VALID_PASS_EXPIRY);

    expect(r1.ok).toBe(true);
    expect(r2.ok).toBe(true);
    expect(r3.ok).toBe(true);

    // All 3 nullifiers must be distinct (unlinkable across landlords)
    expect(r1.receipt!.nullifier).not.toBe(r2.receipt!.nullifier);
    expect(r2.receipt!.nullifier).not.toBe(r3.receipt!.nullifier);
    expect(engine.getSnapshot().totalVerifiedPasses).toBe(3);
  });

  it("5. Allows tenant to revoke their own Verification Pass anytime via revokeReceipt", () => {
    const engine = createSeededLeaseProofEngine(NOW);
    const secret = "secret-tenant-revoke-ok";
    const witness = engine.issueSignedAttestation({
      tenantLabel: "Elena",
      tenantSecret: secret,
      issuerId: "plaid-us",
      monthlyIncomeUsd: 8000,
      liquidBalanceUsd: 10000,
      expiresAtEpoch: VALID_ATT_EXPIRY,
    });

    const sub = engine.submitQualificationProof("apt-soho-204", witness, NOW, VALID_PASS_EXPIRY);
    expect(sub.ok).toBe(true);
    const receiptId = sub.receipt!.receiptId;

    const rev = engine.revokeReceipt(receiptId, secret, NOW + 3600);
    expect(rev.ok).toBe(true);
    expect(engine.verifyReceipt(receiptId).status).toBe(2); // REVOKED
  });

  it("6. Allows landlord to create a custom listing and verify exact boundary values (income == min, balance == min)", () => {
    const engine = createSeededLeaseProofEngine(NOW);
    const created = engine.createListing({
      id: "custom-jakarta-studio",
      title: "SCBD Studio ($1,000/mo)",
      location: "Jakarta",
      template: "APARTMENT",
      mode: 0,
      monthlyRentUsd: 1000,
      minIncomeUsd: 3000,
      minBalanceUsd: 2000,
      landlordName: "Sudirman Suites",
      nowEpoch: NOW,
    });
    expect(created.ok).toBe(true);

    const witness = engine.issueSignedAttestation({
      tenantLabel: "Boundary Tester",
      tenantSecret: "secret-exact-boundary",
      issuerId: "plaid-us",
      monthlyIncomeUsd: 3000, // exact min
      liquidBalanceUsd: 2000, // exact min
      expiresAtEpoch: VALID_ATT_EXPIRY,
    });
    const res = engine.submitQualificationProof("custom-jakarta-studio", witness, NOW, VALID_PASS_EXPIRY);
    expect(res.ok).toBe(true);
  });

  it("7. Verifies unknown receipt returns status 0 (NOT_FOUND)", () => {
    const engine = createSeededLeaseProofEngine(NOW);
    expect(engine.verifyReceipt("0xdeadbeef").status).toBe(0);
  });

  it("8. Deterministic ownerCommit and listingNullifier derivations are stable", () => {
    expect(deriveOwnerCommit("abc")).toBe(deriveOwnerCommit("abc"));
    expect(deriveOwnerCommit("abc")).not.toBe(deriveOwnerCommit("abd"));
    expect(deriveListingNullifier("abc", "0x1")).not.toBe(deriveListingNullifier("abc", "0x2"));
  });
});

describe("LeaseProof Compact Circuit Mirror — 8 Adversarial Attack Rejections", () => {
  it("Attack 1 (INSUFFICIENT_INCOME): Rejects tenant whose salary is $1 below 3x rent threshold", () => {
    const engine = createSeededLeaseProofEngine(NOW);
    const witness = engine.issueSignedAttestation({
      tenantLabel: "Under-Income Applicant",
      tenantSecret: "secret-attack-1",
      issuerId: "argyle-payroll",
      monthlyIncomeUsd: 7199, // $1 short of $7,200
      liquidBalanceUsd: 15000,
      expiresAtEpoch: VALID_ATT_EXPIRY,
    });

    const res = engine.submitQualificationProof("apt-soho-204", witness, NOW, VALID_PASS_EXPIRY);
    expect(res.ok).toBe(false);
    expect(res.errorCode).toBe("INSUFFICIENT_INCOME");
  });

  it("Attack 2 (INSUFFICIENT_BALANCE): Rejects freelancer whose liquid savings fail 6-month runway", () => {
    const engine = createSeededLeaseProofEngine(NOW);
    const witness = engine.issueSignedAttestation({
      tenantLabel: "Low-Runway Applicant",
      tenantSecret: "secret-attack-2",
      issuerId: "tink-eu",
      monthlyIncomeUsd: 5000,
      liquidBalanceUsd: 9599, // $1 short of $9,600
      expiresAtEpoch: VALID_ATT_EXPIRY,
    });

    const res = engine.submitQualificationProof(
      "coliving-lisbon-09",
      witness,
      NOW,
      VALID_PASS_EXPIRY
    );
    expect(res.ok).toBe(false);
    expect(res.errorCode).toBe("INSUFFICIENT_BALANCE");
  });

  it("Attack 3 (UNTRUSTED_ISSUER): Rejects self-signed / unregistered bank attester", () => {
    const engine = createSeededLeaseProofEngine(NOW);
    const witness = engine.issueSignedAttestation({
      tenantLabel: "Fake Bank Applicant",
      tenantSecret: "secret-attack-3",
      issuerId: "photoshop-bank-99",
      monthlyIncomeUsd: 50000,
      liquidBalanceUsd: 100000,
      expiresAtEpoch: VALID_ATT_EXPIRY,
    });

    const res = engine.submitQualificationProof("apt-soho-204", witness, NOW, VALID_PASS_EXPIRY);
    expect(res.ok).toBe(false);
    expect(res.errorCode).toBe("UNTRUSTED_ISSUER");
  });

  it("Attack 4 (REVOKED_ISSUER): Rejects proof signed by a compromised issuer after on-chain revocation", () => {
    const engine = createSeededLeaseProofEngine(NOW);
    const witness = engine.issueSignedAttestation({
      tenantLabel: "Revoked Issuer Applicant",
      tenantSecret: "secret-attack-4",
      issuerId: "plaid-us",
      monthlyIncomeUsd: 12000,
      liquidBalanceUsd: 20000,
      expiresAtEpoch: VALID_ATT_EXPIRY,
    });

    const rev = engine.revokeIssuer("plaid-us");
    expect(rev.ok).toBe(true);

    const res = engine.submitQualificationProof("apt-soho-204", witness, NOW, VALID_PASS_EXPIRY);
    expect(res.ok).toBe(false);
    expect(res.errorCode).toBe("REVOKED_ISSUER");
  });

  it("Attack 5 (REPLAY_ATTACK): Rejects duplicate proof submission for the same tenant & listing", () => {
    const engine = createSeededLeaseProofEngine(NOW);
    const witness = engine.issueSignedAttestation({
      tenantLabel: "Replay Applicant",
      tenantSecret: "secret-attack-5",
      issuerId: "plaid-us",
      monthlyIncomeUsd: 9000,
      liquidBalanceUsd: 12000,
      expiresAtEpoch: VALID_ATT_EXPIRY,
    });

    const first = engine.submitQualificationProof("apt-soho-204", witness, NOW, VALID_PASS_EXPIRY);
    expect(first.ok).toBe(true);

    const second = engine.submitQualificationProof("apt-soho-204", witness, NOW + 60, VALID_PASS_EXPIRY);
    expect(second.ok).toBe(false);
    expect(second.errorCode).toBe("REPLAY_ATTACK");
  });

  it("Attack 6 (EXPIRED_ATTESTATION): Rejects stale bank statement past its expiry epoch", () => {
    const engine = createSeededLeaseProofEngine(NOW);
    const witness = engine.issueSignedAttestation({
      tenantLabel: "Stale Statement Applicant",
      tenantSecret: "secret-attack-6",
      issuerId: "tink-eu",
      monthlyIncomeUsd: 9000,
      liquidBalanceUsd: 15000,
      expiresAtEpoch: NOW - 1, // Expired 1 second ago
    });

    const res = engine.submitQualificationProof("apt-soho-204", witness, NOW, VALID_PASS_EXPIRY);
    expect(res.ok).toBe(false);
    expect(res.errorCode).toBe("EXPIRED_ATTESTATION");
  });

  it("Attack 7 (TAMPERED_COMMITMENT): Rejects tenant who inflates income locally after bank signs", () => {
    const engine = createSeededLeaseProofEngine(NOW);
    const honestLowWitness = engine.issueSignedAttestation({
      tenantLabel: "Tampering Applicant",
      tenantSecret: "secret-attack-7",
      issuerId: "argyle-payroll",
      monthlyIncomeUsd: 4000, // True attested salary (too low)
      liquidBalanceUsd: 12000,
      expiresAtEpoch: VALID_ATT_EXPIRY,
    });

    // Attacker tampers with local monthlyIncomeUsd without being able to forge bank's commitment
    const tamperedWitness = { ...honestLowWitness, monthlyIncomeUsd: 12000 };

    const res = engine.submitQualificationProof(
      "apt-soho-204",
      tamperedWitness,
      NOW,
      VALID_PASS_EXPIRY
    );
    expect(res.ok).toBe(false);
    expect(res.errorCode).toBe("TAMPERED_COMMITMENT");
  });

  it("Attack 8 (UNAUTHORIZED_REVOKE): Rejects landlord or stranger trying to revoke tenant's pass", () => {
    const engine = createSeededLeaseProofEngine(NOW);
    const witness = engine.issueSignedAttestation({
      tenantLabel: "Protected Tenant",
      tenantSecret: "secret-attack-8-real-owner",
      issuerId: "plaid-us",
      monthlyIncomeUsd: 10000,
      liquidBalanceUsd: 15000,
      expiresAtEpoch: VALID_ATT_EXPIRY,
    });

    const sub = engine.submitQualificationProof("apt-soho-204", witness, NOW, VALID_PASS_EXPIRY);
    expect(sub.ok).toBe(true);

    const hijack = engine.revokeReceipt(sub.receipt!.receiptId, "wrong-secret-attacker", NOW + 10);
    expect(hijack.ok).toBe(false);
    expect(hijack.errorCode).toBe("UNAUTHORIZED_REVOKE");
    expect(engine.verifyReceipt(sub.receipt!.receiptId).status).toBe(1); // Still QUALIFIED
  });

  it("Edge Guards: Rejects unknown listing, past pass expiry, double revoke, and invalid listing params", () => {
    const engine = new LeaseProofContractEngine();
    engine.registerIssuer("plaid-us", "Plaid", "Open Banking", NOW);

    expect(engine.revokeIssuer("nonexistent").errorCode).toBe("UNKNOWN_ISSUER");
    expect(
      engine.createListing({
        id: "bad-bal",
        title: "Bad",
        location: "X",
        template: "APARTMENT",
        mode: 0,
        monthlyRentUsd: 1000,
        minIncomeUsd: 3000,
        minBalanceUsd: 0,
        landlordName: "L",
      }).errorCode
    ).toBe("INVALID_BALANCE_THRESHOLD");

    engine.createListing({
      id: "ok-1",
      title: "OK",
      location: "X",
      template: "APARTMENT",
      mode: 0,
      monthlyRentUsd: 1000,
      minIncomeUsd: 3000,
      minBalanceUsd: 2000,
      landlordName: "L",
    });

    const w = engine.issueSignedAttestation({
      tenantLabel: "T",
      tenantSecret: "s",
      issuerId: "plaid-us",
      monthlyIncomeUsd: 5000,
      liquidBalanceUsd: 5000,
      expiresAtEpoch: VALID_ATT_EXPIRY,
    });

    expect(engine.submitQualificationProof("no-such-listing", w, NOW, VALID_PASS_EXPIRY).errorCode).toBe(
      "UNKNOWN_LISTING"
    );
    expect(engine.submitQualificationProof("ok-1", w, NOW, NOW - 10).errorCode).toBe(
      "INVALID_PASS_EXPIRY"
    );

    const ok = engine.submitQualificationProof("ok-1", w, NOW, VALID_PASS_EXPIRY);
    expect(ok.ok).toBe(true);
    expect(engine.revokeReceipt(ok.receipt!.receiptId, "s", NOW + 5).ok).toBe(true);
    expect(engine.revokeReceipt(ok.receipt!.receiptId, "s", NOW + 10).errorCode).toBe("ALREADY_REVOKED");
  });
});
