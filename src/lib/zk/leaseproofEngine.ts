// SPDX-License-Identifier: Apache-2.0
// LeaseProof — TypeScript Mirror Engine for contracts/leaseproof.compact
// Mirrors every Compact dual-ledger invariant, SHA-256 commitment, listing-scoped nullifier,
// tenant-controlled revocation, and zero-bit privacy boundary.

export type ListingMode = 0 | 1; // 0 = Income + Deposit (Apartment / Vehicle), 1 = Liquid Runway Only (Freelancer / Co-Living)
export type TemplateType = "APARTMENT" | "FREELANCER_COLIVING" | "VEHICLE_LEASE";
export type ReceiptStatus = 0 | 1 | 2; // 0 = NOT_FOUND, 1 = QUALIFIED, 2 = REVOKED

export type CompactAssertionCode =
  | "UNKNOWN_ISSUER"
  | "INVALID_LISTING_MODE"
  | "INVALID_BALANCE_THRESHOLD"
  | "UNKNOWN_LISTING"
  | "INVALID_PASS_EXPIRY"
  | "UNTRUSTED_ISSUER"
  | "REVOKED_ISSUER"
  | "EXPIRED_ATTESTATION"
  | "TAMPERED_COMMITMENT"
  | "INSUFFICIENT_BALANCE"
  | "INSUFFICIENT_INCOME"
  | "REPLAY_ATTACK"
  | "UNKNOWN_RECEIPT"
  | "ALREADY_REVOKED"
  | "UNAUTHORIZED_REVOKE";

export interface IssuerRecord {
  id: string;
  idHash: string;
  name: string;
  providerType: "Open Banking" | "Payroll API" | "Enterprise Employer";
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
  monthlyRentUsd: number;
  minIncomeUsd: number;
  minBalanceUsd: number;
  landlordName: string;
  createdAt: number;
}

export interface PrivateTenantWitness {
  tenantLabel: string;
  tenantSecret: string;
  monthlyIncomeUsd: number;
  liquidBalanceUsd: number;
  attestationIssuerId: string;
  attestationExpiryEpoch: number;
  attestationNonce: string;
  attestedCommitment: string;
}

export interface PublicReceiptRecord {
  receiptId: string;
  listingId: string;
  listingTitle: string;
  listingTemplate: TemplateType;
  listingMode: ListingMode;
  issuerName: string;
  nullifier: string;
  ownerCommit: string;
  status: ReceiptStatus;
  issuedAtEpoch: number;
  expiresAtEpoch: number;
  revokedAtEpoch: number | null;
  proofDurationMs: number;
  circuitName: "submitQualificationProof";
  leakedSalaryBits: 0;
  leakedBalanceBits: 0;
  leakedIdentityBits: 0;
}

export interface CircuitExecutionResult {
  ok: boolean;
  circuit: string;
  errorCode?: CompactAssertionCode;
  humanReason?: string;
  receipt?: PublicReceiptRecord;
  privacyAudit?: {
    privateWitnessFields: Array<{ label: string; value: string; disclosed: false }>;
    publicLedgerFields: Array<{ label: string; value: string; disclosed: true }>;
    leakedSecretBits: 0;
  };
}

export interface LedgerSnapshot {
  issuers: IssuerRecord[];
  listings: ListingRecord[];
  usedNullifiers: string[];
  receipts: PublicReceiptRecord[];
  totalVerifiedPasses: number;
}

/**
 * Deterministic 256-bit hash (pure JS SHA-256) so it runs identically in Node (Vitest)
 * and browser environments without async WebCrypto friction inside synchronous simulation tests.
 */
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

export function deriveOwnerCommit(tenantSecret: string): string {
  return "0x" + sha256Hex(`leaseproof:owner|${tenantSecret}`);
}

export function deriveListingNullifier(tenantSecret: string, listingIdHash: string): string {
  return "0x" + sha256Hex(`leaseproof:nullifier|${tenantSecret}|${listingIdHash}`);
}

export function computeAttestationCommitment(
  issuerIdHash: string,
  monthlyIncomeUsd: number,
  liquidBalanceUsd: number,
  nonce: string
): string {
  return (
    "0x" +
    sha256Hex(
      `leaseproof:attest|${issuerIdHash}|${Math.floor(monthlyIncomeUsd)}|${Math.floor(liquidBalanceUsd)}|${nonce}`
    )
  );
}

export function deriveReceiptId(
  nullifier: string,
  listingIdHash: string,
  attestedCommitment: string
): string {
  return "0x" + sha256Hex(`leaseproof:receipt|${nullifier}|${listingIdHash}|${attestedCommitment}`);
}

