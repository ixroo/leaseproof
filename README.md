# LeaseProof — Privacy-First Rental Pre-Qualification & Viewing Pass on Midnight

> **"Pre-qualify for apartment viewings—without spraying your bank statements, payslips, or ID to 20 brokers."**

Built for **AKINDO × Midnight "Build Privacy-First Apps on Midnight" (3rd Wave)**.  
Licensed under **Apache License 2.0**.

---

## Why LeaseProof? (Real-World Market Pain & Honest Scope)

- **93.3%** of US rental housing providers experienced application fraud in the past 12 months (*NMHC Pulse Survey*).
- **84.3%** of that fraud involves **falsified pay stubs or doctored bank statements**, with up to **1 in 8** rental applications containing fraudulent income PDFs (*Snappt*).
- Meanwhile, honest renters (salaried employees, freelancers, remote workers, expats) are forced to spray raw bank statements, payslips, and ID scans over email/WhatsApp to 15–20 brokers just to book apartment viewings—violating **EU GDPR Article 5(1)(c) (Data Minimization)** and creating massive breach liability for agencies.

**LeaseProof** targets the high-leakage **Pre-Qualification & Viewing stage** (final lease signing still uses standard legal ID & eviction checks). Sits on top of existing Open Banking & Payroll attesters (Plaid, Tink, Argyle, Finch) using **Midnight Compact zero-knowledge smart contracts**:
- **Tenants** prove affordability (`income >= 3x rent & deposit`, or `6-month liquid runway` with `$0` payslip) via **threshold-only proofs** (zero raw salary, balance, or bank PDFs disclosed)—and can **revoke** any pass in 1 click.
- **Landlords & Brokers** verify qualification **wallet-free off-chain in < 3 seconds** by reading the public Midnight ledger, blocking Photoshopped PDFs, cross-listing forwarding, and straw applicants.

---

## Hardened Midnight Dual-Ledger Architecture (`contracts/leaseproof.compact`)

| Layer | Data Stored / Processed | Visibility |
| :--- | :--- | :--- |
| **Private Witnesses (Local)** | `tenantSecret`, `issuerSecret`, `adminSecret`, `monthlyIncome`, `liquidBalance`, `currencyCode`, `attestationNonce`, `applicantIdCommit` | **100% Private (Never leaves device)** |
| **Public Midnight Ledger** | `registryAdminCommit`, `currentLedgerEpoch`, `trustedIssuers`, `issuerKeyCommits`, `anchoredAttestations`, `listingMode`, `listingCurrency`, `listingMinIncome`, `listingMinBalance`, `usedNullifiers`, `verifiedReceipts`, `receiptListingId`, `receiptExpiry`, `receiptOwnerCommit`, `receiptApplicantId` | **Publicly Verifiable (Off-chain readable, zero raw financials)** |

### 6 Hardened State-Changing Compact Circuits (Read-Only Verification Happens Off-Chain)
1. `registerIssuer(issuerId, issuerKeyCommit)` — **Admin-gated** via `registryAdminCommit`; registers a trusted Open Banking / Payroll attester and binds its signing key commitment.
2. `revokeIssuer(issuerId)` — **Admin-gated**; immediately blocks new proofs from a compromised attester.
3. `advanceEpoch(newEpoch)` — **Admin-gated monotonic ledger clock** (`EPOCH_CANNOT_GO_BACKWARD`) so provers cannot forge `currentEpoch` or extend pass expiry.
4. `anchorAttestation(issuerId, attestationCommitment, expiresAtEpoch)` — **Issuer-key-authenticated** (`UNAUTHORIZED_ISSUER_KEY`); anchors signed attestations on-ledger so tenants cannot locally edit salary and re-hash to bypass `TAMPERED_COMMITMENT`.
5. `createListing(listingId, mode, currencyCode, minIncome, minBalance)` — **1 flexible contract, 2 circuit modes, 3 verticals**: `mode = 0` (Apartment/Vehicle Income + Deposit) and `mode = 1` (Freelancer 6-Month Liquid Runway), enforcing **ISO-4217 currency parity** (`CURRENCY_MISMATCH`).
6. `submitQualificationProof(listingId)` & `revokeReceipt(receiptId)` — Enforces issuer anchoring, active status, monotonic expiry, currency match, threshold check, **attester-bound windowed nullifier** (blocks secret-rotation spam while allowing re-apply after 14-day expiry), **listing-bound receipts** (`LISTING_MISMATCH`), **anti-straw-applicant KYC binding** (`applicantIdCommit`), and **tenant-only revocation**.

