# MotionU Design System

**Concept:** MotionU is a departure board. Every link is a route, every QR code is a ticket, every click is a passenger boarding. The UI borrows from transit signage — ink boards, ticket stock, perforated tear-lines, mono route codes — rather than generic SaaS gradient-and-card design.

This doc is the reference for building MotionU screens in a Next.js + Tailwind app. Treat it as the source of truth: derive new screens from these tokens instead of picking one-off colors or fonts.

---

## 1. Color

Blue is the MotionU brand color (route blue), paired with the ink board it sits on and a teal used only for "live" / active states.

| Token | Hex | Use |
|---|---|---|
| `ink` | `#101826` | Primary dark surface — board/nav/footer background, QR ticket stub |
| `ink-soft` | `#182437` | Hover/active state on dark surfaces |
| `paper` | `#F1ECDD` | App background, ticket stock |
| `paper-dim` | `#E7E0CB` | Secondary surface on paper (input fills, stat card backing) |
| `route` | `#2F5DFF` | Primary brand blue — CTAs, links, active nav, QR accent |
| `route-dark` | `#2447D1` | Hover/pressed state for `route` |
| `signal` | `#2FD9C4` | Secondary accent — "live" indicators, positive/active data only. Never a second CTA color. |
| `muted` | `#7C8494` | Secondary text, labels, captions |
| `line-dark` | `rgba(255,255,255,.09)` | Hairlines on dark surfaces |
| `line-paper` | `#D9D0B4` | Hairlines/borders on paper surfaces |

**Rules**
- `route` (blue) is the only action color. One primary CTA per screen.
- `signal` (teal) is reserved for liveness/status — a pulsing dot, an active badge, a positive metric. It never labels a button.
- Don't introduce a second blue shade beyond `route` / `route-dark`. Depth comes from `ink` / `paper`, not from more blues.
- Text on `paper`: default to `ink`; secondary text uses `muted`. Text on `ink`: default to `paper`; secondary text uses `muted`.

### Tailwind config

```ts
// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#101826", soft: "#182437" },
        paper: { DEFAULT: "#F1ECDD", dim: "#E7E0CB" },
        route: { DEFAULT: "#2F5DFF", dark: "#2447D1" },
        signal: "#2FD9C4",
        muted: "#7C8494",
        line: { dark: "rgba(255,255,255,.09)", paper: "#D9D0B4" },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
} satisfies Config;
```

Usage: `bg-ink`, `text-route`, `border-line-paper`, `bg-paper-dim`, etc.

---

## 2. Typography

Three roles, never interchanged:

| Role | Font | Where |
|---|---|---|
| Display | **Space Grotesk** (500/600/700) | Headlines, ticket numbers as visual anchors, section titles |
| Body | **IBM Plex Sans** (400/500/600) | Paragraphs, labels, form copy |
| Mono | **IBM Plex Mono** (400/500/600) | Route codes, URLs, timestamps, table data, uppercase eyebrows/tags |

Mono is a content signal, not decoration: anything that is *data* (a short link, a click count, a ticket ID, a status tag) renders in mono, uppercase, letter-spaced. This is what makes the product feel like a routing system rather than a generic dashboard.

### Next.js setup (`app/layout.tsx`)

```tsx
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});
const body = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="font-body bg-paper text-ink">{children}</body>
    </html>
  );
}
```

### Type scale

| Use | Class |
|---|---|
| Page headline | `font-display text-3xl sm:text-4xl font-semibold tracking-tight` |
| Section title | `font-display text-lg font-semibold` |
| Body | `font-body text-sm` |
| Eyebrow / status tag | `font-mono text-[11px] uppercase tracking-[0.2em] text-muted` |
| Data / code | `font-mono text-sm` |

---

## 3. Signature elements

These are the pieces that make MotionU recognizable. Reuse them; don't reinvent per-screen.

### Ticket / boarding pass card
Any "issued" artifact (a route, a report, an invite) can render as a two-part ticket: a light **paper** section on top with the details, a **perforated tear-line**, then a dark **ink** stub on the bottom holding the primary artifact (QR, code, badge).

```css
.perforation {
  height: 16px;
  background-image: radial-gradient(circle at 10px 8px, var(--paper) 6px, transparent 6.5px);
  background-size: 20px 16px;
  background-repeat: repeat-x;
}
/* pass --paper or --ink depending on which surface the punch-through reveals */
```

### Route line
A horizontal line with 2–3 labeled stations (mono caption under each), used wherever a process has a real, fixed sequence (e.g. Origin → Route → Signal). Only use this for genuine sequences — not as generic decoration.

### Departure board nav/header
Dark `ink` band containing logo, nav, and a live-status row (`signal` dot + mono "SYSTEM ONLINE" label). Content sections below sit on `paper`.

### Live dot
```css
@keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: .25; } }
.live-dot { animation: pulse-dot 1.8s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .live-dot { animation: none; } }
```
Use only to mean "this is live/active right now" — a real-time table, an online status. Don't use it as generic flair.

---

## 4. Components

**Buttons**
- Primary: `bg-route hover:bg-route-dark text-white font-medium rounded-lg` — one per view.
- Secondary: `border border-ink text-ink rounded-lg` (on paper) or `border border-line-dark text-paper` (on ink).
- Destructive text action: `text-route-dark` (blue doubles as the only accent, so use it sparingly for delete/remove text-links rather than adding a red).

**Inputs**
`border border-line-paper rounded-lg bg-white`, focus state: `border-route ring-2 ring-route/15`.

**Tables (data/departures views)**
Header row on `ink`/`paper-dim` with mono uppercase labels; body rows on `paper` separated by `line-paper` hairlines; status badges use `signal` at 15% opacity for positive/active, `paper-dim` + `muted` for neutral/zero.

**Cards / stat tiles**
`bg-white/70 border border-line-paper rounded-xl`, optionally topped with a `.perforation` strip for anything that reads as "issued" (a ticket, a stat pulled fresh).

---

## 5. Motion

- Motion is used for one orchestrated purpose per view (e.g. the route-line station lighting up on success), not scattered hover effects.
- Respect `prefers-reduced-motion` on every animation (see live-dot example).
- Button press feedback: `transition-transform active:scale-[.97]`.

---

## 6. Auth-gated content pattern

Some views (e.g. the analytics dashboard) are gated behind login. Pattern:
- Nav item shows a small lock icon (`fa-lock`, mono size) when signed out.
- Clicking a locked nav item opens the auth modal directly — it does not navigate to an empty/broken state first.
- The gated section keeps two states in the DOM: a **locked** state (ticket-style prompt: "Access required" + Log in / Sign up buttons) and an **unlocked** state (real content). Toggle visibility based on session state; don't unmount/remount the whole section.
- Auth modal follows the ticket-card visual language (`ink` header bar, `paper` body, tabbed Log in / Sign up).

---

## 7. Do / Don't

**Do**
- Keep `route` blue as the single accent color threaded through CTAs, links, and the QR accent color.
- Use mono type as a content signal for anything that is literally data.
- Let the ticket/perforation motif carry "this was issued to you" moments.

**Don't**
- Don't add a second blue tone "for variety" — vary via `ink`/`paper`/`muted` instead.
- Don't use `signal` teal on a button — it's a status color only.
- Don't reach for numbered badges (01/02/03) or the route-line motif unless the content is a genuine sequence.