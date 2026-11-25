# LeaseProof — Privacy-First Rental & Lease Qualification on Midnight

> **"Prove you qualify to rent—without handing landlords your bank statements, payslips, or ID."**

Built for **AKINDO × Midnight "Build Privacy-First Apps on Midnight" (3rd Wave)**.  
Licensed under **Apache License 2.0**.

---

## Why LeaseProof? (Real-World Market Pain)

- **93.3%** of US rental housing providers experienced application fraud in the past 12 months (*NMHC Pulse Survey*).
- **84.3%** of that fraud involves **falsified pay stubs or doctored bank statements**, with up to **1 in 8** rental applications containing fraudulent income PDFs (*Snappt*).
- Meanwhile, honest renters (salaried employees, freelancers, remote workers, expats) are forced to send raw bank statements, payslips, and ID photos over email/WhatsApp—violating **EU GDPR Article 5(1)(c) (Data Minimization)** and creating massive data-breach liability for property agencies.

**LeaseProof** sits on top of existing Open Banking & Payroll attesters (Plaid, Tink, Argyle, Finch) and uses **Midnight Compact zero-knowledge smart contracts** so:
- **Tenants** prove affordability (`income >= 3x rent & deposit`, or `6-month liquid runway` with `$0` payslip) while keeping **100% of salary, balance, and identity private (`0 bits leaked`)**—and can **revoke** any landlord's pass in 1 click.
- **Landlords** verify qualification **wallet-free in < 3 seconds**, eliminating Photoshopped PDFs and GDPR PDF storage liability.

---

## Midnight Dual-Ledger Architecture (`contracts/leaseproof.compact`)

| Layer | Data Stored / Processed | Visibility |
| :--- | :--- | :--- |
| **Private Witnesses (Local)** | `tenantSecret`, `monthlyIncomeUsd`, `liquidBalanceUsd`, `attestationNonce`, `attestedCommitment` | **100% Private (Never leaves device)** |
| **Public Midnight Ledger** | `trustedIssuers`, `listingMode`, `listingMinIncome`, `listingMinBalance`, `usedNullifiers`, `verifiedReceipts` (`QUALIFIED` / `REVOKED`), `receiptOwnerCommit`, `receiptExpiry` | **Publicly Verifiable (0 bits of salary/balance)** |

### 7 Exported Compact Circuits
1. `registerIssuer(issuerId)` — Registers trusted Open Banking / Payroll attester on public ledger.
2. `revokeIssuer(issuerId)` — Immediately blocks new proofs from a compromised attester.
3. `createListing(listingId, mode, minIncomeUsd, minBalanceUsd)` — Supports `mode = 0` (Apartment/Vehicle Income + Deposit) and `mode = 1` (Freelancer 6-Month Liquid Runway).
4. `submitQualificationProof(listingId, currentEpoch, passExpiryEpoch)` — Enforces all 6 ZK invariants in-circuit and discloses only `(listingNullifier, receiptId, QUALIFIED)`.
5. `revokeReceipt(receiptId)` — Proves caller owns `tenantSecret()` matching `receiptOwnerCommit`, flipping pass to `REVOKED (2)`.
6. `verifyReceipt(receiptId)` — Walletless public status check (`0 = NOT_FOUND`, `1 = QUALIFIED`, `2 = REVOKED`).
7. Pure derivation helpers: `deriveOwnerCommit`, `deriveListingNullifier`, `deriveReceiptId`.

---

## Automated QA & 8 Adversarial Attack Tests

Run `npm test` to execute **17 Vitest unit & adversarial tests** proving the circuit rejects:
1. `INSUFFICIENT_INCOME` (salary `$1` below threshold)
2. `INSUFFICIENT_BALANCE` (freelancer `$1` below 6-month runway)
3. `UNTRUSTED_ISSUER` (fake Photoshopped bank attester)
4. `REVOKED_ISSUER` (compromised attester revoked on-chain)
5. `REPLAY_ATTACK` (duplicate submission to same listing)
6. `EXPIRED_ATTESTATION` (stale financial statement)
7. `TAMPERED_COMMITMENT` (tenant edits salary locally after signing)
8. `UNAUTHORIZED_REVOKE` (stranger/landlord tries to revoke tenant's pass)

---

## CI Compilation & Local Setup

- **GitHub Actions Linux CI (`.github/workflows/compact-ci.yml`):** Automatically installs the official Midnight `compact` compiler on Ubuntu Linux, compiles `contracts/leaseproof.compact`, and runs `npm test`, `npm run lint`, and `npm run build` on every push.

```bash
npm install
npm test        # 17 unit & adversarial ZK tests (Vitest)
npm run lint    # ESLint (0 warnings)
npm run build   # Next.js production build
npm run dev     # Start local dev server
```

---

## License & Ecosystem Attribution

- **License:** [Apache-2.0](./LICENSE)
- **Ecosystem:** Built for **Midnight Network** (`midnightntwrk`) — AKINDO Build Privacy-First Apps on Midnight (Wave 3).
