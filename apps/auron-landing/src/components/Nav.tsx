"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { label: "Product", href: "#features" },
  { label: "Customers", href: "#customers" },
  { label: "Pricing", href: "#pricing" },
  { label: "Docs", href: "#faq" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        "fixed top-0 inset-x-0 z-50 transition-all duration-500",
        scrolled ? "py-3" : "py-6",
      ].join(" ")}
    >
      <div
        className={[
          "mx-auto max-w-[1280px] flex items-center justify-between px-6",
          scrolled
            ? "rounded-full border border-white/[0.06] bg-black/55 backdrop-blur-xl backdrop-saturate-150 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]"
            : "rounded-full",
        ].join(" ")}
        style={{ transition: "background-color 500ms, border-color 500ms, border-radius 500ms" }}
      >
        <a href="#" className="flex items-center gap-2 group">
          <LogoMark />
          <span className="font-display text-[15px] font-medium tracking-tight">Auron</span>
        </a>

        <nav className="hidden md:flex items-center gap-1 text-sm">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="px-3.5 py-2 rounded-full text-[var(--color-bone-dim)] hover:text-[var(--color-bone)] hover:bg-white/[0.04] transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <a href="#" className="px-3.5 py-2 text-sm text-[var(--color-bone-dim)] hover:text-[var(--color-bone)] transition-colors">
            Sign in
          </a>
          <a
            href="#cta"
            className="group relative px-4 py-2 text-sm font-medium rounded-full bg-[var(--color-bone)] text-[var(--color-void)] overflow-hidden"
          >
            <span className="relative z-10">Start free</span>
            <span className="absolute inset-0 bg-[var(--color-gold)] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(.5,0,.2,1)]" />
          </a>
        </div>

        <button
          aria-label="menu"
          onClick={() => setOpen((s) => !s)}
          className="md:hidden w-9 h-9 rounded-full border border-white/10 flex items-center justify-center"
        >
          <div className="space-y-1">
            <span className="block w-4 h-px bg-bone" />
            <span className="block w-4 h-px bg-bone" />
          </div>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden mx-6 mt-2 rounded-2xl border border-white/[0.06] bg-black/85 backdrop-blur-xl p-4"
          >
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="block px-3 py-3 text-sm rounded-lg hover:bg-white/5"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function LogoMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
      <path
        d="M11 1.5l9.5 9.5-9.5 9.5L1.5 11 11 1.5z"
        stroke="var(--color-gold)"
        strokeWidth="1.4"
        fill="none"
      />
      <circle cx="11" cy="11" r="3.2" fill="var(--color-gold)" />
    </svg>
  );
}
