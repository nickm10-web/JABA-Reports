"use client";

import React, { useRef, useEffect, useCallback } from "react";

// ---------------------------------------------------------------------------
// Color map
// ---------------------------------------------------------------------------
const glowColorMap: Record<string, { base: number; spread: number }> = {
  blue:   { base: 210, spread: 40 },
  purple: { base: 270, spread: 40 },
  green:  { base: 145, spread: 40 },
  red:    { base:   0, spread: 40 },
  orange: { base:  30, spread: 40 },
  pink:   { base: 320, spread: 40 },
  cyan:   { base: 190, spread: 40 },
  gold:   { base:  42, spread: 20 },  // narrow spread = stays metallic
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
export interface GlowCardProps {
  glowColor?: keyof typeof glowColorMap;
  customSize?: boolean;
  className?: string;
  /** HSL saturation — default 70 (lower = more metallic, less neon) */
  saturation?: number;
  /** HSL lightness  — default 55 (lower = deeper, richer tone) */
  lightness?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Scoped pseudo-element CSS
//
// Fix 1: NO background fill on the card element itself — only the 1px border
//         ring glows. The ::before fill is removed; only ::after (border ring)
//         is kept, masked to the padding strip.
// Fix 2: opacity is driven by --proximity (0 → 1) so the border activates as
//         the cursor approaches the card, not only when hovering.
// Correct calc() forms (no missing * operator):
//   circle calc(var(--spotlight-size) * 1px) at calc(var(--x) * 1px) ...
// ---------------------------------------------------------------------------
function buildPseudoCSS(sc: string): string {
  return `
    /* Border ring — follows cursor, masked to 1px edge, scales with proximity */
    .${sc}::before,
    .${sc}::after {
      content: "";
      position: absolute;
      inset: 0;
      padding: 1px;
      border-radius: calc(var(--radius) * 1px);
      background: radial-gradient(
        circle calc(var(--spotlight-size) * 1px)
          at calc(var(--x) * 1px) calc(var(--y) * 1px),
        hsl(var(--hue), calc(var(--saturation) * 1%), calc(var(--lightness) * 1%)),
        transparent 80%
      );
      pointer-events: none;
      /* Mask to border strip only — hide the interior fill */
      -webkit-mask:
        linear-gradient(#fff 0 0) content-box,
        linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask:
        linear-gradient(#fff 0 0) content-box,
        linear-gradient(#fff 0 0);
      mask-composite: exclude;
      transition: opacity 0.15s ease-out;
    }

    /* ::before — slightly wider halo at lower opacity */
    .${sc}::before {
      opacity: calc(var(--border-light-opacity) * var(--proximity, 0));
      z-index: 0;
    }

    /* ::after — tight, bright ring at higher opacity */
    .${sc}::after {
      opacity: calc(var(--border-spot-opacity) * var(--proximity, 0));
      z-index: 1;
    }
  `;
}

// ---------------------------------------------------------------------------
// Static inline styles (CSS vars that don't change per-frame)
// ---------------------------------------------------------------------------
function getInlineStyles(
  glowColor: string,
  saturation: number,
  lightness: number
): React.CSSProperties {
  const { base } = glowColorMap[glowColor] ?? glowColorMap.blue;
  const isGold = glowColor === "gold";

  return {
    // Geometry
    "--radius":          "4",
    "--border-size":     "1",
    "--spotlight-size":  "300",
    // Color
    "--hue":             String(base),
    "--saturation":      String(saturation),
    "--lightness":       String(lightness),
    // Opacity budget — gold is restrained
    "--border-spot-opacity":  isGold ? "0.9" : "1",
    "--border-light-opacity": isGold ? "0.5" : "1",
    // Cursor position + proximity start at 0
    "--x":         "0",
    "--y":         "0",
    "--proximity": "0",
    // Flat dark panel — no interior background gradient
    backgroundColor: "var(--bg-elev, #141414)",
    position: "relative",
  } as React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Instance counter
// ---------------------------------------------------------------------------
let _counter = 0;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function GlowCard({
  glowColor = "blue",
  customSize = false,
  className = "",
  saturation = 70,
  lightness = 55,
  children,
  style,
}: GlowCardProps) {
  const cardRef    = useRef<HTMLDivElement>(null);
  const scopeClass = useRef(`glow-card-${++_counter}`).current;

  // -------------------------------------------------------------------------
  // Fix 2: proximity-based glow that activates BEFORE cursor enters the card.
  // Listens on document so movement anywhere on the page updates all cards.
  // -------------------------------------------------------------------------
  const syncPointer = useCallback((x: number, y: number) => {
    const el = cardRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();

    // Cursor position relative to the card (for the spotlight center)
    el.style.setProperty("--x", String(x - rect.left));
    el.style.setProperty("--y", String(y - rect.top));

    // Proximity: 1 = on card, 0 = ≥400px away
    const cardCenterX = rect.left + rect.width  / 2;
    const cardCenterY = rect.top  + rect.height / 2;
    const dx = x - cardCenterX;
    const dy = y - cardCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const proximityRadius = 200;
    const proximity = Math.max(0, Math.min(1, 1 - distance / proximityRadius));
    el.style.setProperty("--proximity", proximity.toFixed(3));
  }, []);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => syncPointer(e.clientX, e.clientY);
    document.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => document.removeEventListener("pointermove", handlePointerMove);
  }, [syncPointer]);

  const sizeClasses = customSize
    ? ""
    : "aspect-[3/4] shadow-[0_1rem_2rem_-1rem_black] backdrop-blur-[5px]";

  return (
    <>
      <style>{buildPseudoCSS(scopeClass)}</style>
      <div
        ref={cardRef}
        className={`${scopeClass} ${sizeClasses} overflow-hidden rounded ${className}`}
        style={{ ...getInlineStyles(String(glowColor), saturation, lightness), ...style }}
      >
        <div className="relative z-10 h-full w-full">
          {children}
        </div>
      </div>
    </>
  );
}

export default GlowCard;
