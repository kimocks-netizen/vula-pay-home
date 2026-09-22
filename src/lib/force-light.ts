import type { CSSProperties } from "react";

// Pins a subtree to the light-theme token values regardless of the site's
// `.dark` class — for UI meant to represent someone else's device (a
// customer's phone, a payment notification) rather than this page's own
// chrome, which shouldn't flip just because the marketing site is in dark
// mode. Inline styles beat the `.dark` class rule on specificity.
export const FORCE_LIGHT_VARS = {
  "--card": "oklch(1 0 0)",
  "--card-foreground": "oklch(0.20 0.035 258)",
  "--secondary": "oklch(0.962 0.012 250)",
  "--secondary-foreground": "oklch(0.26 0.04 258)",
  "--muted-foreground": "oklch(0.53 0.03 256)",
  "--primary": "oklch(0.55 0.196 258)",
  "--primary-foreground": "oklch(0.99 0.004 250)",
} as CSSProperties;
