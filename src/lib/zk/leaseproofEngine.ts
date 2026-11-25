// SPDX-License-Identifier: Apache-2.0
// LeaseProof — Hardened TypeScript Mirror Engine for contracts/leaseproof.compact
// Mirrors all hardened dual-ledger invariants:
// - Admin-gated issuer registry & monotonic on-chain epoch
// - Issuer-anchored attestation commitments (unforgeable TAMPERED_COMMITMENT protection)
// - Listing-bound receipts & ISO-4217 currency matching
// - Attester-bound applicantIdCommit (anti straw-applicant)
// - Windowed anti-replay nullifiers + EXPIRED (3) status check

export type ListingMode = 0 | 1; // 0 = Income + Deposit, 1 = Liquid Runway Only
export type TemplateType = "APARTMENT" | "FREELANCER_COLIVING" | "VEHICLE_LEASE";
export type CurrencyCode = 840 | 978 | 360; // 840 = USD, 978 = EUR, 360 = IDR
export type ReceiptStatus = 0 | 1 | 2 | 3; // 0 = NOT_FOUND, 1 = QUALIFIED, 2 = REVOKED, 3 = EXPIRED

export const CURRENCY_META: Record<CurrencyCode, { code: string; symbol: string }> = {
  840: { code: "USD", symbol: "$" },
  978: { code: "EUR", symbol: "€" },
  360: { code: "IDR", symbol: "Rp" },
};

export const PASS_VALIDITY_SEC = 1_209_600; // 14 days enforced in-circuit

export type CompactAssertionCode =
  | "UNAUTHORIZED_ADMIN"
  | "UNAUTHORIZED_ISSUER_KEY"
  | "EPOCH_CANNOT_GO_BACKWARD"
  | "UNKNOWN_ISSUER"
  | "INVALID_LISTING_MODE"
  | "INVALID_CURRENCY"
  | "INVALID_BALANCE_THRESHOLD"
  | "UNKNOWN_LISTING"
  | "UNTRUSTED_ISSUER"
  | "REVOKED_ISSUER"
  | "EXPIRED_ATTESTATION"
  | "CURRENCY_MISMATCH"
  | "TAMPERED_COMMITMENT"
  | "ISSUER_COMMITMENT_MISMATCH"
  | "INSUFFICIENT_BALANCE"
  | "INSUFFICIENT_INCOME"
  | "REPLAY_ATTACK"
  | "UNKNOWN_RECEIPT"
  | "ALREADY_REVOKED"
  | "UNAUTHORIZED_REVOKE"
  | "LISTING_MISMATCH";

export interface IssuerRecord {
  id: string;
  idHash: string;
  name: string;
  providerType: "Open Banking" | "Payroll API" | "Enterprise Employer";
  keyCommit: string;
  active: boolean;
  registeredAt: number;
}

export interface ListingRecord {
  id: string;
  idHash: string;
  title: string;
  location: string;
  template: TemplateType;
  mode: ListingMode;
  currencyCode: CurrencyCode;
  monthlyRent: number;
  minIncome: number;
  minBalance: number;
  landlordName: string;
  createdAt: number;
}

export interface PrivateTenantWitness {
  tenantLabel: string;
  tenantSecret: string;
  applicantIdCommit: string; // Attester-derived KYC identity commitment (anti straw-applicant)
  monthlyIncome: number;
  liquidBalance: number;
  currencyCode: CurrencyCode;
  attestationIssuerId: string;
  attestationExpiryEpoch: number;
  attestationNonce: string;
  attestedCommitment: string;
}

export interface PublicReceiptRecord {
  receiptId: string;
  listingId: string;
  listingIdHash: string;
  listingTitle: string;
  listingTemplate: TemplateType;
  listingMode: ListingMode;
  currencyCode: CurrencyCode;
  issuerName: string;
  nullifier: string;
  ownerCommit: string;
  applicantIdCommit: string;
  status: 1 | 2; // On-chain stored status (EXPIRED computed dynamically against currentLedgerEpoch)
  issuedAtEpoch: number;
  expiresAtEpoch: number;
  revokedAtEpoch: number | null;
  proofDurationMs: number;
  circuitName: "submitQualificationProof";
}

