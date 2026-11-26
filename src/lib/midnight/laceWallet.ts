// Midnight Lace Wallet (DApp Connector API v4 + v3 Legacy) integration
// Supports:
// - Modern Unified Lace (@midnight-ntwrk/dapp-connector-api v4.0.0+): dynamic UUID keys under
//   `window.midnight`, `connect(networkId)`, `getShieldedAddresses()`, `getUnshieldedAddress()`,
//   and `getConfiguration()`.
// - Legacy Midnight Lace Preview (v1–v3): `window.midnight.mnLace`, `enable()`, `state()`,
//   and `serviceUriConfig()`.
// - Honest diagnostic when Unified Lace is installed in Cardano-only mode (`window.cardano.lace`)
//   or tab needs a reload after freshly installing Lace.
// Keeps LeaseProof 100% usable in Walletless Sandbox Mode for brokers and judges.

export interface MidnightWalletState {
  address: string;
  coinPublicKey: string;
  encryptionPublicKey: string;
}

export interface MidnightServiceUriConfig {
  indexerUri?: string;
  indexerWsUri?: string;
  proverServerUri?: string;
  substrateNodeUri?: string;
  networkId?: string;
}

export interface MidnightShieldedAddresses {
  shieldedAddress?: string;
  shieldedCoinPublicKey?: string;
  shieldedEncryptionPublicKey?: string;
}

export interface MidnightUnshieldedAddress {
  unshieldedAddress?: string;
}

export interface MidnightConnectedApi {
  // v4.0.0+ granular API
  getShieldedAddresses?: () => Promise<MidnightShieldedAddresses | string>;
  getUnshieldedAddress?: () => Promise<MidnightUnshieldedAddress | string>;
  getConfiguration?: () => Promise<MidnightServiceUriConfig>;
  // v1–v3 legacy API
  state?: () => Promise<MidnightWalletState>;
}

export interface MidnightInjectedProvider {
  rdns?: string;
  name?: string;
  icon?: string;
  apiVersion?: string;
  // v4.0.0+ InitialAPI
  connect?: (networkId: string) => Promise<MidnightConnectedApi>;
  // v1–v3 legacy provider
  enable?: () => Promise<MidnightConnectedApi>;
  isEnabled?: () => Promise<boolean>;
  serviceUriConfig?: () => Promise<MidnightServiceUriConfig>;
}

declare global {
  interface Window {
    midnight?: Record<string, MidnightInjectedProvider | undefined>;
    cardano?: Record<string, { name?: string; apiVersion?: string; enable?: () => Promise<unknown> } | undefined>;
  }
}

export interface DiscoveredMidnightWallet {
  key: string;
  name: string;
  rdns?: string;
  apiVersion?: string;
  provider: MidnightInjectedProvider;
}

export interface LaceConnectionResult {
  connected: boolean;
  installed: boolean;
  cardanoOnlyDetected?: boolean;
  walletName?: string;
  networkId?: string;
  address?: string;
  unshieldedAddress?: string;
  coinPublicKey?: string;
  apiVersion?: string;
  proverServerUri?: string;
  indexerUri?: string;
  error?: string;
}

const PREFERRED_NETWORKS = ["preprod", "preview", "mainnet", "undeployed"] as const;

function isValidMidnightProvider(candidate: unknown): candidate is MidnightInjectedProvider {
  if (!candidate || typeof candidate !== "object") return false;
  const p = candidate as MidnightInjectedProvider;
  return typeof p.connect === "function" || typeof p.enable === "function";
}

export function discoverMidnightWallets(): DiscoveredMidnightWallet[] {
  if (typeof window === "undefined" || !window.midnight || typeof window.midnight !== "object") {
    return [];
  }

  const found: DiscoveredMidnightWallet[] = [];
  for (const [key, value] of Object.entries(window.midnight)) {
    if (!isValidMidnightProvider(value)) continue;
    found.push({
      key,
      name: value.name ?? (key === "mnLace" ? "Lace (Midnight)" : key),
      rdns: value.rdns,
      apiVersion: value.apiVersion,
      provider: value,
    });
  }

  // Prioritize Lace providers first (dynamic UUID with rdns/name containing "lace", or legacy "mnLace")
  found.sort((a, b) => {
    const score = (w: DiscoveredMidnightWallet) => {
      const hay = `${w.key} ${w.name} ${w.rdns ?? ""}`.toLowerCase();
      return hay.includes("lace") ? 0 : 1;
    };
    return score(a) - score(b);
  });

  return found;
}

export function isCardanoLaceInstalled(): boolean {
  if (typeof window === "undefined" || !window.cardano || typeof window.cardano !== "object") {
    return false;
  }
  return Boolean(window.cardano.lace);
}

export function isMidnightLaceInstalled(): boolean {
  return discoverMidnightWallets().length > 0;
}

