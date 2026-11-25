// Midnight Lace Wallet (DApp Connector API) integration
// Spec: @midnight-ntwrk/dapp-connector-api (`window.midnight.mnLace`)
// Keeps LeaseProof 100% usable in Walletless Mode (landlord / judge sandbox)
// while enabling real Midnight Lace Wallet detection, connection & service URI inspection.

export interface MidnightWalletState {
  address: string;
  coinPublicKey: string;
  encryptionPublicKey: string;
}

export interface MidnightServiceUriConfig {
  indexerUri: string;
  indexerWsUri: string;
  proverServerUri: string;
  substrateNodeUri?: string;
}

export interface MidnightWalletApi {
  state: () => Promise<MidnightWalletState>;
}

export interface MidnightLaceProvider {
  name?: string;
  apiVersion?: string;
  enable: () => Promise<MidnightWalletApi>;
  isEnabled: () => Promise<boolean>;
  serviceUriConfig: () => Promise<MidnightServiceUriConfig>;
}

declare global {
  interface Window {
    midnight?: {
      mnLace?: MidnightLaceProvider;
    };
  }
}

export interface LaceConnectionResult {
  connected: boolean;
  installed: boolean;
  address?: string;
  coinPublicKey?: string;
  apiVersion?: string;
  proverServerUri?: string;
  indexerUri?: string;
  error?: string;
}

export function isMidnightLaceInstalled(): boolean {
  return typeof window !== "undefined" && Boolean(window.midnight?.mnLace);
}

export async function connectMidnightLace(): Promise<LaceConnectionResult> {
  if (typeof window === "undefined" || !window.midnight?.mnLace) {
    return {
      connected: false,
      installed: false,
      error:
        "Midnight Lace Wallet extension not detected. Continuing in Transparent 1:1 Browser Sandbox.",
    };
  }

  try {
    const provider = window.midnight.mnLace;
    const walletApi = await provider.enable();
    const state = await walletApi.state();
    let uris: MidnightServiceUriConfig | undefined;
    try {
      uris = await provider.serviceUriConfig();
    } catch {
      // Optional in some Lace versions
    }

    return {
      connected: true,
      installed: true,
      address: state.address,
      coinPublicKey: state.coinPublicKey,
      apiVersion: provider.apiVersion ?? "1.x",
      proverServerUri: uris?.proverServerUri,
      indexerUri: uris?.indexerUri,
    };
  } catch (err) {
    return {
      connected: false,
      installed: true,
      error:
        err instanceof Error
          ? err.message
          : "User rejected Midnight Lace Wallet connection.",
    };
  }
}

export function shortMidnightAddr(addr: string): string {
  if (addr.length <= 18) return addr;
  return `${addr.slice(0, 10)}...${addr.slice(-6)}`;
}