export interface CircuitExecutionResult {
  ok: boolean;
  circuit: string;
  errorCode?: CompactAssertionCode;
  humanReason?: string;
  receipt?: PublicReceiptRecord;
}

export interface VerifyReceiptResult {
  status: ReceiptStatus;
  errorCode?: "LISTING_MISMATCH";
  humanReason: string;
  receipt: PublicReceiptRecord | null;
}

export interface LedgerSnapshot {
  currentLedgerEpoch: number;
  issuers: IssuerRecord[];
  listings: ListingRecord[];
  anchoredAttestationCount: number;
  usedNullifiers: string[];
  receipts: PublicReceiptRecord[];
  totalVerifiedPasses: number;
}

const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

export function sha256Hex(input: string): string {
  const bytes = new TextEncoder().encode(input);
  const bitLen = bytes.length * 8;
  const paddedLen = Math.ceil((bytes.length + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLen);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(paddedLen - 4, bitLen >>> 0, false);
  view.setUint32(paddedLen - 8, Math.floor(bitLen / 0x100000000), false);

  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const w = new Uint32Array(64);
  for (let offset = 0; offset < paddedLen; offset += 64) {
    for (let i = 0; i < 16; i++) w[i] = view.getUint32(offset + i * 4, false);
    for (let i = 16; i < 64; i++) {
      const s0 = ((w[i - 15] >>> 7) | (w[i - 15] << 25)) ^ ((w[i - 15] >>> 18) | (w[i - 15] << 14)) ^ (w[i - 15] >>> 3);
      const s1 = ((w[i - 2] >>> 17) | (w[i - 2] << 15)) ^ ((w[i - 2] >>> 19) | (w[i - 2] << 13)) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (let i = 0; i < 64; i++) {
      const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[i] + w[i]) >>> 0;
      const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;
      h = g; g = f; f = e; e = (d + temp1) >>> 0;
      d = c; c = b; b = a; a = (temp1 + temp2) >>> 0;
    }
    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0; h6 = (h6 + g) >>> 0; h7 = (h7 + h) >>> 0;
  }
  return [h0, h1, h2, h3, h4, h5, h6, h7]
    .map((n) => n.toString(16).padStart(8, "0"))
    .join("");
}

export const deriveAdminCommit = (secret: string) => "0x" + sha256Hex(`leaseproof:admin|${secret}`);
export const deriveIssuerKeyCommit = (secret: string) => "0x" + sha256Hex(`leaseproof:issuer|${secret}`);
export const deriveOwnerCommit = (secret: string) => "0x" + sha256Hex(`leaseproof:owner|${secret}`);
export const deriveApplicantIdCommit = (nationalIdHash: string, kycSalt: string) =>
  "0x" + sha256Hex(`leaseproof:kyc|${nationalIdHash}|${kycSalt}`);

export const deriveListingNullifier = (
  applicantIdCommit: string,
  listingIdHash: string,
  windowBucket: number
) => "0x" + sha256Hex(`leaseproof:nullifier|${applicantIdCommit}|${listingIdHash}|${windowBucket}`);

export function computeAttestationCommitment(params: {
  issuerIdHash: string;
  applicantIdCommit: string;
  currencyCode: CurrencyCode;
  monthlyIncome: number;
  liquidBalance: number;
  attestationExpiryEpoch: number;
  nonce: string;
}): string {
  return (
    "0x" +
    sha256Hex(
      `leaseproof:attest|${params.issuerIdHash}|${params.applicantIdCommit}|${params.currencyCode}|${Math.floor(params.monthlyIncome)}|${Math.floor(params.liquidBalance)}|${Math.floor(params.attestationExpiryEpoch)}|${params.nonce}`
    )
  );
}

export const deriveReceiptId = (
  nullifier: string,
  listingIdHash: string,
  attestedCommitment: string
) => "0x" + sha256Hex(`leaseproof:receipt|${nullifier}|${listingIdHash}|${attestedCommitment}`);

export const DEFAULT_ADMIN_SECRET = "leaseproof-registry-admin-secret-2026";
export const DEMO_ISSUER_SECRETS: Record<string, string> = {
  "plaid-us": "issuer-sk-plaid-us-2026",
  "tink-eu": "issuer-sk-tink-eu-2026",
  "argyle-payroll": "issuer-sk-argyle-2026",
};

export class LeaseProofContractEngine {
  private registryAdminCommit: string;
  private currentLedgerEpoch: number;
  private issuers = new Map<string, IssuerRecord>();
  private anchoredAttestations = new Map<string, string>(); // commitment -> issuerId
  private listings = new Map<string, ListingRecord>();
  private usedNullifiers = new Set<string>();
  private receipts = new Map<string, PublicReceiptRecord>();
  private totalVerifiedPasses = 0;

  constructor(
    adminCommit = deriveAdminCommit(DEFAULT_ADMIN_SECRET),
    initialEpoch = 1_795_600_000
  ) {
    this.registryAdminCommit = adminCommit;
    this.currentLedgerEpoch = initialEpoch;
  }

  getCurrentEpoch(): number {
    return this.currentLedgerEpoch;
  }

  advanceEpoch(newEpoch: number, callerAdminSecret: string): CircuitExecutionResult {
    if (deriveAdminCommit(callerAdminSecret) !== this.registryAdminCommit) {
      return {
        ok: false,
        circuit: "advanceEpoch",
        errorCode: "UNAUTHORIZED_ADMIN",
        humanReason: "Rejected: Only the pinned registry admin can advance the on-chain epoch.",
      };
    }
    if (newEpoch < this.currentLedgerEpoch) {
      return {
        ok: false,
        circuit: "advanceEpoch",
        errorCode: "EPOCH_CANNOT_GO_BACKWARD",
        humanReason: "Rejected: On-chain ledger epoch is strictly monotonic and cannot be backdated.",
      };
    }
    this.currentLedgerEpoch = newEpoch;
    return { ok: true, circuit: "advanceEpoch" };
  }

  registerIssuer(params: {
    id: string;
    name: string;
    providerType: IssuerRecord["providerType"];
    issuerKeyCommit: string;
    callerAdminSecret: string;
  }): CircuitExecutionResult & { issuer?: IssuerRecord } {
    if (deriveAdminCommit(params.callerAdminSecret) !== this.registryAdminCommit) {
      return {
        ok: false,
        circuit: "registerIssuer",
        errorCode: "UNAUTHORIZED_ADMIN",
        humanReason: "Rejected: Unauthorized caller attempted to register an attester.",
      };
    }
    const idHash = "0x" + sha256Hex(`issuer:${params.id}`);
    const issuer: IssuerRecord = {
      id: params.id,
      idHash,
      name: params.name,
      providerType: params.providerType,
      keyCommit: params.issuerKeyCommit,
      active: true,
      registeredAt: this.currentLedgerEpoch,
    };
    this.issuers.set(params.id, issuer);
    return { ok: true, circuit: "registerIssuer", issuer };
  }

  revokeIssuer(id: string, callerAdminSecret: string): CircuitExecutionResult {
    if (deriveAdminCommit(callerAdminSecret) !== this.registryAdminCommit) {
      return {
        ok: false,
        circuit: "revokeIssuer",
        errorCode: "UNAUTHORIZED_ADMIN",
        humanReason: "Rejected: Only registry admin can revoke a trusted attester.",
      };
    }
    const rec = this.issuers.get(id);
    if (!rec) {
      return {
        ok: false,
        circuit: "revokeIssuer",
        errorCode: "UNKNOWN_ISSUER",
        humanReason: `Issuer "${id}" is not registered.`,
      };
    }
    rec.active = false;
    return { ok: true, circuit: "revokeIssuer" };
  }

  reinstateIssuer(id: string, callerAdminSecret: string): CircuitExecutionResult {
    if (deriveAdminCommit(callerAdminSecret) !== this.registryAdminCommit) {
      return {
        ok: false,
        circuit: "registerIssuer",
        errorCode: "UNAUTHORIZED_ADMIN",
        humanReason: "Rejected: Only registry admin can reinstate an attester.",
      };
    }
    const rec = this.issuers.get(id);
    if (!rec) {
      return {
        ok: false,
        circuit: "registerIssuer",
        errorCode: "UNKNOWN_ISSUER",
        humanReason: `Issuer "${id}" does not exist.`,
      };
    }
    rec.active = true;
    return { ok: true, circuit: "registerIssuer" };
  }

  anchorAttestation(
    issuerId: string,
    attestationCommit: string,
    callerIssuerSecret: string
  ): CircuitExecutionResult {
    const issuer = this.issuers.get(issuerId);
    if (!issuer) {
      return {
        ok: false,
        circuit: "anchorAttestation",
        errorCode: "UNTRUSTED_ISSUER",
        humanReason: `Rejected: Issuer "${issuerId}" is not in the trusted registry.`,
      };
    }
    if (!issuer.active) {
      return {
        ok: false,
        circuit: "anchorAttestation",
        errorCode: "REVOKED_ISSUER",
        humanReason: `Rejected: Issuer "${issuer.name}" has been revoked.`,
      };
    }
    if (deriveIssuerKeyCommit(callerIssuerSecret) !== issuer.keyCommit) {
      return {
        ok: false,
        circuit: "anchorAttestation",
        errorCode: "UNAUTHORIZED_ISSUER_KEY",
        humanReason: "Rejected: Caller does not hold the private issuer signing key.",
      };
    }
    this.anchoredAttestations.set(attestationCommit, issuerId);
    return { ok: true, circuit: "anchorAttestation" };
  }

  createListing(params: {
    id: string;
    title: string;
    location: string;
    template: TemplateType;
    mode: ListingMode;
    currencyCode: CurrencyCode;
    monthlyRent: number;
    minIncome: number;
    minBalance: number;
    landlordName: string;
  }): CircuitExecutionResult & { listing?: ListingRecord } {
    if (params.mode !== 0 && params.mode !== 1) {
      return {
        ok: false,
        circuit: "createListing",
        errorCode: "INVALID_LISTING_MODE",
        humanReason: "Mode must be 0 (Income + Deposit) or 1 (Liquid Runway Only).",
      };
    }
    if (!CURRENCY_META[params.currencyCode]) {
      return {
        ok: false,
        circuit: "createListing",
        errorCode: "INVALID_CURRENCY",
        humanReason: "Listing must specify a valid ISO-4217 currency code.",
      };
    }
    if (params.minBalance <= 0) {
      return {
        ok: false,
        circuit: "createListing",
        errorCode: "INVALID_BALANCE_THRESHOLD",
        humanReason: "Minimum liquid balance threshold must be greater than 0.",
      };
    }

    const listing: ListingRecord = {
      id: params.id,
      idHash: "0x" + sha256Hex(`listing:${params.id}`),
      title: params.title,
      location: params.location,
      template: params.template,
      mode: params.mode,
      currencyCode: params.currencyCode,
      monthlyRent: params.monthlyRent,
      minIncome: params.mode === 1 ? 0 : params.minIncome,
      minBalance: params.minBalance,
      landlordName: params.landlordName,
      createdAt: this.currentLedgerEpoch,
    };
    this.listings.set(listing.id, listing);
    return { ok: true, circuit: "createListing", listing };
  }

  /**
   * Simulates an Open Banking / Payroll attester verifying a tenant's KYC identity + financials,
   * anchoring ONLY the blinded commitment on-chain via anchorAttestation(), and returning the
   * private witness locally to the tenant.
   */
  issueAndAnchorAttestation(params: {
    tenantLabel: string;
    tenantSecret: string;
    kycIdSeed: string;
    issuerId: string;
    issuerSecret: string;
    currencyCode: CurrencyCode;
    monthlyIncome: number;
    liquidBalance: number;
    expiresAtEpoch: number;
    nonce?: string;
    skipAnchor?: boolean; // For testing unanchored/forged commitments
  }): PrivateTenantWitness {
    const issuerIdHash = "0x" + sha256Hex(`issuer:${params.issuerId}`);
    const applicantIdCommit = deriveApplicantIdCommit(params.kycIdSeed, params.issuerId);
    const nonce =
      params.nonce ??
      sha256Hex(`${params.kycIdSeed}:${params.issuerId}:${params.expiresAtEpoch}`).slice(0, 24);
    const attestedCommitment = computeAttestationCommitment({
      issuerIdHash,
      applicantIdCommit,
      currencyCode: params.currencyCode,
      monthlyIncome: params.monthlyIncome,
      liquidBalance: params.liquidBalance,
      attestationExpiryEpoch: params.expiresAtEpoch,
      nonce,
    });

    if (!params.skipAnchor) {
      this.anchorAttestation(params.issuerId, attestedCommitment, params.issuerSecret);
    }

    return {
      tenantLabel: params.tenantLabel,
      tenantSecret: params.tenantSecret,
      applicantIdCommit,
      monthlyIncome: params.monthlyIncome,
      liquidBalance: params.liquidBalance,
      currencyCode: params.currencyCode,
      attestationIssuerId: params.issuerId,
      attestationExpiryEpoch: params.expiresAtEpoch,
      attestationNonce: nonce,
      attestedCommitment,
    };
  }

  submitQualificationProof(listingId: string, witness: PrivateTenantWitness): CircuitExecutionResult {
    const listing = this.listings.get(listingId);
    if (!listing) {
      return {
        ok: false,
        circuit: "submitQualificationProof",
        errorCode: "UNKNOWN_LISTING",
        humanReason: `Listing "${listingId}" does not exist on the Midnight ledger.`,
      };
    }

    const issuer = this.issuers.get(witness.attestationIssuerId);
    if (!issuer) {
      return {
        ok: false,
        circuit: "submitQualificationProof",
        errorCode: "UNTRUSTED_ISSUER",
        humanReason: `Rejected: Attester "${witness.attestationIssuerId}" is not in the admin-approved registry.`,
      };
    }
    if (!issuer.active) {
      return {
        ok: false,
        circuit: "submitQualificationProof",
        errorCode: "REVOKED_ISSUER",
        humanReason: `Rejected: Attester "${issuer.name}" has been revoked on-chain.`,
      };
    }

    // Verified against on-chain monotonic currentLedgerEpoch (prover cannot backdate time!)
    if (witness.attestationExpiryEpoch < this.currentLedgerEpoch) {
      return {
        ok: false,
        circuit: "submitQualificationProof",
        errorCode: "EXPIRED_ATTESTATION",
        humanReason: "Rejected: Attestation expired relative to on-chain currentLedgerEpoch.",
      };
    }

    if (witness.currencyCode !== listing.currencyCode) {
      return {
        ok: false,
        circuit: "submitQualificationProof",
        errorCode: "CURRENCY_MISMATCH",
        humanReason: `Rejected: Attestation currency (${CURRENCY_META[witness.currencyCode].code}) does not match listing currency (${CURRENCY_META[listing.currencyCode].code}).`,
      };
    }

    // Recompute commitment over ALL private witness fields and verify it was genuinely anchored by issuer!
    const computedCommit = computeAttestationCommitment({
      issuerIdHash: issuer.idHash,
      applicantIdCommit: witness.applicantIdCommit,
      currencyCode: witness.currencyCode,
      monthlyIncome: witness.monthlyIncome,
      liquidBalance: witness.liquidBalance,
      attestationExpiryEpoch: witness.attestationExpiryEpoch,
      nonce: witness.attestationNonce,
    });

    const anchoredBy = this.anchoredAttestations.get(computedCommit);
    if (!anchoredBy) {
      return {
        ok: false,
        circuit: "submitQualificationProof",
        errorCode: "TAMPERED_COMMITMENT",
        humanReason:
          "Rejected: Commitment is not anchored on-chain by a trusted attester (even if re-hashed locally, forged income/balance fails!).",
      };
    }
    if (anchoredBy !== issuer.id) {
      return {
        ok: false,
        circuit: "submitQualificationProof",
        errorCode: "ISSUER_COMMITMENT_MISMATCH",
        humanReason: "Rejected: Commitment was anchored by a different issuer.",
      };
    }

    const sym = CURRENCY_META[listing.currencyCode].symbol;
    if (witness.liquidBalance < listing.minBalance) {
      return {
        ok: false,
        circuit: "submitQualificationProof",
        errorCode: "INSUFFICIENT_BALANCE",
        humanReason: `Rejected: Private liquid balance failed threshold (required >= ${sym}${listing.minBalance.toLocaleString("en-US")}).`,
      };
    }

    if (listing.mode === 0 && witness.monthlyIncome < listing.minIncome) {
      return {
        ok: false,
        circuit: "submitQualificationProof",
        errorCode: "INSUFFICIENT_INCOME",
        humanReason: `Rejected: Private monthly income failed threshold (required >= ${sym}${listing.minIncome.toLocaleString("en-US")}/mo).`,
      };
    }

    // Windowed nullifier bound to attester KYC identity (prevents random-secret replay spam & allows re-apply after 14d!)
    const windowBucket = Math.floor(this.currentLedgerEpoch / PASS_VALIDITY_SEC);
    const nullifier = deriveListingNullifier(witness.applicantIdCommit, listing.idHash, windowBucket);
    if (this.usedNullifiers.has(nullifier)) {
      return {
        ok: false,
        circuit: "submitQualificationProof",
        errorCode: "REPLAY_ATTACK",
        humanReason:
          "Rejected: Attester-bound nullifier already spent for this listing in the current 14-day window.",
      };
    }

    const ownerCommit = deriveOwnerCommit(witness.tenantSecret);
    const receiptId = deriveReceiptId(nullifier, listing.idHash, computedCommit);
    const passExpiry = this.currentLedgerEpoch + PASS_VALIDITY_SEC;

    const receipt: PublicReceiptRecord = {
      receiptId,
      listingId: listing.id,
      listingIdHash: listing.idHash,
      listingTitle: listing.title,
      listingTemplate: listing.template,
      listingMode: listing.mode,
      currencyCode: listing.currencyCode,
      issuerName: issuer.name,
      nullifier,
      ownerCommit,
      applicantIdCommit: witness.applicantIdCommit,
      status: 1,
      issuedAtEpoch: this.currentLedgerEpoch,
      expiresAtEpoch: passExpiry,
      revokedAtEpoch: null,
      proofDurationMs: 22,
      circuitName: "submitQualificationProof",
    };

    this.usedNullifiers.add(nullifier);
    this.receipts.set(receiptId, receipt);
    this.totalVerifiedPasses += 1;

    return { ok: true, circuit: "submitQualificationProof", receipt };
  }

  revokeReceipt(receiptId: string, callerTenantSecret: string): CircuitExecutionResult {
    const rec = this.receipts.get(receiptId);
    if (!rec) {
      return {
        ok: false,
        circuit: "revokeReceipt",
        errorCode: "UNKNOWN_RECEIPT",
        humanReason: "Receipt ID not found on the Midnight ledger.",
      };
    }
    if (rec.status === 2) {
      return {
        ok: false,
        circuit: "revokeReceipt",
        errorCode: "ALREADY_REVOKED",
        humanReason: "This Pre-Qualification Pass was already revoked.",
      };
    }
    if (deriveOwnerCommit(callerTenantSecret) !== rec.ownerCommit) {
      return {
        ok: false,
        circuit: "revokeReceipt",
        errorCode: "UNAUTHORIZED_REVOKE",
        humanReason: "Rejected: Caller does not own the private tenantSecret for this pass.",
      };
    }
    rec.status = 2;
    rec.revokedAtEpoch = this.currentLedgerEpoch;
    return { ok: true, circuit: "revokeReceipt", receipt: rec };
  }

  /**
   * True Off-Chain Walletless Verifier Query (NO ZK circuit execution required by landlord!).
   * Enforces BOTH listing binding (prevents cheap-room -> penthouse forwarding) AND 14-day expiry!
   */
  queryPublicReceipt(receiptId: string, expectedListingId?: string): VerifyReceiptResult {
    const rec = this.receipts.get(receiptId) ?? null;
    if (!rec) {
      return {
        status: 0,
        humanReason: "Receipt not found on Midnight public ledger.",
        receipt: null,
      };
    }
    if (expectedListingId && rec.listingId !== expectedListingId) {
      return {
        status: 0,
        errorCode: "LISTING_MISMATCH",
        humanReason: `Rejected: Pass was issued for "${rec.listingTitle}", NOT for the requested listing (${expectedListingId}). Cross-listing forwarding blocked!`,
        receipt: rec,
      };
    }
    if (rec.status === 2) {
      return {
        status: 2,
        humanReason: "Pass was revoked by the tenant via revokeReceipt().",
        receipt: rec,
      };
    }
    if (this.currentLedgerEpoch > rec.expiresAtEpoch) {
      return {
        status: 3,
        humanReason: "Pass exceeded its 14-day validity window (EXPIRED).",
        receipt: rec,
      };
    }
    return {
      status: 1,
      humanReason: "Verified QUALIFIED for this exact listing. Raw salary & balance remain hidden.",
      receipt: rec,
    };
  }

  getSnapshot(): LedgerSnapshot {
    return {
      currentLedgerEpoch: this.currentLedgerEpoch,
      issuers: Array.from(this.issuers.values()),
      listings: Array.from(this.listings.values()),
      anchoredAttestationCount: this.anchoredAttestations.size,
      usedNullifiers: Array.from(this.usedNullifiers.values()),
      receipts: Array.from(this.receipts.values()).sort(
        (a, b) => b.issuedAtEpoch - a.issuedAtEpoch
      ),
      totalVerifiedPasses: this.totalVerifiedPasses,
    };
  }
}

export function createSeededLeaseProofEngine(initialEpoch = 1_795_600_000): LeaseProofContractEngine {
  const engine = new LeaseProofContractEngine(
    deriveAdminCommit(DEFAULT_ADMIN_SECRET),
    initialEpoch
  );

  engine.registerIssuer({
    id: "plaid-us",
    name: "Plaid Open Banking (US/UK)",
    providerType: "Open Banking",
    issuerKeyCommit: deriveIssuerKeyCommit(DEMO_ISSUER_SECRETS["plaid-us"]),
    callerAdminSecret: DEFAULT_ADMIN_SECRET,
  });
  engine.registerIssuer({
    id: "tink-eu",
    name: "Tink Open Banking (EU/GDPR)",
    providerType: "Open Banking",
    issuerKeyCommit: deriveIssuerKeyCommit(DEMO_ISSUER_SECRETS["tink-eu"]),
    callerAdminSecret: DEFAULT_ADMIN_SECRET,
  });
  engine.registerIssuer({
    id: "argyle-payroll",
    name: "Argyle Verified Payroll",
    providerType: "Payroll API",
    issuerKeyCommit: deriveIssuerKeyCommit(DEMO_ISSUER_SECRETS["argyle-payroll"]),
    callerAdminSecret: DEFAULT_ADMIN_SECRET,
  });

  // 1 Flexible Contract -> 3 Real-World Rental Verticals (with explicit ISO-4217 currency)
  engine.createListing({
    id: "apt-soho-204",
    title: "SoHo Lofts · 1BR Apartment ($2,400/mo)",
    location: "New York, NY",
    template: "APARTMENT",
    mode: 0,
    currencyCode: 840, // USD
    monthlyRent: 2400,
    minIncome: 7200,
    minBalance: 4800,
    landlordName: "Mercer Residential Group",
  });

  engine.createListing({
    id: "coliving-lisbon-09",
    title: "Nomad House · 6-Month Co-Living (€1,600/mo)",
    location: "Lisbon, Portugal (GDPR)",
    template: "FREELANCER_COLIVING",
    mode: 1, // Liquid Runway Only — no payslip required
    currencyCode: 978, // EUR
    monthlyRent: 1600,
    minIncome: 0,
    minBalance: 9600,
    landlordName: "Atlantic Co-Living Partners",
  });

  engine.createListing({
    id: "ev-fleet-model3",
    title: "VoltLease · 24-Month EV Subscription (€680/mo)",
    location: "Berlin, Germany (GDPR)",
    template: "VEHICLE_LEASE",
    mode: 0,
    currencyCode: 978, // EUR
    monthlyRent: 680,
    minIncome: 2720,
    minBalance: 2040,
    landlordName: "VoltLease Mobility GmbH",
  });

  return engine;
}
