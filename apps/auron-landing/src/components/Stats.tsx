"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: 12.4, suffix: "ms", label: "median p99 latency", decimals: 1 },
  { value: 99.99, suffix: "%", label: "platform uptime SLA", decimals: 2 },
  { value: 1247, suffix: "+", label: "native integrations", decimals: 0 },
  { value: 4.8, suffix: "/5", label: "developer NPS score", decimals: 1 },
];

export default function Stats() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const els = root.current?.querySelectorAll<HTMLElement>("[data-stat]") ?? [];
      els.forEach((el) => {
        const target = parseFloat(el.dataset.value ?? "0");
        const decimals = parseInt(el.dataset.decimals ?? "0", 10);
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 1.8,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
          onUpdate: () => {
            el.querySelector("[data-stat-num]")!.textContent = obj.v.toFixed(decimals);
          },
        });
        gsap.from(el.querySelector("[data-stat-card]"), {
          opacity: 0,
          y: 30,
          duration: 1,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="relative py-32 border-y border-white/[0.05]">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <div
              key={i}
              data-stat
              data-value={s.value}
              data-decimals={s.decimals}
              className="group relative p-6 lg:p-8 rounded-2xl border border-white/[0.06] bg-[var(--color-obsidian)] hover:border-[var(--color-gold)]/30 transition-colors duration-500"
            >
              <div data-stat-card>
                <div className="flex items-baseline gap-1">
                  <span
                    data-stat-num
                    className="font-display text-[64px] lg:text-[88px] leading-none font-medium tracking-[-0.04em] text-[var(--color-bone)] tnum"
                  >
                    0
                  </span>
                  <span className="font-display text-[24px] lg:text-[32px] text-[var(--color-gold)]">
                    {s.suffix}
                  </span>
                </div>
                <p className="mt-4 text-[13px] uppercase tracking-[0.18em] font-mono text-[var(--color-bone-mute)]">
                  {s.label}
                </p>
              </div>

              {/* Sparkline decoration */}
              <svg
                className="absolute bottom-4 right-4 w-20 h-8 opacity-60 group-hover:opacity-100 transition-opacity"
                viewBox="0 0 80 32"
                aria-hidden
              >
                <path
                  d="M0,28 L10,22 L20,24 L30,16 L40,18 L50,8 L60,12 L70,4 L80,6"
                  stroke="var(--color-gold)"
                  strokeWidth="1"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
