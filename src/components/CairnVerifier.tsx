"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

// Inspired by Scrolltide #c-cairn ("Cairn" dot-matrix verification loader):
// Compact dot-ring + ticking verification readout that settles to a crisp teal seal.

export function CairnVerifier({
  triggerKey,
  statusLabel,
  isQualified,
}: {
  triggerKey: string;
  statusLabel: string;
  isQualified: boolean;
}) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      queueMicrotask(() => setProgress(100));
      return;
    }
    queueMicrotask(() => setProgress(12));
    const t1 = setTimeout(() => setProgress(54), 90);
    const t2 = setTimeout(() => setProgress(86), 190);
    const t3 = setTimeout(() => setProgress(100), 300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [triggerKey]);

  const dots = 12;
  const activeCount = Math.round((progress / 100) * dots);

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "6px 12px 6px 8px",
        borderRadius: 999,
        background: isQualified ? "var(--teal-soft)" : "var(--vermilion-soft)",
        border: `1px solid ${isQualified ? "var(--teal-border)" : "var(--vermilion-border)"}`,
      }}
    >
      <div style={{ position: "relative", width: 24, height: 24, display: "grid", placeItems: "center" }}>
        {progress < 100 ? (
          <svg viewBox="0 0 28 28" width="24" height="24" aria-hidden="true">
            {Array.from({ length: dots }).map((_, i) => {
              const angle = (i / dots) * Math.PI * 2 - Math.PI / 2;
              const cx = 14 + Math.cos(angle) * 9.5;
              const cy = 14 + Math.sin(angle) * 9.5;
              const lit = i < activeCount;
              return (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={lit ? 1.8 : 1.3}
                  fill={lit ? "var(--teal)" : "rgba(17,17,17,0.18)"}
                />
              );
            })}
          </svg>
        ) : (
          <CheckCircle2 size={16} color={isQualified ? "var(--teal)" : "var(--vermilion)"} />
        )}
      </div>
      <span
        className="mono tabular"
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: isQualified ? "var(--teal)" : "var(--vermilion)",
        }}
      >
        {progress < 100 ? `Proving ${progress}%` : statusLabel}
      </span>
    </div>
  );
}
