"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Tab = "demo" | "editor" | "deploy" | "monitor";

const tabs: { id: Tab; label: string; title: string; body: string }[] = [
  {
    id: "demo",
    label: "Demo",
    title: "Prompt → production in 90 seconds.",
    body: "Type what you want. Auron composes a workflow, picks the right agents, and ships it to the edge. No YAML. No review meetings.",
  },
  {
    id: "editor",
    label: "Editor",
    title: "Visual composer with version control.",
    body: "Drag, drop, branch, merge. Every change ships with audit trails, type-checked agents, and one-click rollback.",
  },
  {
    id: "deploy",
    label: "Deploy",
    title: "Push to 38 regions in one keystroke.",
    body: "Auron picks the fastest path, handles secret rotation, and rolls back automatically on regression. Built-in canary, zero downtime.",
  },
  {
    id: "monitor",
    label: "Monitor",
    title: "See every decision in real time.",
    body: "Trace every token, every tool call, every $0.0001 spent. Step back, replay, branch, ship a fix in the same UI.",
  },
];

export default function ProductDemo() {
  const [active, setActive] = useState<Tab>("demo");
  const t = tabs.find((x) => x.id === active)!;

  return (
    <section id="demo" className="relative py-32">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="text-center mb-14">
          <p className="text-[11px] uppercase tracking-[0.3em] font-mono text-[var(--color-gold)] mb-4">
            — see it in action
          </p>
          <h2 className="font-display text-[clamp(40px,6vw,80px)] leading-[0.95] tracking-[-0.03em] font-medium text-balance">
            From prompt to product.{" "}
            <span className="text-[var(--color-bone-mute)]">In seconds.</span>
          </h2>
        </div>

        {/* Tab bar */}
        <div className="relative flex justify-center mb-10">
          <div className="inline-flex items-center gap-1 p-1 rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-md">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={[
                  "relative px-4 py-2 text-sm font-medium rounded-full transition-colors",
                  active === tab.id
                    ? "text-[var(--color-void)]"
                    : "text-[var(--color-bone-dim)] hover:text-[var(--color-bone)]",
                ].join(" ")}
              >
                {active === tab.id && (
                  <motion.span
                    layoutId="active-tab"
                    className="absolute inset-0 rounded-full bg-[var(--color-gold)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Body — video + copy */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: [0.5, 0, 0.2, 1] }}
            className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-10 items-center"
          >
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/[0.06] bg-[var(--color-obsidian)]">
              <MockScreen kind={active} />
            </div>

            <div className="space-y-5">
              <h3 className="font-display text-3xl md:text-4xl font-medium tracking-tight leading-[1.1]">
                {t.title}
              </h3>
              <p className="text-[var(--color-bone-dim)] text-[17px] leading-[1.6]">{t.body}</p>
              <a
                href="#"
                className="group inline-flex items-center gap-2 text-[15px] text-[var(--color-gold)] hover:gap-3 transition-all"
              >
                Try the {t.label.toLowerCase()} now
                <span aria-hidden>→</span>
              </a>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

function MockScreen({ kind }: { kind: Tab }) {
  // Mini-mock surfaces — each is a different vibe
  if (kind === "demo") return <DemoMock />;
  if (kind === "editor") return <EditorMock />;
  if (kind === "deploy") return <DeployMock />;
  return <MonitorMock />;
}

function DemoMock() {
  return (
    <div className="absolute inset-0 p-8 font-mono text-[12px] text-[var(--color-bone-dim)] flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-fog)]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-fog)]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-fog)]" />
        </div>
        <span className="ml-3 text-[var(--color-bone-mute)]">auron.run/prompt</span>
      </div>
      <div className="flex-1 rounded-lg border border-white/[0.06] bg-black/50 p-4 space-y-2 overflow-hidden">
        <div className="text-[var(--color-gold)]">$ prompt "Summarize today's Q4 sales"</div>
        <div className="opacity-60">→ composing agents: data-fetch, summarize, format</div>
        <div className="opacity-60">→ running on 38-edge regions</div>
        <div className="mt-3 text-[var(--color-bone)]">
          <span className="text-[var(--color-gold)]">✓ done in 1.2s</span> · $0.003
        </div>
      </div>
    </div>
  );
}

function EditorMock() {
  return (
    <div className="absolute inset-0 p-6">
      <div className="grid grid-cols-3 gap-3 h-full">
        {[
          { x: 12, y: 28, label: "Trigger", gold: false },
          { x: 50, y: 18, label: "Fetch", gold: false },
          { x: 50, y: 50, label: "Summarize", gold: true },
          { x: 86, y: 35, label: "Post to Slack", gold: false },
        ].map((n, i) => (
          <div
            key={i}
            className={[
              "absolute px-3 py-2 rounded-lg border text-[11px] font-mono",
              n.gold
                ? "border-[var(--color-gold)] bg-[var(--color-gold)]/10 text-[var(--color-gold)]"
                : "border-white/15 bg-white/[0.03] text-[var(--color-bone-dim)]",
            ].join(" ")}
            style={{ left: `${n.x}%`, top: `${n.y}%`, transform: "translate(-50%,-50%)" }}
          >
            {n.label}
          </div>
        ))}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <path d="M120,140 C 250,140 250,90 500,90" stroke="rgba(232,199,115,0.4)" strokeWidth="1" fill="none" strokeDasharray="4 4" />
          <path d="M120,140 C 250,140 250,250 500,250" stroke="rgba(245,241,232,0.2)" strokeWidth="1" fill="none" strokeDasharray="4 4" />
          <path d="M500,90 C 700,90 700,180 860,180" stroke="rgba(245,241,232,0.2)" strokeWidth="1" fill="none" strokeDasharray="4 4" />
          <path d="M500,250 C 700,250 700,180 860,180" stroke="rgba(232,199,115,0.4)" strokeWidth="1" fill="none" strokeDasharray="4 4" />
        </svg>
      </div>
    </div>
  );
}

function DeployMock() {
  return (
    <div className="absolute inset-0 p-8">
      <div className="grid grid-cols-8 gap-2 h-full text-[10px] font-mono">
        {Array.from({ length: 64 }).map((_, i) => {
          const regions = ["✓", "✓", "✓", "···", "✓", "✓", "⟳", "✓"];
          const r = regions[i % regions.length];
          const gold = r === "⟳";
          return (
            <div
              key={i}
              className={[
                "aspect-square rounded flex items-center justify-center border",
                gold
                  ? "border-[var(--color-gold)] text-[var(--color-gold)] bg-[var(--color-gold)]/10"
                  : r === "···"
                  ? "border-white/10 text-[var(--color-bone-mute)]"
                  : "border-white/10 text-[var(--color-bone-dim)]",
              ].join(" ")}
            >
              {r}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MonitorMock() {
  return (
    <div className="absolute inset-0 p-6 font-mono text-[11px]">
      <div className="space-y-1.5 overflow-hidden">
        {[
          { t: "14:08:01.221", m: "agent.summarize → input 4.2kB", c: "bone-dim" },
          { t: "14:08:01.842", m: "llm.route → claude-sonnet, 512 ctx", c: "bone-mute" },
          { t: "14:08:02.103", m: "tool.call → slack.postMessage", c: "gold" },
          { t: "14:08:02.488", m: "↳ ✓ delivered to #q4-sales", c: "bone" },
          { t: "14:08:02.490", m: "summary: Q4 saw +18% MoM …", c: "bone-dim" },
          { t: "14:08:02.491", m: "cost: $0.003 · p99: 412ms", c: "bone-mute" },
        ].map((l, i) => (
          <div key={i} className="flex gap-3">
            <span className="text-[var(--color-bone-mute)]">{l.t}</span>
            <span
              className={[
                l.c === "gold" ? "text-[var(--color-gold)]" : l.c === "bone" ? "text-[var(--color-bone)]" : "text-[var(--color-bone-dim)]",
              ].join(" ")}
            >
              {l.m}
            </span>
          </div>
        ))}
        <div className="text-[var(--color-gold)] animate-pulse">▌</div>
      </div>
    </div>
  );
}