export class LeaseProofContractEngine {
  private issuers = new Map<string, IssuerRecord>();
  private listings = new Map<string, ListingRecord>();
  private usedNullifiers = new Set<string>();
  private receipts = new Map<string, PublicReceiptRecord>();
  private totalVerifiedPasses = 0;

  registerIssuer(
    id: string,
    name: string,
    providerType: IssuerRecord["providerType"],
    nowEpoch = Math.floor(Date.now() / 1000)
  ): IssuerRecord {
    const idHash = "0x" + sha256Hex(`issuer:${id}`);
    const rec: IssuerRecord = {
      id,
      idHash,
      name,
      providerType,
      active: true,
      registeredAt: nowEpoch,
    };
    this.issuers.set(id, rec);
    return rec;
  }

  revokeIssuer(id: string): CircuitExecutionResult {
    const rec = this.issuers.get(id);
    if (!rec) {
      return {
        ok: false,
        circuit: "revokeIssuer",
        errorCode: "UNKNOWN_ISSUER",
        humanReason: `Issuer "${id}" is not registered on the Midnight ledger.`,
      };
    }
    rec.active = false;
    return { ok: true, circuit: "revokeIssuer" };
  }

  reinstateIssuer(id: string): CircuitExecutionResult {
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

  createListing(params: {
    id: string;
    title: string;
    location: string;
    template: TemplateType;
    mode: ListingMode;
    monthlyRentUsd: number;
    minIncomeUsd: number;
    minBalanceUsd: number;
    landlordName: string;
    nowEpoch?: number;
  }): CircuitExecutionResult & { listing?: ListingRecord } {
    if (params.mode !== 0 && params.mode !== 1) {
      return {
        ok: false,
        circuit: "createListing",
        errorCode: "INVALID_LISTING_MODE",
        humanReason: "Listing mode must be 0 (Income + Deposit) or 1 (Liquid Runway Only).",
      };
    }
    if (params.minBalanceUsd <= 0) {
      return {
        ok: false,
        circuit: "createListing",
        errorCode: "INVALID_BALANCE_THRESHOLD",
        humanReason: "Minimum liquid balance threshold must be greater than $0.",
      };
    }

    const listing: ListingRecord = {
      id: params.id,
      idHash: "0x" + sha256Hex(`listing:${params.id}`),
      title: params.title,
      location: params.location,
      template: params.template,
      mode: params.mode,
      monthlyRentUsd: params.monthlyRentUsd,
      minIncomeUsd: params.mode === 1 ? 0 : params.minIncomeUsd,
      minBalanceUsd: params.minBalanceUsd,
      landlordName: params.landlordName,
      createdAt: params.nowEpoch ?? Math.floor(Date.now() / 1000),
    };
    this.listings.set(listing.id, listing);
    return { ok: true, circuit: "createListing", listing };
  }

  issueSignedAttestation(params: {
    tenantLabel: string;
    tenantSecret: string;
    issuerId: string;
    monthlyIncomeUsd: number;
    liquidBalanceUsd: number;
    expiresAtEpoch: number;
    nonce?: string;
  }): PrivateTenantWitness {
    const issuerHash = "0x" + sha256Hex(`issuer:${params.issuerId}`);
    const nonce = params.nonce ?? sha256Hex(`${params.tenantSecret}:${params.issuerId}:${params.expiresAtEpoch}`).slice(0, 24);
    const attestedCommitment = computeAttestationCommitment(
      issuerHash,
      params.monthlyIncomeUsd,
      params.liquidBalanceUsd,
      nonce
    );
    return {
      tenantLabel: params.tenantLabel,
      tenantSecret: params.tenantSecret,
      monthlyIncomeUsd: params.monthlyIncomeUsd,
      liquidBalanceUsd: params.liquidBalanceUsd,
      attestationIssuerId: params.issuerId,
      attestationExpiryEpoch: params.expiresAtEpoch,
      attestationNonce: nonce,
      attestedCommitment,
    };
  }

  submitQualificationProof(
    listingId: string,
    witness: PrivateTenantWitness,
    currentEpoch: number,
    passExpiryEpoch: number
  ): CircuitExecutionResult {
    const t0 = Date.now();
    const listing = this.listings.get(listingId);
    if (!listing) {
      return {
        ok: false,
        circuit: "submitQualificationProof",
        errorCode: "UNKNOWN_LISTING",
        humanReason: `Listing "${listingId}" does not exist on the Midnight ledger.`,
      };
    }
    if (passExpiryEpoch <= currentEpoch) {
      return {
        ok: false,
        circuit: "submitQualificationProof",
        errorCode: "INVALID_PASS_EXPIRY",
        humanReason: "Verification Pass expiry must be strictly in the future.",
      };
    }

    const issuer = this.issuers.get(witness.attestationIssuerId);
    if (!issuer) {
      return {
        ok: false,
        circuit: "submitQualificationProof",
        errorCode: "UNTRUSTED_ISSUER",
        humanReason: `Rejected: Attester "${witness.attestationIssuerId}" is not in the trusted Open Banking / Payroll registry.`,
      };
    }
    if (!issuer.active) {
      return {
        ok: false,
        circuit: "submitQualificationProof",
        errorCode: "REVOKED_ISSUER",
        humanReason: `Rejected: Attester "${issuer.name}" has been revoked on-chain and cannot sign new proofs.`,
      };
    }

    if (witness.attestationExpiryEpoch < currentEpoch) {
      return {
        ok: false,
        circuit: "submitQualificationProof",
        errorCode: "EXPIRED_ATTESTATION",
        humanReason: "Rejected: Financial attestation is older than its allowed freshness window.",
      };
    }

    const computedCommit = computeAttestationCommitment(
      issuer.idHash,
      witness.monthlyIncomeUsd,
      witness.liquidBalanceUsd,
      witness.attestationNonce
    );
    if (computedCommit !== witness.attestedCommitment) {
      return {
        ok: false,
        circuit: "submitQualificationProof",
        errorCode: "TAMPERED_COMMITMENT",
        humanReason:
          "Rejected: Local salary or balance was modified after the bank/payroll attester signed the commitment.",
      };
    }

    if (witness.liquidBalanceUsd < listing.minBalanceUsd) {
      return {
        ok: false,
        circuit: "submitQualificationProof",
        errorCode: "INSUFFICIENT_BALANCE",
        humanReason: `Rejected: Private liquid balance failed the in-circuit threshold (required >= $${listing.minBalanceUsd.toLocaleString("en-US")}).`,
      };
    }

    if (listing.mode === 0 && witness.monthlyIncomeUsd < listing.minIncomeUsd) {
      return {
        ok: false,
        circuit: "submitQualificationProof",
        errorCode: "INSUFFICIENT_INCOME",
        humanReason: `Rejected: Private monthly income failed the in-circuit threshold (required >= $${listing.minIncomeUsd.toLocaleString("en-US")}/mo).`,
      };
    }

    const nullifier = deriveListingNullifier(witness.tenantSecret, listing.idHash);
    if (this.usedNullifiers.has(nullifier)) {
      return {
        ok: false,
        circuit: "submitQualificationProof",
        errorCode: "REPLAY_ATTACK",
        humanReason:
          "Rejected: Listing-scoped nullifier already spent. This tenant already submitted a proof for this exact listing.",
      };
    }

    const ownerCommit = deriveOwnerCommit(witness.tenantSecret);
    const receiptId = deriveReceiptId(nullifier, listing.idHash, witness.attestedCommitment);
    const durationMs = Math.max(12, Date.now() - t0 + 18);

    const receipt: PublicReceiptRecord = {
      receiptId,
      listingId: listing.id,
      listingTitle: listing.title,
      listingTemplate: listing.template,
      listingMode: listing.mode,
      issuerName: issuer.name,
      nullifier,
      ownerCommit,
      status: 1,
      issuedAtEpoch: currentEpoch,
      expiresAtEpoch: passExpiryEpoch,
      revokedAtEpoch: null,
      proofDurationMs: durationMs,
      circuitName: "submitQualificationProof",
      leakedSalaryBits: 0,
      leakedBalanceBits: 0,
      leakedIdentityBits: 0,
    };

    this.usedNullifiers.add(nullifier);
    this.receipts.set(receiptId, receipt);
    this.totalVerifiedPasses += 1;

    return {
      ok: true,
      circuit: "submitQualificationProof",
      receipt,
      privacyAudit: {
        privateWitnessFields: [
          {
            label: "Monthly Income (Witness)",
            value: `$${witness.monthlyIncomeUsd.toLocaleString("en-US")}/mo`,
            disclosed: false,
          },
          {
            label: "Liquid Bank Balance (Witness)",
            value: `$${witness.liquidBalanceUsd.toLocaleString("en-US")}`,
            disclosed: false,
          },
          {
            label: "Tenant Secret Key (Witness)",
            value: `${witness.tenantSecret.slice(0, 10)}...`,
            disclosed: false,
          },
          {
            label: "Attestation Nonce (Witness)",
            value: `${witness.attestationNonce.slice(0, 12)}...`,
            disclosed: false,
          },
        ],
        publicLedgerFields: [
          { label: "Qualification Verdict", value: "QUALIFIED (1)", disclosed: true },
          { label: "Receipt ID", value: `${receiptId.slice(0, 18)}...`, disclosed: true },
          { label: "Listing Nullifier", value: `${nullifier.slice(0, 18)}...`, disclosed: true },
          { label: "Trusted Attester", value: issuer.name, disclosed: true },
        ],
        leakedSecretBits: 0,
      },
    };
  }

  revokeReceipt(
    receiptId: string,
    callerTenantSecret: string,
    nowEpoch = Math.floor(Date.now() / 1000)
  ): CircuitExecutionResult {
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
        humanReason: "This Verification Pass was already revoked by the tenant.",
      };
    }

