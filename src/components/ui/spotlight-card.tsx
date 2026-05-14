"use client";

import React, { useRef, useCallback } from "react";

// ---------------------------------------------------------------------------
// Color map — each entry defines the HSL hue center (base) and how many
// degrees the hue is allowed to drift as the cursor moves (spread).
// Gold uses a tight spread so the glow stays in warm-metallic territory and
// never drifts into neon-yellow or orange.
// ---------------------------------------------------------------------------
const glowColorMap: Record<string, { base: number; spread: number }> = {
  blue: { base: 210, spread: 40 },
  purple: { base: 270, spread: 40 },
  green: { base: 145, spread: 40 },
  red: { base: 0, spread: 40 },
  orange: { base: 30, spread: 40 },
  pink: { base: 320, spread: 40 },
  cyan: { base: 190, spread: 40 },
  gold: { base: 42, spread: 20 },
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
export interface GlowCardProps {
  /** One of the keys in glowColorMap */
  glowColor?: keyof typeof glowColorMap;
  /** When true, removes portrait-card sizing so the tile can be any shape */
  customSize?: boolean;
  /** Optional extra class names on the outer wrapper */
  className?: string;
  /** HSL saturation override (default 70) — lower = less neon, more metallic */
  saturation?: number;
  /** HSL lightness override (default 55) — lower = deeper, richer tone */
  lightness?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns the static CSS text for the spotlight pseudo-elements.
 * Scoped to a unique className so multiple cards on the same page don't
 * bleed into each other.
 */
function buildPseudoCSS(scopeClass: string): string {
  return `
    .${scopeClass} {
      --spotlight-size: 200px;
    }

    /* Spotlight fill — radial gradient that follows the cursor */
    .${scopeClass}::before {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: calc(var(--radius) * 1px);
      background: radial-gradient(
        calc(var(--spotlight-size) * 1px) circle at calc(var(--x) * 1px) calc(var(--y) * 1px),
        hsl(var(--hue), calc(var(--saturation) * 1%), calc(var(--lightness) * 1%)),
        transparent 100%
      );
      opacity: var(--bg-spot-opacity);
      z-index: 0;
      pointer-events: none;
    }

    /* Border glow — slightly larger, masked to the border ring */
    .${scopeClass}::after {
      content: "";
      position: absolute;
      inset: calc(var(--border-size) * -1px);
      border-radius: calc(var(--radius) * 1px + calc(var(--border-size) * 1px));
      background: radial-gradient(
        calc(var(--spotlight-size) * 0.75px) circle at calc(var(--x) * 1px) calc(var(--y) * 1px),
        hsl(var(--hue), calc(var(--saturation) * 1%), calc(var(--lightness) * 1%)),
        transparent 100%
      );
      opacity: var(--border-spot-opacity);
      z-index: -1;
      pointer-events: none;
    }
  `;
}

/**
 * Computes the full set of CSS custom properties to attach inline to the
 * card element.
 */
function getInlineStyles(
  x: number,
  y: number,
  glowColor: string,
  saturation: number,
  lightness: number
): React.CSSProperties {
  const { base } = glowColorMap[glowColor] ?? glowColorMap.blue;

  const isGold = glowColor === "gold";

  return {
    // Cursor position (unitless — multiplied by 1px inside CSS)
    "--x": x,
    "--y": y,
    // HSL components
    "--hue": base,
    "--saturation": saturation,
    "--lightness": lightness,
    // Geometry
    "--radius": 4,           // 4px border-radius to match ESM card system
    "--border-size": 1,      // 1px hairline border
    // Opacity — gold gets a subtler treatment
    "--bg-spot-opacity": isGold ? 0.06 : 0.1,
    "--border-spot-opacity": isGold ? 0.6 : 1,
    "--border-light-opacity": isGold ? 0.3 : 1,
    // Required for ::before/::after positioning
    position: "relative",
  } as React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Stable scope-class counter (module-level, SSR-safe for CSR projects)
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
  const cardRef = useRef<HTMLDivElement>(null);
  const scopeClassRef = useRef<string>(`glow-card-${++_counter}`);
  const scopeClass = scopeClassRef.current;

  // Track cursor position relative to the card
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Update CSS custom properties directly — avoids a React re-render on
    // every mousemove event
    card.style.setProperty("--x", String(x));
    card.style.setProperty("--y", String(y));
  }, []);

  // Reset glow to center when the cursor leaves
  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    const w = card.offsetWidth / 2;
    const h = card.offsetHeight / 2;
    card.style.setProperty("--x", String(w));
    card.style.setProperty("--y", String(h));
  }, []);

  // Sizing classes — stripped when customSize is true so tiles can be any
  // landscape shape without the portrait-card defaults
  const sizeClasses = customSize
    ? ""
    : "aspect-[3/4] shadow-[0_1rem_2rem_-1rem_black] backdrop-blur-[5px]";

  const inlineStyles = getInlineStyles(0, 0, String(glowColor), saturation, lightness);

  return (
    <>
      {/* Scoped pseudo-element CSS — injected once per card instance */}
      <style>{buildPseudoCSS(scopeClass)}</style>

      <div
        ref={cardRef}
        className={`${scopeClass} ${sizeClasses} overflow-hidden rounded ${className}`}
        style={{ ...inlineStyles, ...style }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Children sit above the ::before spotlight layer */}
        <div className="relative z-10 h-full w-full">
          {children}
        </div>
      </div>
    </>
  );
}

export default GlowCard;
