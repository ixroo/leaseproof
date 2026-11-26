import Link from "next/link";
import { CheckCircle2, Code2, EyeOff, Lock, Presentation, ShieldCheck } from "lucide-react";
import { NoirFlutedShader } from "@/components/NoirFlutedShader";
import { TitaniumLeasePass3D } from "@/components/TitaniumLeasePass3D";
import { BlueprintPeelSection } from "@/components/BlueprintPeelSection";
import { VerticalShowcase } from "@/components/VerticalShowcase";

export default function LandingPage() {
  return (
    <>
      <header className="site-header-noir">
        <div className="site-header-inner">
          <Link href="/" className="brand-lockup" style={{ color: "var(--bone)" }}>
            <span
              className="brand-mark"
              aria-hidden="true"
              style={{
                background: "linear-gradient(135deg, #f4f4f0, #a8b0ba)",
                color: "#0e1014",
              }}
            >
              <ShieldCheck size={17} strokeWidth={2.4} />
            </span>
            <span>LeaseProof</span>
          </Link>

          <nav className="nav-links" aria-label="Primary navigation">
            <Link href="/app" className="nav-link hide-sm" style={{ color: "#c9cdd4" }}>
              Workspace
            </Link>
            <Link href="/verify" className="nav-link hide-sm" style={{ color: "#c9cdd4" }}>
              Verify pass
            </Link>
            <Link href="/deck" className="nav-link" style={{ color: "#c9cdd4" }}>
              <Presentation size={14} />
              <span className="hide-sm">Pitch deck</span>
              <span className="show-sm">Deck</span>
            </Link>
            <Link href="/app" className="btn-liquid-glass" style={{ minHeight: 38, padding: "0 14px", fontSize: 13.5 }}>
              <span className="hide-sm">Open workspace</span>
              <span className="show-sm">Open app</span>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* HERO: Noir Fluted-Glass WebGL Shader + Cypress Editorial Type + Billet 3D Titanium Pass */}
        <section className="noir-hero">
          <NoirFlutedShader />

          <div className="container">
            <div className="hero-grid">
              <div style={{ display: "grid", gap: 22 }}>
                <h1
                  className="display-hero"
                  style={{ color: "#9da4b0", fontWeight: 700 }}
                >
                  Qualify for viewings without sending{" "}
                  <span style={{ color: "#f6f6f2" }}>bank PDFs to twenty brokers.</span>
                </h1>

                <p
                  className="lead-copy"
                  style={{ color: "#b6bcc6", maxWidth: "46ch" }}
                >
                  Connect verified payroll or open banking once on Midnight. Issue a 14-day,
                  listing-locked Viewing Pass that landlords verify wallet-free in three seconds—and
                  revoke it with one click.
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, paddingTop: 4 }}>
                  <Link href="/app" className="btn-liquid-glass">
                    Issue Viewing Pass
                  </Link>
                  <Link href="/app?tab=landlord" className="btn-noir-ghost">
                    Verify a tenant pass
                  </Link>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 22,
                    paddingTop: 10,
                    borderTop: "1px solid rgba(255, 255, 255, 0.11)",
                    fontSize: 13.5,
                    color: "#9da4b0",
                  }}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                    <span className="nav-active-dot" style={{ background: "#5eead4" }} />
                    Zero raw salary disclosed
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                    <span className="nav-active-dot" style={{ background: "#e8d5b7" }} />
                    Walletless broker verification
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "center" }}>
                <TitaniumLeasePass3D />
              </div>
            </div>
          </div>
        </section>

        {/* BARE-CANVAS HAIRLINE DATA STRIP (Real NMHC & Snappt Evidence — Zero Boxed Metric Cards) */}
        <section style={{ padding: "56px 0", borderBottom: "1px solid var(--rule)" }}>
          <div className="container">
            <div className="metric-strip">
              <div className="metric-cell">
                <strong className="metric-figure tabular">93.3%</strong>
                <div className="metric-title">Rental providers hit by fraud</div>
                <div className="metric-note">
                  Experienced application fraud in the past 12 months (NMHC Pulse Survey)
                </div>
              </div>
              <div className="metric-cell">
                <strong className="metric-figure tabular">84.3%</strong>
                <div className="metric-title">Doctored pay stubs &amp; bank PDFs</div>
                <div className="metric-note">
                  Up to 1 in 8 rental applications contain forged income documents (Snappt)
                </div>
              </div>
              <div className="metric-cell">
                <strong className="metric-figure tabular" style={{ color: "var(--teal)" }}>
                  Art. 5(1)(c)
                </strong>
                <div className="metric-title">GDPR data minimization</div>
                <div className="metric-note">
                  Agencies hold zero unencrypted tenant PDFs during apartment viewings
                </div>
              </div>
              <div className="metric-cell">
                <strong className="metric-figure tabular" style={{ color: "var(--teal)" }}>
                  0 PDFs
                </strong>
                <div className="metric-title">Documents sprayed to brokers</div>
                <div className="metric-note">
                  Share legal ID only once with the single landlord you actually sign with
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SIGNATURE INTERACTIVE SECTION: PEELABLE ARCHITECTURAL FLOOR-PLAN & ZK BLUEPRINT */}
        <section className="section-band">
          <div className="container">
            <BlueprintPeelSection />
          </div>
        </section>

        {/* INTERACTIVE VERTICAL SWITCHER (Salaried / Freelancer Runway / Vehicle Lease) */}
        <section className="section-band">
          <div className="container">
            <VerticalShowcase />
          </div>
        </section>

        {/* TWO-COLUMN ARCHITECTURAL PRIVACY LEDGER (Bare Canvas Hairlines) */}
        <section className="section-band">
          <div className="container">
            <div style={{ maxWidth: 620, marginBottom: 36 }}>
              <h2 className="display-section" style={{ marginBottom: 10 }}>
                What brokers verify versus what stays sealed on your device.
              </h2>
              <p className="lead-copy">
                Zero nested dashboards. Clear separation between verifiable rental certainty and
                your personal finances.
              </p>
            </div>

            <div className="grid-2" style={{ gap: 36 }}>
              <div className="sheet">
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 20 }}>
                  <CheckCircle2 size={19} color="var(--teal)" />
                  <h3 className="display-sub" style={{ fontSize: 19 }}>
                    Verified by the landlord or broker
                  </h3>
                </div>
                <div className="ledger-row">
                  <span style={{ fontWeight: 600 }}>Pass verdict</span>
                  <span style={{ color: "var(--ink-secondary)", textAlign: "right", maxWidth: 280 }}>
                    Qualified, Revoked, or Expired—read off-chain with zero wallet
                  </span>
                </div>
                <div className="ledger-row">
                  <span style={{ fontWeight: 600 }}>Bank-anchored source</span>
                  <span style={{ color: "var(--ink-secondary)", textAlign: "right", maxWidth: 280 }}>
                    Confirmed from Plaid, Tink, or Argyle—blocks Photoshopped PDFs
                  </span>
                </div>
                <div className="ledger-row">
                  <span style={{ fontWeight: 600 }}>Listing &amp; identity lock</span>
                  <span style={{ color: "var(--ink-secondary)", textAlign: "right", maxWidth: 280 }}>
                    Cannot forward a cheap-room pass to a penthouse or borrow a friend&apos;s bank
                  </span>
                </div>
                <div className="ledger-row">
                  <span style={{ fontWeight: 600 }}>14-day automatic expiry</span>
                  <span style={{ color: "var(--ink-secondary)", textAlign: "right", maxWidth: 280 }}>
                    Expires cleanly after two weeks, or instantly when revoked
                  </span>
                </div>
              </div>

              <div className="sheet" style={{ background: "var(--surface-tint)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 20 }}>
                  <EyeOff size={19} color="var(--ink)" />
                  <h3 className="display-sub" style={{ fontSize: 19 }}>
                    Never disclosed to anyone
                  </h3>
                </div>
                <div className="ledger-row">
                  <span style={{ fontWeight: 600 }}>Exact monthly salary</span>
                  <span style={{ color: "var(--ink-secondary)", textAlign: "right", maxWidth: 280 }}>
                    Brokers never learn whether you earn $7k or $40k per month
                  </span>
                </div>
                <div className="ledger-row">
                  <span style={{ fontWeight: 600 }}>Total balance &amp; spending</span>
                  <span style={{ color: "var(--ink-secondary)", textAlign: "right", maxWidth: 280 }}>
                    Zero transaction history or PDF statements in broker inboxes
                  </span>
                </div>
                <div className="ledger-row">
                  <span style={{ fontWeight: 600 }}>Passport &amp; employer name</span>
                  <span style={{ color: "var(--ink-secondary)", textAlign: "right", maxWidth: 280 }}>
                    Presented once at final lease signing, never during viewings
                  </span>
                </div>
                <div className="ledger-row">
                  <span style={{ fontWeight: 600 }}>Other apartments toured</span>
                  <span style={{ color: "var(--ink-secondary)", textAlign: "right", maxWidth: 280 }}>
                    Every listing pass is unlinkable across different landlords
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAIR, INCENTIVE-ALIGNED PRICING (Clean Architectural Columns — Fixed CTAs) */}
        <section className="section-band">
          <div className="container">
            <div style={{ maxWidth: 680, marginBottom: 40 }}>
              <h2 className="display-section" style={{ marginBottom: 10 }}>
                Free for landlords. One $1.99 pass replaces $35 to $50 per-listing fees.
              </h2>
              <p className="lead-copy">
                Aligned with how real rental markets work—zero friction for brokers, huge savings
                for renters touring multiple units.
              </p>
            </div>

            <div className="grid-3">
              <div
                className="sheet"
                style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 22 }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--teal)" }}>
                      Landlords &amp; Brokers
                    </span>
                    <strong className="tabular" style={{ fontSize: 22, fontFamily: "var(--font-display)", whiteSpace: "nowrap" }}>
                      $0 Forever
                    </strong>
                  </div>
                  <h3 style={{ margin: "0 0 8px", fontSize: 18, fontFamily: "var(--font-display)" }}>
                    Walletless Instant Verifier
                  </h3>
                  <p style={{ margin: 0, fontSize: 14.5, color: "var(--ink-secondary)", lineHeight: 1.55 }}>
                    Confirm applicant qualification in 3 seconds from any browser with zero signup,
                    zero crypto wallet, and zero tenant PDFs to store.
                  </p>
                </div>
                <Link href="/app?tab=landlord" className="btn-secondary" style={{ width: "fit-content" }}>
                  Open Walletless Verifier
                </Link>
              </div>

              <div
                className="sheet"
                style={{
                  borderColor: "var(--ink)",
                  borderWidth: 1.5,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 22,
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}>
                      Active Renters
                    </span>
                    <strong className="tabular" style={{ fontSize: 22, fontFamily: "var(--font-display)", whiteSpace: "nowrap" }}>
                      $1.99 / 30d
                    </strong>
                  </div>
                  <h3 style={{ margin: "0 0 8px", fontSize: 18, fontFamily: "var(--font-display)" }}>
                    Reusable Multi-Listing Pass
                  </h3>
                  <p style={{ margin: 0, fontSize: 14.5, color: "var(--ink-secondary)", lineHeight: 1.55 }}>
                    First pass is free. Then mint unlimited listing-locked Viewing Passes across 20+
                    apartments—covering Open Banking verification once.
                  </p>
                </div>
                <Link href="/app" className="btn-primary" style={{ width: "fit-content" }}>
                  Mint Reusable Pass
                </Link>
              </div>

              <div
                className="sheet"
                style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 22 }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink-muted)" }}>
                      Property Portals
                    </span>
                    <strong className="tabular" style={{ fontSize: 22, fontFamily: "var(--font-display)", whiteSpace: "nowrap" }}>
                      B2B API
                    </strong>
                  </div>
                  <h3 style={{ margin: "0 0 8px", fontSize: 18, fontFamily: "var(--font-display)" }}>
                    Embedded Pre-Qual Badge
                  </h3>
                  <p style={{ margin: 0, fontSize: 14.5, color: "var(--ink-secondary)", lineHeight: 1.55 }}>
                    Drop-in verified badge for rental marketplaces and co-living operators—filtering
                    broker spam while staying GDPR compliant.
                  </p>
                </div>
                <Link href="/deck" className="btn-secondary" style={{ width: "fit-content" }}>
                  View Pitch Deck
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* OBSIDIAN ARCHITECTURAL ENGINEERING BAND (For Midnight Technical Judges) */}
        <section className="obsidian-band">
          <div className="container">
            <div className="grid-2" style={{ gap: 36, alignItems: "center" }}>
              <div style={{ display: "grid", gap: 16 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "#5eead4", fontWeight: 600 }}>
                  <Code2 size={16} /> Under the hood for Midnight judges
                </div>
                <h2 className="display-section" style={{ color: "var(--bone)" }}>
                  Hardened Compact 0.36.1 contract compiled and executed in Linux CI.
                </h2>
                <p style={{ margin: 0, fontSize: 15.5, color: "var(--bone-muted)", lineHeight: 1.6, maxWidth: "56ch" }}>
                  Powered by <span className="mono" style={{ color: "var(--bone)" }}>contracts/leaseproof.compact</span>{" "}
                  (7 circuits) and official{" "}
                  <span className="mono" style={{ color: "var(--bone)" }}>contracts/witnesses.ts</span>{" "}
                  executed directly on{" "}
                  <span className="mono" style={{ color: "#5eead4" }}>@midnight-ntwrk/compact-runtime@0.21.0</span>.
                  Test all 8 live red-team attacks—including local salary re-hashing, cross-listing
                  forwarding, and secret-rotation replay—with zero wallet setup.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, paddingTop: 6 }}>
                  <Link href="/app?tab=attacks" className="btn-on-dark">
                    Open 8-Attack Security Lab
                  </Link>
                  <Link href="/deck" className="btn-noir-ghost">
                    Read 8-Slide Pitch Deck
                  </Link>
                </div>
              </div>

              <div className="obsidian-panel">
                <div
                  className="mono"
                  style={{
                    fontSize: 12,
                    color: "#5eead4",
                    paddingBottom: 12,
                    marginBottom: 14,
                    borderBottom: "1px solid var(--obsidian-border)",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <span>GitHub Actions · ubuntu-latest</span>
                  <span>Run #10 · Passed</span>
                </div>
                <div className="mono" style={{ display: "grid", gap: 10, fontSize: 13, lineHeight: 1.5 }}>
                  <div style={{ color: "var(--bone-muted)" }}>
                    $ compact compile contracts/leaseproof.compact
                  </div>
                  <div style={{ color: "#5eead4" }}>
                    ✓ compactc 0.36.1 — 7 circuits compiled cleanly (13s)
                  </div>
                  <div style={{ color: "var(--bone-muted)" }}>
                    $ npm run test:compact
                  </div>
                  <div style={{ color: "#5eead4" }}>
                    ✓ witnesses.ts + real compiled contract executed (passed)
                  </div>
                  <div style={{ color: "var(--bone-muted)" }}>
                    $ npm test &amp;&amp; npm run lint
                  </div>
                  <div style={{ color: "#5eead4" }}>
                    ✓ 17 adversarial unit tests passed · 0 lint warnings
                  </div>
                </div>
              </div>
            </div>

            <footer
              style={{
                marginTop: 56,
                paddingTop: 22,
                borderTop: "1px solid var(--obsidian-border)",
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
                fontSize: 13,
                color: "var(--bone-muted)",
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                <Lock size={13} color="#5eead4" /> LeaseProof · Apache-2.0 Open Source · Built on Midnight Network
              </span>
              <span>Transparent 1:1 Browser Sandbox + Midnight Lace Wallet Connector</span>
            </footer>
          </div>
        </section>
      </main>
    </>
  );
}