    const callerCommit = deriveOwnerCommit(callerTenantSecret);
    if (callerCommit !== rec.ownerCommit) {
      return {
        ok: false,
        circuit: "revokeReceipt",
        errorCode: "UNAUTHORIZED_REVOKE",
        humanReason:
          "Rejected: Caller does not own the private tenantSecret that created this Verification Pass.",
      };
    }

    rec.status = 2;
    rec.revokedAtEpoch = nowEpoch;
    return { ok: true, circuit: "revokeReceipt", receipt: rec };
  }

  verifyReceipt(receiptId: string): { status: ReceiptStatus; receipt: PublicReceiptRecord | null } {
    const rec = this.receipts.get(receiptId) ?? null;
    return { status: rec ? rec.status : 0, receipt: rec };
  }

  getSnapshot(): LedgerSnapshot {
    return {
      issuers: Array.from(this.issuers.values()),
      listings: Array.from(this.listings.values()),
      usedNullifiers: Array.from(this.usedNullifiers.values()),
      receipts: Array.from(this.receipts.values()).sort(
        (a, b) => b.issuedAtEpoch - a.issuedAtEpoch
      ),
      totalVerifiedPasses: this.totalVerifiedPasses,
    };
  }
}

export function createSeededLeaseProofEngine(nowEpoch = 1_795_600_000): LeaseProofContractEngine {
  const engine = new LeaseProofContractEngine();

  // Seed 3 real-world Open Banking & Payroll Attesters
  engine.registerIssuer("plaid-us", "Plaid Open Banking (US/UK)", "Open Banking", nowEpoch - 86400 * 30);
  engine.registerIssuer("tink-eu", "Tink Open Banking (EU/GDPR)", "Open Banking", nowEpoch - 86400 * 25);
  engine.registerIssuer("argyle-payroll", "Argyle Verified Payroll", "Payroll API", nowEpoch - 86400 * 14);

  // Seed the 3 Locked Real-World Templates
  engine.createListing({
    id: "apt-soho-204",
    title: "SoHo Lofts · 1BR Apartment ($2,400/mo)",
    location: "New York, NY",
    template: "APARTMENT",
    mode: 0,
    monthlyRentUsd: 2400,
    minIncomeUsd: 7200, // 3x monthly rent
    minBalanceUsd: 4800, // 2x deposit
    landlordName: "Mercer Residential Group",
    nowEpoch: nowEpoch - 86400 * 3,
  });

  engine.createListing({
    id: "coliving-lisbon-09",
    title: "Nomad House · 6-Month Co-Living Suite ($1,600/mo)",
    location: "Lisbon, Portugal (GDPR)",
    template: "FREELANCER_COLIVING",
    mode: 1, // Liquid Runway Only — NO payslip needed!
    monthlyRentUsd: 1600,
    minIncomeUsd: 0,
    minBalanceUsd: 9600, // 6x monthly rent runway
    landlordName: "Atlantic Co-Living Partners",
    nowEpoch: nowEpoch - 86400 * 2,
  });

  engine.createListing({
    id: "ev-fleet-model3",
    title: "VoltLease · 24-Month EV Subscription ($680/mo)",
    location: "Berlin, Germany (GDPR)",
    template: "VEHICLE_LEASE",
    mode: 0,
    monthlyRentUsd: 680,
    minIncomeUsd: 2720, // 4x monthly lease
    minBalanceUsd: 2040, // 3x deposit
    landlordName: "VoltLease Mobility GmbH",
    nowEpoch: nowEpoch - 86400,
  });

  return engine;
}
