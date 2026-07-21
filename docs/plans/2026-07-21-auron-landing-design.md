# Auron Landing — Design & Implementation Notes

**Date:** 2026-07-21
**Project:** `apps/auron-landing/`
**Stack:** Next.js 16 · React 19 · Tailwind v4 · GSAP 3 · Lenis 1.3 · Framer Motion 11

---

## 1. Brand

- **Product:** Auron — autonomous AI agent platform (fictional, swappable)
- **Tagline:** "Autonomous intelligence. Built for scale."
- **Voice:** Linear-grade minimal, editorial, confident. Single accent (gold) used sparingly.

## 2. Design Tokens

| Token | Value | Role |
|---|---|---|
| `--color-void` | `#000000` | page bg |
| `--color-obsidian` | `#0a0a0a` | card bg |
| `--color-graphite` | `#111111` | elevated surface |
| `--color-fog` | `#1f1f1f` | dividers |
| `--color-bone` | `#f5f1e8` | primary text (warm off-white) |
| `--color-bone-dim` | `#c9c5b8` | secondary text |
| `--color-bone-mute` | `#8a877d` | tertiary text |
| `--color-gold` | `#e8c773` | accent (rare, deliberate) |
| `--color-gold-deep` | `#b8964e` | secondary accent |

Typography: Inter (sans) / Inter Display (titles) / Newsreader (italic highlights) / JetBrains Mono (data).

## 3. Page Architecture (7 sections)

1. **Hero** — 100svh full bleed · CSS animated abstract bg · Canvas particle field · SplitText char reveal · primary CTA
2. **LogoWall** — grayscale band, hover → gold; GSAP stagger-in on enter
3. **ProductDemo** — Framer Motion `layoutId` tab switcher · 4 hand-crafted mock surfaces (no asset 404)
4. **Features** — 4-card grid · hover lifts each card with gold border + glow · inline SVG art (neural, collab, shield, globe)
5. **Stats** — 4 KPIs · GSAP `CountUp` from 0 → target · sparkline decorations
6. **Testimonials** — 3-column editorial quotes · Newsreader italic · avatar with gradient
7. **Pricing** — Yearly / Monthly toggle · gold-edged middle plan · 8 FAQ items in accordion
8. **FAQ + Footer** — accordion (Framer `height: auto` expand) · 4-col footer with subscribe form + socials · giant closing CTA

## 4. Animation Pipeline

| Layer | Tool | Trigger |
|---|---|---|
| Smooth scroll | Lenis | mount |
| Hero char reveal | GSAP timeline | mount |
| Scroll-driven reveals | GSAP ScrollTrigger | viewport entry |
| Tab + accordion | Framer Motion `layoutId` / `height: auto` | user |
| Mouse parallax | raw event listeners + RAF | mouse move |
| Particle field | 2D canvas · RAF | mount |
| Floating hero text | GSAP `yoyo` tween | mount |

## 5. Performance Budget

- LCP ≤ 2.0 s (no video asset, only CSS gradient + particles = instant LCP)
- CLS ≤ 0.05 (all decorative layers are absolute)
- JS ≤ 200 KB gzipped (estimate: GSAP core ≈ 60 KB, Framer ≈ 50 KB, Lenis ≈ 6 KB, Tailwind ≈ 30 KB)
- 60 fps on M1 / mid-tier mobile (particles capped at ~140)

## 6. Verification Checklist

- [ ] Hero renders with first frame paint (no FOUC)
- [ ] Tab switch animates 60fps
- [ ] Count-up triggers only when stats section in view
- [ ] Reduced-motion preference disables particle loop
- [ ] Mobile nav opens at 375px width
- [ ] Lighthouse ≥ 90 (perf / a11y)

## 7. Replace Brand (one-pager)

To swap "Auron" for your product, change:
- `src/components/*.tsx` — each contains `Auron` literal; sed-replace all
- `src/app/layout.tsx` `metadata.title` & `description`
- Hero title in `Hero.tsx` H1
- Tagline in `Features.tsx`

## 8. Run

```bash
cd apps/auron-landing
pnpm dev   # opens http://localhost:3001
```
