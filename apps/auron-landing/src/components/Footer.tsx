"use client";

import { useState } from "react";

const cols = [
  {
    title: "Product",
    links: ["Agents", "Workflows", "Edge", "Observability", "Pricing", "Changelog"],
  },
  {
    title: "Resources",
    links: ["Docs", "API Reference", "Templates", "Status", "Security", "Trust"],
  },
  {
    title: "Company",
    links: ["About", "Careers", "Press", "Manifesto", "Partners", "Contact"],
  },
  {
    title: "Legal",
    links: ["Privacy", "Terms", "DPA", "Subprocessors", "Cookies", "License"],
  },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <footer id="cta" className="relative pt-32 pb-12 border-t border-white/[0.06] grain overflow-hidden">
      {/* Big CTA */}
      <div className="mx-auto max-w-[1280px] px-6 text-center mb-24">
        <p className="text-[11px] uppercase tracking-[0.3em] font-mono text-[var(--color-gold)] mb-4">
          — get started
        </p>
        <h2 className="font-display text-[clamp(48px,8vw,128px)] tracking-[-0.04em] font-medium leading-[0.92] text-balance">
          Ship your first <br />
          <span className="italic font-serif font-normal text-[var(--color-bone-mute)]">autonomous</span>{" "}
          workflow today.
        </h2>
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="#"
            className="group relative inline-flex items-center gap-2 px-7 py-4 rounded-full bg-[var(--color-bone)] text-[var(--color-void)] font-medium overflow-hidden"
          >
            <span className="relative z-10">Start free — no card required</span>
            <span className="absolute inset-0 bg-[var(--color-gold)] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(.5,0,.2,1)]" />
          </a>
          <a
            href="#"
            className="px-7 py-4 rounded-full border border-white/12 text-[var(--color-bone)] hover:border-white/30 transition-colors"
          >
            Book a 15-min demo →
          </a>
        </div>
      </div>

      {/* Newsletter bar */}
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="rounded-2xl border border-white/[0.06] bg-[var(--color-obsidian)] p-6 lg:p-8 mb-16 flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-10">
          <div className="flex-1">
            <p className="font-display text-xl tracking-tight">The Auron dispatch.</p>
            <p className="text-sm text-[var(--color-bone-mute)] mt-1">
              Monthly field notes from the team. No fluff, no sales drip.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="flex-1 w-full flex items-center gap-2"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@auron.ai"
              className="flex-1 bg-transparent border border-white/12 rounded-full px-5 py-3 text-sm placeholder:text-[var(--color-bone-mute)] focus:outline-none focus:border-[var(--color-gold)] transition-colors"
            />
            <button
              type="submit"
              className="px-5 py-3 rounded-full bg-[var(--color-gold)] text-[var(--color-void)] text-sm font-medium hover:shadow-[0_0_24px_rgba(232,199,115,0.4)] transition-shadow"
            >
              {sent ? "Subscribed ✓" : "Subscribe"}
            </button>
          </form>
        </div>

        {/* Columns */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 pb-12 border-b border-white/[0.05]">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <LogoMark />
              <span className="font-display text-lg font-medium">Auron</span>
            </div>
            <p className="text-sm text-[var(--color-bone-mute)] max-w-[240px] leading-relaxed">
              The autonomous agent runtime. Made by humans, for the teams building the next decade.
            </p>
          </div>

          {cols.map((c) => (
            <div key={c.title}>
              <p className="text-[11px] uppercase tracking-[0.2em] font-mono text-[var(--color-gold)] mb-4">
                {c.title}
              </p>
              <ul className="space-y-2.5 text-sm">
                {c.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-[var(--color-bone-dim)] hover:text-[var(--color-bone)] transition-colors"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[var(--color-bone-mute)] font-mono">
          <p>© 2026 Auron Labs · Made with intent.</p>
          <div className="flex items-center gap-6">
            <SocialIcon name="x" />
            <SocialIcon name="github" />
            <SocialIcon name="linkedin" />
          </div>
        </div>
      </div>
    </footer>
  );
}

function LogoMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
      <path d="M11 1.5l9.5 9.5-9.5 9.5L1.5 11 11 1.5z" stroke="var(--color-gold)" strokeWidth="1.4" fill="none" />
      <circle cx="11" cy="11" r="3.2" fill="var(--color-gold)" />
    </svg>
  );
}

function SocialIcon({ name }: { name: "x" | "github" | "linkedin" }) {
  return (
    <a
      href="#"
      aria-label={name}
      className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-[var(--color-bone-mute)] hover:text-[var(--color-bone)] hover:border-white/30 transition-colors"
    >
      {name === "x" && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2H21l-6.6 7.54L22 22h-6.5l-4.8-6.3L4.8 22H2l7-8L1.5 2h6.6l4.4 5.85L18.244 2z" />
        </svg>
      )}
      {name === "github" && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
      )}
      {name === "linkedin" && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14zM8.34 18.337v-7.58H5.667v7.58h2.673zM7.003 9.51a1.548 1.548 0 11-.002-3.096 1.548 1.548 0 01.002 3.096zM18.337 18.337v-4.164c0-2.279-1.243-2.815-2.097-2.815-1.084 0-1.726.74-1.726 1.91v5.07h-2.667v-7.58h2.604v1.04h.036c.408-.717 1.213-1.291 2.324-1.291 1.59 0 2.726 1.04 2.726 3.236v4.595z" />
        </svg>
      )}
    </a>
  );
}