function isUserRejection(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  return /reject|denied|cancel|declined|refused|abort/i.test(msg);
}

async function extractConnectedDetails(
  walletApi: MidnightConnectedApi,
  provider: MidnightInjectedProvider
): Promise<{
  address?: string;
  unshieldedAddress?: string;
  coinPublicKey?: string;
  config?: MidnightServiceUriConfig;
}> {
  let address: string | undefined;
  let unshieldedAddress: string | undefined;
  let coinPublicKey: string | undefined;
  let config: MidnightServiceUriConfig | undefined;

  // v4 granular shielded addresses
  if (typeof walletApi.getShieldedAddresses === "function") {
    try {
      const shielded = await walletApi.getShieldedAddresses();
      if (typeof shielded === "string") {
        address = shielded;
      } else if (shielded && typeof shielded === "object") {
        address = shielded.shieldedAddress;
        coinPublicKey = shielded.shieldedCoinPublicKey;
      }
    } catch {
      // Optional fallback below
    }
  }

  // v4 granular unshielded address
  if (typeof walletApi.getUnshieldedAddress === "function") {
    try {
      const unshielded = await walletApi.getUnshieldedAddress();
      if (typeof unshielded === "string") {
        unshieldedAddress = unshielded;
      } else if (unshielded && typeof unshielded === "object") {
        unshieldedAddress = unshielded.unshieldedAddress;
      }
      if (!address && unshieldedAddress) {
        address = unshieldedAddress;
      }
    } catch {
      // Optional
    }
  }

  // v4 configuration
  if (typeof walletApi.getConfiguration === "function") {
    try {
      config = await walletApi.getConfiguration();
    } catch {
      // Optional
    }
  }

  // v1–v3 legacy state() fallback
  if (!address && typeof walletApi.state === "function") {
    try {
      const state = await walletApi.state();
      address = state.address;
      coinPublicKey = state.coinPublicKey;
    } catch {
      // Optional
    }
  }

  // v1–v3 legacy serviceUriConfig() fallback
  if (!config && typeof provider.serviceUriConfig === "function") {
    try {
      config = await provider.serviceUriConfig();
    } catch {
      // Optional
    }
  }

  return { address, unshieldedAddress, coinPublicKey, config };
}

export async function connectMidnightLace(): Promise<LaceConnectionResult> {
  const wallets = discoverMidnightWallets();

  if (wallets.length === 0) {
    if (isCardanoLaceInstalled()) {
      return {
        connected: false,
        installed: true,
        cardanoOnlyDetected: true,
        error:
          "Lace extension detected (Cardano mode), but no Midnight wallet is active on this tab. Open Lace → switch or add a Midnight wallet, then reload this tab (F5).",
      };
    }

    return {
      connected: false,
      installed: false,
      error:
        "Midnight Lace provider not detected on this tab. If you just installed Lace, press F5 to reload (or open http://localhost:4195/app). Continuing in 1:1 Browser Sandbox.",
    };
  }

  const chosen = wallets[0];
  const provider = chosen.provider;

  try {
    let connectedApi: MidnightConnectedApi | undefined;
    let resolvedNetworkId: string | undefined;

    if (typeof provider.connect === "function") {
      // Modern @midnight-ntwrk/dapp-connector-api v4.0.0+ flow
      let lastError: unknown;
      for (const netId of PREFERRED_NETWORKS) {
        try {
          connectedApi = await provider.connect(netId);
          resolvedNetworkId = netId;
          break;
        } catch (err) {
          lastError = err;
          if (isUserRejection(err)) {
            throw err;
          }
          // Otherwise try next Midnight network identifier (e.g. preview / mainnet)
        }
      }
      if (!connectedApi) {
        throw lastError ?? new Error("Unable to connect to Midnight Lace wallet.");
      }
    } else if (typeof provider.enable === "function") {
      // Legacy v1–v3 flow
      connectedApi = await provider.enable();
      resolvedNetworkId = "testnet";
    } else {
      throw new Error("Injected Midnight provider exposes neither connect() nor enable().");
    }

    const details = await extractConnectedDetails(connectedApi, provider);

    return {
      connected: true,
      installed: true,
      walletName: chosen.name,
      networkId: details.config?.networkId ?? resolvedNetworkId,
      address: details.address ?? details.unshieldedAddress ?? `${chosen.name} Connected`,
      unshieldedAddress: details.unshieldedAddress,
      coinPublicKey: details.coinPublicKey,
      apiVersion: provider.apiVersion ?? (typeof provider.connect === "function" ? "4.x" : "1.x"),
      proverServerUri: details.config?.proverServerUri,
      indexerUri: details.config?.indexerUri,
    };
  } catch (err) {
    return {
      connected: false,
      installed: true,
      walletName: chosen.name,
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
