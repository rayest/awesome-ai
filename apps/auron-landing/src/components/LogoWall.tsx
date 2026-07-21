"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

const logos = [
  "Stripe", "Vercel", "Anthropic", "Linear",
  "Ramp", "Notion", "Figma", "Cursor",
  "Perplexity", "Replicate", "Cloudflare", "OpenAI",
];

export default function LogoWall() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(root.current?.querySelectorAll("li") ?? [], {
        opacity: 0,
        y: 12,
        stagger: 0.05,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: root.current,
          start: "top 80%",
        },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="relative py-24 border-y border-white/[0.06]">
      <div className="mx-auto max-w-[1280px] px-6">
        <p className="text-center text-[11px] uppercase tracking-[0.3em] font-mono text-[var(--color-bone-mute)] mb-10">
          Trusted by teams shipping at scale
        </p>
        <ul className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-x-8 gap-y-6 items-center">
          {logos.map((name) => (
            <li
              key={name}
              className="text-center text-[18px] font-display tracking-tight font-medium text-[var(--color-bone-mute)] hover:text-[var(--color-bone)] transition-colors duration-500 cursor-default"
              style={{ fontVariantCaps: "all-small-caps" }}
            >
              {name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
