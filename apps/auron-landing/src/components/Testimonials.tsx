"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

const stories = [
  {
    quote:
      "We replaced 3 internal tools and a 6-person platform team with a single Auron deployment. Our release cadence went from monthly to daily, and our bills went the other way.",
    name: "Maya Chen",
    title: "VP Engineering · Lumen Health",
    initial: "M",
  },
  {
    quote:
      "I run 40+ autonomous workflows in production that pay for themselves every 11 minutes. Auron is the closest thing to a 10× engineer I&apos;ve ever touched.",
    name: "Tomás Reyes",
    title: "Founder · Quanta Labs",
    initial: "T",
  },
  {
    quote:
      "Sub-12ms p99 at edge + SOC 2 + real audit logs. Our InfoSec team approved Auron faster than anything else we&apos;ve brought in this year.",
    name: "Asha Patel",
    title: "CISO · Northwind Bank",
    initial: "A",
  },
];

export default function Testimonials() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = root.current?.querySelectorAll("[data-quote]") ?? [];
      gsap.from(cards, {
        opacity: 0,
        y: 40,
        stagger: 0.15,
        duration: 1.2,
        ease: "expo.out",
        scrollTrigger: { trigger: root.current, start: "top 75%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="customers" ref={root} className="relative py-32">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="mb-16 max-w-[760px]">
          <p className="text-[11px] uppercase tracking-[0.3em] font-mono text-[var(--color-gold)] mb-4">
            — customers
          </p>
          <h2 className="font-display text-[clamp(40px,6vw,80px)] tracking-[-0.03em] font-medium leading-[0.95] text-balance">
            Teams that <span className="italic font-serif font-normal text-[var(--color-bone-mute)]">ship</span>{" "}
            with Auron.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stories.map((s, i) => (
            <figure
              key={i}
              data-quote
              className="group relative flex flex-col gap-8 p-8 lg:p-10 rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.02] to-transparent hover:border-[var(--color-gold)]/30 transition-colors duration-500"
            >
              <span
                aria-hidden
                className="font-serif text-[120px] leading-none text-[var(--color-gold)]/15 absolute -top-4 left-6 select-none"
              >
                &ldquo;
              </span>

              <blockquote className="relative font-serif text-[20px] leading-[1.45] text-[var(--color-bone)] italic">
                {s.quote.replace(/&apos;/g, "'")}
              </blockquote>

              <figcaption className="flex items-center gap-3 mt-auto pt-6 border-t border-white/[0.05]">
                <span className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-gold)]/40 to-[var(--color-gold-deep)]/20 border border-[var(--color-gold)]/30 flex items-center justify-center font-display text-lg">
                  {s.initial}
                </span>
                <div className="text-sm">
                  <p className="font-medium text-[var(--color-bone)]">{s.name}</p>
                  <p className="text-[var(--color-bone-mute)]">{s.title}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
