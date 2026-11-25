// SPDX-License-Identifier: Apache-2.0
// Official Midnight Private State & Witness Providers for contracts/leaseproof.compact
//
// All sensitive tenant financial values (monthlyIncomeUsd, liquidBalanceUsd,
// attestationCurrency, attestationNonce, tenantSecret, applicantIdCommit)
// remain strictly inside local private state and are NEVER disclosed on-chain.

import type { WitnessContext } from "@midnight-ntwrk/compact-runtime";

export interface LeaseProofPrivateState {
  adminSecret: Uint8Array;
  issuerSecret: Uint8Array;
  tenantSecret: Uint8Array;
  applicantIdCommit: Uint8Array;
  monthlyIncomeUsd: bigint;
  liquidBalanceUsd: bigint;
  attestationCurrency: bigint;
  attestationIssuerId: Uint8Array;
  attestationExpiryEpoch: bigint;
  attestationNonce: Uint8Array;
}

const ZERO_BYTES_32 = new Uint8Array(32);

export function padBytes32(input: string): Uint8Array {
  const encoded = new TextEncoder().encode(input);
  const out = new Uint8Array(32);
  out.set(encoded.subarray(0, 32));
  return out;
}

export function createInitialPrivateState(
  overrides: Partial<LeaseProofPrivateState> = {}
): LeaseProofPrivateState {
  return {
    adminSecret: new Uint8Array(ZERO_BYTES_32),
    issuerSecret: new Uint8Array(ZERO_BYTES_32),
    tenantSecret: new Uint8Array(ZERO_BYTES_32),
    applicantIdCommit: new Uint8Array(ZERO_BYTES_32),
    monthlyIncomeUsd: BigInt(0),
    liquidBalanceUsd: BigInt(0),
    attestationCurrency: BigInt(840),
    attestationIssuerId: new Uint8Array(ZERO_BYTES_32),
    attestationExpiryEpoch: BigInt(0),
    attestationNonce: new Uint8Array(ZERO_BYTES_32),
    ...overrides,
  };
}

// Witness providers matching every `witness` declared in contracts/leaseproof.compact
export const witnesses = {
  adminSecret: ({
    privateState,
  }: WitnessContext<unknown, LeaseProofPrivateState>): [
    LeaseProofPrivateState,
    Uint8Array,
  ] => [privateState, privateState.adminSecret],

  issuerSecret: ({
    privateState,
  }: WitnessContext<unknown, LeaseProofPrivateState>): [
    LeaseProofPrivateState,
    Uint8Array,
  ] => [privateState, privateState.issuerSecret],

  tenantSecret: ({
    privateState,
  }: WitnessContext<unknown, LeaseProofPrivateState>): [
    LeaseProofPrivateState,
    Uint8Array,
  ] => [privateState, privateState.tenantSecret],

  applicantIdCommit: ({
    privateState,
  }: WitnessContext<unknown, LeaseProofPrivateState>): [
    LeaseProofPrivateState,
    Uint8Array,
  ] => [privateState, privateState.applicantIdCommit],

  monthlyIncomeUsd: ({
    privateState,
  }: WitnessContext<unknown, LeaseProofPrivateState>): [
    LeaseProofPrivateState,
    bigint,
  ] => [privateState, privateState.monthlyIncomeUsd],

  liquidBalanceUsd: ({
    privateState,
  }: WitnessContext<unknown, LeaseProofPrivateState>): [
    LeaseProofPrivateState,
    bigint,
  ] => [privateState, privateState.liquidBalanceUsd],

  attestationCurrency: ({
    privateState,
  }: WitnessContext<unknown, LeaseProofPrivateState>): [
    LeaseProofPrivateState,
    bigint,
  ] => [privateState, privateState.attestationCurrency],

  attestationIssuerId: ({
    privateState,
  }: WitnessContext<unknown, LeaseProofPrivateState>): [
    LeaseProofPrivateState,
    Uint8Array,
  ] => [privateState, privateState.attestationIssuerId],

  attestationExpiryEpoch: ({
    privateState,
  }: WitnessContext<unknown, LeaseProofPrivateState>): [
    LeaseProofPrivateState,
    bigint,
  ] => [privateState, privateState.attestationExpiryEpoch],

  attestationNonce: ({
    privateState,
  }: WitnessContext<unknown, LeaseProofPrivateState>): [
    LeaseProofPrivateState,
    Uint8Array,
  ] => [privateState, privateState.attestationNonce],
};