> **Transparent Execution Note:** The live web workspace (`/app`) runs an explicit **Simulated Compact Sandbox** (`src/lib/zk/leaseproofEngine.ts`) mirroring every circuit invariant 1:1 for zero-wallet judge evaluation, while the real `contracts/leaseproof.compact` is compiled by the official Midnight `compact` compiler in GitHub Actions Ubuntu Linux CI.

---

## Automated QA & 12 Adversarial Attack Defenses

Run `npm test` to execute **17 Vitest unit & adversarial tests** proving the hardened circuit rejects:
1. `TAMPERED_COMMITMENT` (even if a tenant edits salary locally AND recomputes the commitment hash, it fails `ATTESTATION_NOT_ANCHORED`)
2. `UNAUTHORIZED_ADMIN` (non-admin attempts to register/revoke an issuer or manipulate ledger epoch)
3. `UNAUTHORIZED_ISSUER_KEY` (attacker tries to anchor a fake attestation without the issuer's secret)
4. `LISTING_MISMATCH` (tenant qualifies for a cheap `$500` room and forwards the receipt to a `$5,000` luxury listing)
5. `CURRENCY_MISMATCH` (EUR/IDR attestation submitted to a USD listing)
6. `REPLAY_ATTACK` (even if tenant rotates `tenantSecret`, attester-bound windowed nullifier blocks same-window spam, while allowing legitimate re-apply after 14-day expiry)
7. `EPOCH_CANNOT_GO_BACKWARD` (clock rollback attempt rejected)
8. `INSUFFICIENT_INCOME` (salary `$1` below threshold)
9. `INSUFFICIENT_BALANCE` (freelancer `$1` below 6-month runway)
10. `UNTRUSTED_ISSUER` (unregistered fake bank attester)
11. `REVOKED_ISSUER` (compromised attester revoked on-chain)
12. `EXPIRED_ATTESTATION` & `UNAUTHORIZED_REVOKE` (stale attestation & stranger revoke attempt)

---

## CI Compilation & Local Setup

- **GitHub Actions Linux CI (`.github/workflows/compact-ci.yml`):** Automatically installs the official Midnight `compact` compiler (`0.36.1`) on Ubuntu Linux, compiles `contracts/leaseproof.compact`, executes **real compiled-circuit runtime tests** (`contracts/witnesses.ts` + `contracts/__tests__/compiled-circuit.test.ts` on `@midnight-ntwrk/compact-runtime`), and runs `npm test`, `npm run lint`, and `npm run build` on every push.
- **Midnight Lace Wallet DApp Connector (`src/lib/midnight/laceWallet.ts`):** Detects and connects `window.midnight.mnLace` in `/app` while keeping walletless verification (`/verify`) and transparent sandbox testing 100% frictionless.

```bash
npm install
npm test          # 17 unit & hardened adversarial ZK tests (Vitest)
npm run test:compact  # Real compiled Compact circuit tests (runs after `compact compile` on Linux CI)
npm run lint      # ESLint (0 warnings)
npm run build     # Next.js production build
npm run dev       # Start local dev server
```

---

## Why Web2 Substitutes Fail vs. LeaseProof (Midnight ZK)

| Approach | Stops Fake PDFs? | Tenant Keeps Salary/Balance Private? | Reusable Across 20 Listings? | Landlord Cost & Wallet Friction |
| :--- | :---: | :---: | :---: | :--- |
| **Email / WhatsApp PDFs** | No (84.3% fraud vector) | No (raw PDFs leaked to 20 brokers) | Yes, but leaks data every time | High GDPR breach liability |
| **Web2 Screening Portals (Zillow / Snappt)** | Partial (document forensics) | No (centralized bank PDF storage) | No (`$35–$50` per listing) | High fees & centralized honeypot |
| **LeaseProof (Midnight Compact ZK)** | **Yes (issuer-anchored on-ledger)** | **Yes (local private witnesses only)** | **Yes (`$1.99 / 30d` reusable pass)** | **`$0 Forever` · True Walletless Verifier** |

## Builder & Pilot Ask

- **Builder:** Independent full-stack & ZK product builder (`@Szoool` · [`github.com/ixroo`](https://github.com/ixroo))
- **Wave 3 / Wave 4 Ask:** Grant support funds live Midnight Preprod deployment with Lace Wallet & Proof Server, Plaid/Tink EU webhook attester infrastructure (`anchorAttestation()`), and pilot onboarding with 3–5 co-living operators and independent letting agencies.

---

## License & Ecosystem Attribution

- **License:** [Apache-2.0](./LICENSE)
- **Ecosystem:** Built for **Midnight Network** (`midnightntwrk`) — AKINDO Build Privacy-First Apps on Midnight (Wave 3).
