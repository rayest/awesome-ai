"use client";

import { useState } from "react";

type Cycle = "month" | "year";

const plans = [
  {
    id: "starter",
    name: "Starter",
    tag: "For solo builders and weekend experiments.",
    priceM: 0,
    priceY: 0,
    cta: "Start building",
    highlight: false,
    features: [
      "3 deployed agents",
      "1,000 runs / month",
      "Community support",
      "Single region",
    ],
  },
  {
    id: "team",
    name: "Team",
    tag: "The default for shipping teams.",
    priceM: 49,
    priceY: 39,
    cta: "Start 14-day trial",
    highlight: true,
    features: [
      "Unlimited agents",
      "100k runs / month",
      "SSO + audit log",
      "Priority support",
      "Edge deploy (38 regions)",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tag: "When audit and scale are non-negotiable.",
    priceM: -1,
    priceY: -1,
    cta: "Talk to sales",
    highlight: false,
    features: [
      "Air-gapped deploy",
      "Custom SLA · 99.99%+",
      "SOC 2 + HIPAA + ISO 27001",
      "Dedicated engineer",
      "Volume + custom pricing",
    ],
  },
];

export default function Pricing() {
  const [cycle, setCycle] = useState<Cycle>("year");

  return (
    <section id="pricing" className="relative py-32">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="text-center mb-16">
          <p className="text-[11px] uppercase tracking-[0.3em] font-mono text-[var(--color-gold)] mb-4">
            — pricing
          </p>
          <h2 className="font-display text-[clamp(40px,6vw,80px)] tracking-[-0.03em] font-medium leading-[0.95] text-balance">
            Pricing that pays{" "}
            <span className="italic font-serif font-normal text-[var(--color-bone-mute)]">for itself.</span>
          </h2>
        </div>

        <div className="flex justify-center mb-12">
          <CycleToggle cycle={cycle} onChange={setCycle} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {plans.map((p) => {
            const price = cycle === "year" ? p.priceY : p.priceM;
            return (
              <article
                key={p.id}
                className={[
                  "relative flex flex-col rounded-2xl p-8 lg:p-10 transition-all duration-500",
                  p.highlight
                    ? "border border-[var(--color-gold)]/60 bg-gradient-to-b from-[var(--color-gold)]/[0.06] to-[var(--color-obsidian)] shadow-[0_0_80px_rgba(232,199,115,0.18)]"
                    : "border border-white/[0.06] bg-[var(--color-obsidian)]",
                ].join(" ")}
              >
                {p.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-mono rounded-full bg-[var(--color-gold)] text-[var(--color-void)]">
                    most loved
                  </span>
                )}

                <h3 className="font-display text-2xl font-medium">{p.name}</h3>
                <p className="mt-2 text-[14px] text-[var(--color-bone-mute)] min-h-[42px]">{p.tag}</p>

                <div className="mt-8 mb-8">
                  {price < 0 ? (
                    <span className="font-display text-[44px] tracking-[-0.03em] font-medium">Custom</span>
                  ) : price === 0 ? (
                    <span className="font-display text-[64px] tracking-[-0.04em] font-medium">
                      $0
                      <span className="ml-1 text-[14px] text-[var(--color-bone-mute)] font-mono">/ forever</span>
                    </span>
                  ) : (
                    <span className="font-display text-[64px] tracking-[-0.04em] font-medium">
                      ${price}
                      <span className="ml-1 text-[14px] text-[var(--color-bone-mute)] font-mono">/ user / mo</span>
                    </span>
                  )}
                </div>

                <a
                  href="#cta"
                  className={[
                    "group inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-[14px] font-medium transition-all",
                    p.highlight
                      ? "bg-[var(--color-gold)] text-[var(--color-void)] hover:shadow-[0_0_40px_rgba(232,199,115,0.5)]"
                      : "border border-white/12 text-[var(--color-bone)] hover:border-white/30",
                  ].join(" ")}
                >
                  {p.cta}
                  <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
                </a>

                <ul className="mt-8 space-y-3 text-[14px]">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span
                        aria-hidden
                        className="mt-1 w-4 h-4 rounded-full border border-[var(--color-gold)]/40 flex-shrink-0 flex items-center justify-center"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold)]" />
                      </span>
                      <span className="text-[var(--color-bone-dim)]">{f}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CycleToggle({ cycle, onChange }: { cycle: Cycle; onChange: (c: Cycle) => void }) {
  return (
    <div className="inline-flex items-center p-1 rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-md">
      {(["month", "year"] as Cycle[]).map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={[
            "relative px-4 py-2 text-sm rounded-full transition-colors",
            cycle === c ? "text-[var(--color-void)]" : "text-[var(--color-bone-dim)] hover:text-[var(--color-bone)]",
          ].join(" ")}
        >
          {cycle === c && (
            <span className="absolute inset-0 rounded-full bg-[var(--color-gold)]" />
          )}
          <span className="relative z-10 capitalize">
            {c}ly
            {c === "year" && <span className="ml-1 text-[10px] font-mono opacity-70">save 20%</span>}
          </span>
        </button>
      ))}
    </div>
  );
}
