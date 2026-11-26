"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Clock, EyeOff, Fingerprint, RotateCw, ShieldCheck } from "lucide-react";

// Inspired by Scrolltide /templates/billet ("Weight you can feel"):
// A pointer-reactive 3D brushed titanium & sapphire cryptographic Viewing Pass.
// Moving the pointer rotates the machined metal slab and glides specular light across its bevels.
// Clicking flips the pass 180° in 3D to reveal the etched Midnight Compact circuit proof on the back.

export function TitaniumLeasePass3D() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ rx: 4, ry: -8, gx: 68, gy: 28 });
  const [flipped, setFlipped] = useState(false);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTilt({
      rx: (0.5 - py) * 16,
      ry: (px - 0.5) * 20,
      gx: px * 100,
      gy: py * 100,
    });
  };

  const handlePointerLeave = () => {
    setTilt({ rx: 4, ry: -8, gx: 68, gy: 28 });
  };

  return (
    <div style={{ display: "grid", gap: 14, justifyItems: "center", width: "100%" }}>
      <div
        ref={wrapRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onClick={() => setFlipped((f) => !f)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setFlipped((f) => !f);
          }
        }}
        role="button"
        tabIndex={0}
        aria-pressed={flipped}
        aria-label="Interactive 3D LeaseProof Titanium Pass. Click to flip and inspect cryptographic proof details."
        style={{
          perspective: "1400px",
          width: "100%",
          maxWidth: 520,
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            minHeight: 326,
            transformStyle: "preserve-3d",
            transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry + (flipped ? 180 : 0)}deg)`,
            transition: "transform 420ms cubic-bezier(0.23, 1, 0.32, 1)",
          }}
        >
          {/* FRONT FACE — Machined Brushed Titanium Viewing Pass */}
          <div
            className="titanium-card-face"
            style={{
              position: "absolute",
              inset: 0,
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(0deg) translateZ(1px)",
              zIndex: flipped ? 1 : 2,
              opacity: flipped ? 0 : 1,
              borderRadius: 22,
              padding: "26px 28px",
              overflow: "hidden",
              background:
                "linear-gradient(145deg, #23262c 0%, #14161a 48%, #0d0f12 100%)",
              border: "1px solid rgba(255, 255, 255, 0.18)",
              boxShadow:
                "0 34px 80px -18px rgba(0, 0, 0, 0.78), inset 0 1px 0 rgba(255, 255, 255, 0.24), inset 0 -1px 0 rgba(0, 0, 0, 0.6)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transition: "opacity 220ms ease",
            }}
          >
            {/* Dynamic Pointer-Tracked Specular Metallic Sheen */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background: `radial-gradient(circle 340px at ${tilt.gx}% ${tilt.gy}%, rgba(255,255,255,0.16) 0%, rgba(45, 212, 191, 0.08) 32%, transparent 70%)`,
              }}
            />

            {/* Brushed horizontal titanium grain lines */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                opacity: 0.14,
                backgroundImage:
                  "repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 3px)",
              }}
            />

            {/* Top Machined Header */}
            <div
              style={{
                position: "relative",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    background: "linear-gradient(135deg, #f2eee9, #a8b0ba)",
                    color: "#0e1014",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <ShieldCheck size={17} strokeWidth={2.4} />
                </span>
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: 15,
                      letterSpacing: "-0.02em",
                      color: "#f4f4f0",
                    }}
                  >
                    LeaseProof Pass
                  </div>
                  <div className="mono" style={{ fontSize: 11, color: "#9da4b0" }}>
                    MIDNIGHT COMPACT 0.36.1
                  </div>
                </div>
              </div>

              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 11px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#5eead4",
                  background: "rgba(20, 184, 166, 0.14)",
                  border: "1px solid rgba(94, 234, 212, 0.34)",
                }}
              >
                <CheckCircle2 size={13} /> Qualified
              </span>
            </div>

            {/* Center Machined Unit Title */}
            <div style={{ position: "relative", margin: "20px 0 18px" }}>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 25,
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  color: "#ffffff",
                  marginBottom: 4,
                }}
              >
                SoHo Lofts, Unit 4B
              </div>
              <div style={{ fontSize: 13.5, color: "#a1a8b3" }}>
                $2,400/mo threshold verified via Argyle Payroll
              </div>
            </div>

            {/* Bottom Machined Spec Strip */}
            <div
              style={{
                position: "relative",
                borderTop: "1px solid rgba(255, 255, 255, 0.11)",
                paddingTop: 14,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                fontSize: 12.5,
              }}
            >
              <div>
                <div style={{ color: "#8c939e", marginBottom: 3, display: "flex", alignItems: "center", gap: 5 }}>
                  <EyeOff size={12} color="#5eead4" /> Raw salary &amp; PDFs
                </div>
                <strong style={{ color: "#f4f4f0" }}>Hidden locally</strong>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    color: "#8c939e",
                    marginBottom: 3,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <Clock size={12} color="#d6b485" /> Listing lock
                </div>
                <div style={{ fontWeight: 600, color: "#e8d5b7" }}>14 days, revocable</div>
              </div>
            </div>
          </div>

          {/* BACK FACE — Etched Cryptographic Proof Specification */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg) translateZ(1px)",
              zIndex: flipped ? 2 : 1,
              opacity: flipped ? 1 : 0,
              borderRadius: 22,
              padding: "26px 28px",
              overflow: "hidden",
              background:
                "linear-gradient(145deg, #101419 0%, #0b0e12 100%)",
              border: "1px solid rgba(94, 234, 212, 0.28)",
              boxShadow:
                "0 34px 80px -18px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(94, 234, 212, 0.2)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transition: "opacity 220ms ease",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="mono" style={{ fontSize: 12, color: "#5eead4" }}>
                contracts/leaseproof.compact
              </span>
              <span className="mono" style={{ fontSize: 11.5, color: "#9da4b0" }}>
                7 circuits compiled
              </span>
            </div>

            <div style={{ display: "grid", gap: 11, fontSize: 12.5, margin: "14px 0" }}>
              <div>
                <div style={{ color: "#8c939e", fontSize: 11, marginBottom: 2 }}>
                  Listing-bound Receipt ID
                </div>
                <div className="mono" style={{ color: "#f4f4f0", wordBreak: "break-all" }}>
                  0x2ed2e5bb91a4f7c8d30e4b1a6c9f28a1
                </div>
              </div>
              <div>
                <div style={{ color: "#8c939e", fontSize: 11, marginBottom: 2, display: "flex", alignItems: "center", gap: 5 }}>
                  <Fingerprint size={12} color="#5eead4" /> Anti-straw-applicant KYC Commit
                </div>
                <div className="mono" style={{ color: "#cbd5e1" }}>
                  0x5b5936ac9783f2108b9e14a0c6d2
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                <span style={{ color: "#8c939e" }}>Attestation Anchor</span>
                <span className="mono" style={{ color: "#5eead4" }}>Issuer-signed on-ledger</span>
              </div>
            </div>

            <div style={{ fontSize: 12, color: "#9da4b0", display: "flex", justifyContent: "space-between" }}>
              <span>Click card to return to front</span>
              <span className="mono" style={{ color: "#e8d5b7" }}>ISO-4217 · 840 USD</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tactile hint bar below the floating titanium card */}
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          background: "rgba(255, 255, 255, 0.06)",
          border: "1px solid rgba(255, 255, 255, 0.14)",
          color: "#d4d8df",
          borderRadius: 999,
          padding: "7px 14px",
          fontSize: 12.5,
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        <RotateCw size={13} />
        {flipped ? "Show machined front pass" : "Move cursor to tilt · Click pass to inspect ZK back"}
      </button>
    </div>
  );
}
