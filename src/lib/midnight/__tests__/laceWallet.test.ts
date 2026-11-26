import { afterEach, describe, expect, it, vi } from "vitest";
import {
  connectMidnightLace,
  discoverMidnightWallets,
  shortMidnightAddr,
} from "../laceWallet";

const originalWindow = globalThis.window;

function setMockWindow(mock: Record<string, unknown>) {
  Object.defineProperty(globalThis, "window", {
    value: mock,
    configurable: true,
    writable: true,
  });
}

afterEach(() => {
  Object.defineProperty(globalThis, "window", {
    value: originalWindow,
    configurable: true,
    writable: true,
  });
});

describe("Midnight Lace Wallet Connector (v4 Dynamic UUID + v3 Legacy)", () => {
  it("discovers and connects to a modern v4 Lace provider injected under a dynamic UUID key", async () => {
    const connectMock = vi.fn(async (networkId: string) => {
      expect(networkId).toBe("preprod");
      return {
        getShieldedAddresses: async () => ({
          shieldedAddress: "mn_shield-addr_preprod1q9x0example7890abcdef",
          shieldedCoinPublicKey: "mn_shield-cpk_preprod1example",
          shieldedEncryptionPublicKey: "mn_shield-epk_preprod1example",
        }),
        getUnshieldedAddress: async () => ({
          unshieldedAddress: "mn_addr_preprod1unshielded999",
        }),
        getConfiguration: async () => ({
          networkId: "preprod",
          proverServerUri: "http://127.0.0.1:6300",
          indexerUri: "https://indexer.preprod.midnight.network",
        }),
      };
    });

    setMockWindow({
      midnight: {
        "8a4f21c0-6e92-4a2b-9a10-55d8f0c7a111": {
          rdns: "io.lace.midnight",
          name: "Lace",
          apiVersion: "4.0.0",
          connect: connectMock,
        },
      },
    });

    const wallets = discoverMidnightWallets();
    expect(wallets).toHaveLength(1);
    expect(wallets[0].name).toBe("Lace");

    const res = await connectMidnightLace();
    expect(res.connected).toBe(true);
    expect(res.installed).toBe(true);
    expect(res.networkId).toBe("preprod");
    expect(res.address).toBe("mn_shield-addr_preprod1q9x0example7890abcdef");
    expect(res.proverServerUri).toBe("http://127.0.0.1:6300");
    expect(shortMidnightAddr(res.address!)).toBe("mn_shield-...abcdef");
  });

  it("supports legacy v3 window.midnight.mnLace.enable() seamlessly", async () => {
    setMockWindow({
      midnight: {
        mnLace: {
          name: "Lace Midnight Preview",
          apiVersion: "1.2.5",
          enable: async () => ({
            state: async () => ({
              address: "mn_shield-addr_test1legacyaddress999",
              coinPublicKey: "cpk_legacy",
              encryptionPublicKey: "epk_legacy",
            }),
          }),
          serviceUriConfig: async () => ({
            proverServerUri: "http://localhost:6300",
            indexerUri: "https://indexer.testnet.midnight.network",
          }),
        },
      },
    });

    const res = await connectMidnightLace();
    expect(res.connected).toBe(true);
    expect(res.address).toBe("mn_shield-addr_test1legacyaddress999");
    expect(res.apiVersion).toBe("1.2.5");
  });

  it("reports an accurate Cardano-mode diagnostic when window.cardano.lace exists without window.midnight", async () => {
    setMockWindow({
      cardano: {
        lace: {
          name: "Lace",
          apiVersion: "0.1.0",
        },
      },
    });

    const res = await connectMidnightLace();
    expect(res.connected).toBe(false);
    expect(res.installed).toBe(true);
    expect(res.cardanoOnlyDetected).toBe(true);
    expect(res.error).toContain("Cardano mode");
  });

  it("falls back cleanly to Walletless Sandbox when no wallet is injected", async () => {
    setMockWindow({});
    const res = await connectMidnightLace();
    expect(res.connected).toBe(false);
    expect(res.installed).toBe(false);
    expect(res.error).toContain("F5");
  });
});
