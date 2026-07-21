# Auron Landing

A high-aesthetic single-page landing for a fictional AI agent platform. Dark, gold-accented Linear/Vercel-style design with full GSAP + Framer Motion animation pipeline.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19**
- **Tailwind CSS v4** with custom design tokens
- **GSAP 3** + ScrollTrigger — timeline + scroll-driven reveals
- **Framer Motion 11** — tab layoutId, accordion height: auto
- **Lenis 1.3** — buttery smooth scrolling
- **Newsreader** (italic accent) + **Inter** + **JetBrains Mono**

## Sections

1. **Sticky glass nav** — pill bar that morphs on scroll
2. **Hero** — giant split-text headline, gold "scale" word, animated abstract bg + canvas particles
3. **Logo wall** — 12 grayscale brand names that go gold on hover
4. **Product demo** — 4-tab switcher (Demo / Editor / Deploy / Monitor) with shared layout animation
5. **Features** — 4-card grid with SVG art (neural net / collab / shield / globe)
6. **Stats** — 4 KPIs with GSAP count-up on viewport entry
7. **Testimonials** — 3 editorial quotes in serif italic
8. **Pricing** — 3-tier with gold-edged middle plan + monthly/yearly toggle
9. **FAQ + Footer** — accordion + 4-col footer + giant closing CTA + subscribe form

## Run locally

```bash
pnpm install
pnpm dev          # http://localhost:3001
```

## Swap to your product

`Auron` is a placeholder. Edit:
- Hero H1 text in `src/components/Hero.tsx`
- All copy in `Pricing.tsx`, `FAQ.tsx`, `Testimonials.tsx`
- `metadata.title` in `src/app/layout.tsx`
- Brand name in `src/components/Nav.tsx` & `Footer.tsx`

Design tokens live in `src/app/globals.css` under `@theme {}`.
