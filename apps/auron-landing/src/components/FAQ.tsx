"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const faqs = [
  {
    q: "Is Auron just a wrapper around GPT-4?",
    a: "No. Auron is a deterministic orchestration runtime that runs any model — OpenAI, Anthropic, Cohere, open-source — alongside your data and tools. We give you the missing substrate: state, retries, observability, deployment.",
  },
  {
    q: "How does Auron compare to LangChain or LlamaIndex?",
    a: "Those are libraries. Auron is infrastructure. We own the cold start, the edge deploy, the cost routing, the audit log, the audit replay. You bring the goal, we bring the ops.",
  },
  {
    q: "Where does my data live?",
    a: "Your data stays in your region. You pick from 38 edge regions; we never replicate across compliance boundaries. Enterprise customers can air-gap entirely.",
  },
  {
    q: "What about my prompt iterations and agent configs?",
    a: "Everything is version-controlled, branch-able, and review-able. Every change carries a full execution trace for replay & rollback. Audit-grade by default.",
  },
  {
    q: "Can I self-host?",
    a: "Yes — Enterprise tier ships a Kubernetes operator and a Terraform module. You run it on your own VPC; we provide updates, support, and the operator.",
  },
  {
    q: "How is Auron priced for high-volume workloads?",
    a: "Team plan includes 100k runs/mo. Above that, you move to committed-volume contracts with sub-linear pricing. Most production customers see unit-cost reductions of 60-80% within their first quarter.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-32 border-t border-white/[0.05]">
      <div className="mx-auto max-w-[920px] px-6">
        <div className="mb-16 text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] font-mono text-[var(--color-gold)] mb-4">
            — honest answers
          </p>
          <h2 className="font-display text-[clamp(36px,5vw,64px)] tracking-[-0.03em] font-medium leading-[1] text-balance">
            Questions you actually{" "}
            <span className="italic font-serif font-normal text-[var(--color-bone-mute)]">ask.</span>
          </h2>
        </div>

        <div className="divide-y divide-white/[0.06] border-t border-b border-white/[0.06]">
          {faqs.map((f, i) => (
            <div key={i} className="py-1">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-6 py-6 text-left group"
                aria-expanded={open === i}
              >
                <span className="font-display text-[18px] md:text-[20px] tracking-tight text-[var(--color-bone)] group-hover:text-[var(--color-gold)] transition-colors">
                  {f.q}
                </span>
                <span
                  className={[
                    "flex-shrink-0 w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-500",
                    open === i
                      ? "border-[var(--color-gold)] bg-[var(--color-gold)]/10 rotate-45"
                      : "border-white/12 group-hover:border-white/30",
                  ].join(" ")}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
              </button>

              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.5, 0, 0.2, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="pb-8 pr-12 text-[var(--color-bone-dim)] text-[16px] leading-[1.65]">
                      {f.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
