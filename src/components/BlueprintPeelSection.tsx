"use client";

import { useRef, useState } from "react";
import { CheckCircle2, EyeOff, Layers, Lock, MoveHorizontal } from "lucide-react";

// Inspired by Scrolltide #c-blueprint ("Blueprint" peelable floor-plan sheet) + "Skein" fibre strands:
// Top layer: Crisp warm architectural floor-plan & rental pre-qualification sheet ("Trace Paper").
// Underneath: Deep Prussian-blueprint Midnight Dual-Ledger cryptographic circuit diagram with
// animated optical strands flowing from private local witnesses into one public binary verdict.

export function BlueprintPeelSection() {
  const [peel, setPeel] = useState(38); // 0 = full trace paper, 100 = full ZK blueprint
  const boxRef = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);

  const updatePeel = (clientX: number) => {
    const el = boxRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    // Dragging right-to-left peels open more blueprint from the right edge
    const pctFromRight = ((rect.right - clientX) / rect.width) * 100;
    setPeel(Math.max(0, Math.min(100, pctFromRight)));
  };

  return (
    <div style={{ display: "grid", gap: 28 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <div style={{ maxWidth: 640 }}>
          <h2 className="display-section" style={{ marginBottom: 10 }}>
            Peel back the lease sheet to see what never leaves your device.
          </h2>
          <p className="lead-copy">
            Brokers see a clean viewing pass for one specific apartment. Midnight keeps your exact
            salary, savings, and identity sealed inside local witnesses.
          </p>
        </div>

        <div className="segmented-track" role="group" aria-label="Blueprint peel presets">
          <button
            type="button"
            className={`segmented-btn ${peel <= 10 ? "is-active" : ""}`}
            onClick={() => setPeel(0)}
          >
            Trace sheet
          </button>
          <button
            type="button"
            className={`segmented-btn ${peel > 10 && peel < 90 ? "is-active" : ""}`}
            onClick={() => setPeel(50)}
          >
            Split peel
          </button>
          <button
            type="button"
            className={`segmented-btn ${peel >= 90 ? "is-active" : ""}`}
            onClick={() => setPeel(100)}
          >
            <Layers size={14} /> ZK Blueprint
          </button>
        </div>
      </div>

      {/* Interactive Peelable Architectural Sheet */}
      <div
        ref={boxRef}
        onPointerDown={(e) => {
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          updatePeel(e.clientX);
        }}
        onPointerMove={(e) => {
          if (dragging.current) updatePeel(e.clientX);
        }}
        onPointerUp={() => {
          dragging.current = false;
        }}
        onPointerCancel={() => {
          dragging.current = false;
        }}
        role="slider"
        tabIndex={0}
        aria-label="Peel tracing paper to reveal Midnight ZK Blueprint underneath"
        aria-valuemin={4}
        aria-valuemax={96}
        aria-valuenow={Math.round(peel)}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") setPeel((v) => Math.min(96, v + 8));
          if (e.key === "ArrowRight") setPeel((v) => Math.max(4, v - 8));
        }}
        style={{
          position: "relative",
          borderRadius: 20,
          overflow: "hidden",
          minHeight: 440,
          border: "1px solid var(--rule-strong)",
          boxShadow: "var(--shadow-lifted)",
          cursor: "ew-resize",
          userSelect: "none",
          touchAction: "pan-y",
        }}
      >
        {/* UNDERNEATH LAYER — Deep Architectural Blueprint (Midnight Dual-Ledger Circuit + Optical Strands) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#0d1b2a",
            backgroundImage:
              "linear-gradient(rgba(125, 211, 252, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(125, 211, 252, 0.08) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            color: "#e2f1ff",
            padding: "30px 32px",
            display: "grid",
            gridTemplateRows: "auto 1fr auto",
            gap: 20,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <span className="mono" style={{ fontSize: 12.5, color: "#7dd3fc" }}>
              BLUEPRINT · MIDNIGHT DUAL-LEDGER PROOF CIRCUIT
            </span>
            <span className="mono" style={{ fontSize: 12, color: "#5eead4" }}>
              contracts/leaseproof.compact · witnesses.ts
            </span>
          </div>

          {/* Skein-inspired Optical Fibre Data Flow Diagram */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) minmax(0, 0.8fr) minmax(0, 1fr)",
              gap: 18,
              alignItems: "center",
            }}
            className="bp-flow-grid"
          >
            {/* Private Witnesses (Sealed Local) */}
            <div
              style={{
                border: "1px solid rgba(125, 211, 252, 0.28)",
                borderRadius: 12,
                padding: 18,
                background: "rgba(10, 22, 36, 0.72)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 700, color: "#7dd3fc", marginBottom: 12 }}>
                <EyeOff size={14} /> Local Private Witnesses
              </div>
              <div className="mono" style={{ display: "grid", gap: 8, fontSize: 12, color: "#cbd5e1" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>monthlyIncomeUsd</span>
                  <span style={{ color: "#f8fafc" }}>$9,500 (sealed)</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>liquidBalanceUsd</span>
                  <span style={{ color: "#f8fafc" }}>$18,000 (sealed)</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>applicantIdCommit</span>
                  <span style={{ color: "#f8fafc" }}>0x5b59... (sealed)</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>tenantSecret</span>
                  <span style={{ color: "#f8fafc" }}>local-only</span>
                </div>
              </div>
            </div>

            {/* Twisted Optical Fibre Strands SVG (Skein nod) */}
            <div style={{ display: "grid", placeItems: "center", textAlign: "center" }}>
              <svg viewBox="0 0 220 110" width="100%" height="96" aria-hidden="true">
                <defs>
                  <linearGradient id="fibreGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
                    <stop offset="50%" stopColor="#5eead4" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.4" />
                  </linearGradient>
                </defs>
                {[18, 34, 55, 76, 92].map((y, idx) => (
                  <path
                    key={y}
                    d={`M 6 ${y} C 74 ${y}, 86 55, 110 55 C 134 55, 146 ${110 - y}, 214 ${110 - y}`}
                    fill="none"
                    stroke="url(#fibreGrad)"
                    strokeWidth={idx === 2 ? 2.2 : 1.2}
                    strokeDasharray={idx % 2 === 0 ? "6 4" : "none"}
                    className="fibre-strand"
                  />
                ))}
                <circle cx="110" cy="55" r="22" fill="#0d1b2a" stroke="#5eead4" strokeWidth="1.5" />
                <text
                  x="110"
                  y="59"
                  textAnchor="middle"
                  fill="#5eead4"
                  fontSize="11"
                  fontFamily="var(--font-mono)"
                  fontWeight="700"
                >
                  ZK
                </text>
              </svg>
              <span className="mono" style={{ fontSize: 11, color: "#93c5fd" }}>
                In-circuit threshold &amp; anchor check
              </span>
            </div>

            {/* Public Midnight Ledger Output */}
            <div
              style={{
                border: "1px solid rgba(94, 234, 212, 0.36)",
                borderRadius: 12,
                padding: 18,
                background: "rgba(12, 34, 42, 0.78)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 700, color: "#5eead4", marginBottom: 12 }}>
                <CheckCircle2 size={14} /> Public Midnight Ledger
              </div>
              <div className="mono" style={{ display: "grid", gap: 8, fontSize: 12, color: "#cbd5e1" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>verdict</span>
                  <span style={{ color: "#5eead4", fontWeight: 700 }}>QUALIFIED (1)</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>listingBound</span>
                  <span style={{ color: "#f8fafc" }}>apt-soho-204</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>currency</span>
                  <span style={{ color: "#f8fafc" }}>840 (USD)</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>rawValuesLeaked</span>
                  <span style={{ color: "#5eead4" }}>0 bytes</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mono" style={{ fontSize: 12, color: "#93c5fd", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <span>Issuer anchor verified via anchorAttestation()</span>
            <span>Windowed nullifier blocks replay · 1-click revokeReceipt()</span>
          </div>
        </div>

        {/* TOP LAYER — Crisp Architectural Stone-Paper Floor-Plan Dossier (Peels away from the right!) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#fcfcf9",
            color: "var(--ink)",
            padding: "30px 32px",
            clipPath: `inset(0 ${peel}% 0 0)`,
            display: "grid",
            gridTemplateRows: "auto 1fr auto",
            gap: 20,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--rule)", paddingBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <strong style={{ fontFamily: "var(--font-display)", fontSize: 16 }}>
                SoHo Lofts, Unit 4B
              </strong>
              <span style={{ color: "var(--ink-muted)", fontSize: 13.5 }}>
                Architectural Viewing Sheet
              </span>
            </div>
            <span className="status-tag status-teal">Pre-qualified for viewing</span>
          </div>

          <div className="grid-2" style={{ gap: 28, alignItems: "center" }}>
            {/* Clean SVG Architectural Floor Plan Drawing (Blueprint #c-blueprint homage) */}
            <div
              style={{
                border: "1px solid var(--rule)",
                borderRadius: 12,
                padding: 18,
                background: "#f7f6f1",
              }}
            >
              <svg viewBox="0 0 360 210" width="100%" height="190" aria-label="Unit 4B architectural floor plan">
                {/* Exterior Structural Walls */}
                <rect x="20" y="18" width="320" height="174" fill="#ffffff" stroke="#111111" strokeWidth="2.2" />
                {/* Interior Partition Walls */}
                <line x1="196" y1="18" x2="196" y2="128" stroke="#111111" strokeWidth="1.6" />
                <line x1="196" y1="128" x2="340" y2="128" stroke="#111111" strokeWidth="1.6" />
                <line x1="20" y1="128" x2="112" y2="128" stroke="#111111" strokeWidth="1.6" />
                {/* Architectural Door Swing Arcs */}
                <path d="M 140 192 A 28 28 0 0 1 168 164" fill="none" stroke="#0f766e" strokeWidth="1.2" strokeDasharray="3 3" />
                <line x1="140" y1="192" x2="140" y2="164" stroke="#0f766e" strokeWidth="1.4" />
                <path d="M 196 92 A 24 24 0 0 1 220 116" fill="none" stroke="#0f766e" strokeWidth="1.2" strokeDasharray="3 3" />
                {/* Room Labels & Dimensions */}
                <text x="108" y="76" textAnchor="middle" fill="#111111" fontSize="11" fontFamily="var(--font-display)" fontWeight="700">
                  LIVING &amp; STUDIO
                </text>
                <text x="108" y="92" textAnchor="middle" fill="#6c6c73" fontSize="9.5" fontFamily="var(--font-mono)">
                  28.4 m²
                </text>
                <text x="268" y="74" textAnchor="middle" fill="#111111" fontSize="11" fontFamily="var(--font-display)" fontWeight="700">
                  BEDROOM 01
                </text>
                <text x="268" y="90" textAnchor="middle" fill="#6c6c73" fontSize="9.5" fontFamily="var(--font-mono)">
                  16.2 m²
                </text>
                <text x="66" y="162" textAnchor="middle" fill="#52525b" fontSize="9.5" fontFamily="var(--font-mono)">
                  KITCHEN
                </text>
                <text x="268" y="164" textAnchor="middle" fill="#52525b" fontSize="9.5" fontFamily="var(--font-mono)">
                  BATH &amp; ENTRY
                </text>
                {/* Dimension Hairline */}
                <line x1="20" y1="9" x2="340" y2="9" stroke="#a1a1aa" strokeWidth="0.9" />
                <text x="180" y="7" textAnchor="middle" fill="#6c6c73" fontSize="8.5" fontFamily="var(--font-mono)">
                  11.40 m
                </text>
              </svg>
            </div>

            {/* Clean Broker-Visible Facts (Zero Raw Tenant Financials!) */}
            <div>
              <div className="ledger-row">
                <span style={{ fontSize: 13.5, color: "var(--ink-muted)" }}>Monthly rent bar</span>
                <strong className="tabular" style={{ fontSize: 15 }}>$2,400 / mo (3x cleared)</strong>
              </div>
              <div className="ledger-row">
                <span style={{ fontSize: 13.5, color: "var(--ink-muted)" }}>Deposit reserve</span>
                <strong className="tabular" style={{ fontSize: 15 }}>$4,800 (2x cleared)</strong>
              </div>
              <div className="ledger-row">
                <span style={{ fontSize: 13.5, color: "var(--ink-muted)" }}>Bank statements uploaded</span>
                <strong style={{ color: "var(--teal)", fontSize: 15 }}>Zero PDFs stored</strong>
              </div>
              <div className="ledger-row">
                <span style={{ fontSize: 13.5, color: "var(--ink-muted)" }}>Forwarding protection</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 14, fontWeight: 600 }}>
                  <Lock size={13} color="var(--teal)" /> Locked to Unit 4B
                </span>
              </div>
            </div>
          </div>

          <div style={{ fontSize: 13, color: "var(--ink-muted)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <span>What the broker sees on paper</span>
            <span style={{ fontWeight: 600, color: "var(--ink)" }}>Drag handle left to peel into Midnight ZK Blueprint</span>
          </div>
        </div>

        {/* Tactile Peel Crease Line + Knob (hides cleanly at full 0% or 100% view) */}
        {peel > 1 && peel < 99 && (
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              right: `${peel}%`,
              width: 2,
              background: "linear-gradient(180deg, #5eead4, #0f766e, #111111)",
              boxShadow: "-10px 0 28px rgba(13, 27, 42, 0.32)",
              pointerEvents: "none",
              zIndex: 15,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 42,
                height: 42,
                borderRadius: "50%",
                background: "#0d1b2a",
                color: "#5eead4",
                border: "2px solid #5eead4",
                display: "grid",
                placeItems: "center",
                boxShadow: "0 8px 24px rgba(0,0,0,0.38)",
              }}
            >
              <MoveHorizontal size={17} />
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fibrePulse {
          from {
            stroke-dashoffset: 40;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        .fibre-strand {
          animation: fibrePulse 2.4s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .fibre-strand {
            animation: none;
          }
        }
        @media (max-width: 820px) {
          .bp-flow-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
