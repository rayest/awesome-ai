"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import ParticleField from "./ParticleField";

export default function Hero() {
  const eyebrow = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const sub = useRef<HTMLParagraphElement>(null);
  const cta = useRef<HTMLDivElement>(null);
  const scroll = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    tl.from(eyebrow.current, { y: 18, opacity: 0, duration: 1 })
      .from(
        title.current?.querySelectorAll(".word") ?? [],
        { y: 80, opacity: 0, duration: 1.2, stagger: 0.08 },
        "-=0.6"
      )
      .from(sub.current, { y: 24, opacity: 0, duration: 1 }, "-=0.7")
      .from(cta.current?.children ?? [], { y: 24, opacity: 0, duration: 1, stagger: 0.08 }, "-=0.7")
      .from(scroll.current, { opacity: 0, y: -8, duration: 1 }, "-=0.4");

    // Idle floating on the title
    gsap.to(title.current, {
      y: 6,
      duration: 4,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
    });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <section
      ref={root}
      className="relative isolate min-h-[100svh] flex items-center justify-center overflow-hidden pt-32 pb-20"
    >
      {/* Background video layer — CSS-driven abstract animation (no asset 404) */}
      <div className="absolute inset-0 -z-30 overflow-hidden" aria-hidden>
        <div className="absolute inset-0 hero-bg-video opacity-80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,rgba(232,199,115,0.10),transparent_55%),radial-gradient(ellipse_at_70%_60%,rgba(74,158,255,0.06),transparent_55%)]" />
      </div>

      {/* Black overlay so background doesn't fight the text */}
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.5),rgba(0,0,0,0.95))]" />

      {/* WebGL particles */}
      <div className="absolute inset-0 -z-10">
        <ParticleField />
      </div>

      {/* Grid overlay (very subtle) */}
      <div className="absolute inset-0 -z-10 grid-overlay opacity-40" aria-hidden />

      {/* Content */}
      <div className="relative mx-auto max-w-[1280px] px-6 text-center">
        <div
          ref={eyebrow}
          className="inline-flex items-center gap-3 px-3.5 py-1.5 mb-8 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md text-[12px] text-[var(--color-bone-dim)]"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--color-gold)] opacity-75 animate-ping" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-gold)]" />
          </span>
          <span className="font-mono tracking-tight">13,247 AI teams ship daily with Auron</span>
        </div>

        <h1
          ref={title}
          className="font-display tracking-[-0.04em] font-medium text-balance leading-[0.92] text-[clamp(64px,11vw,168px)]"
        >
          <span className="block overflow-hidden">
            <span className="word inline-block">Autonomous</span>{" "}
            <span className="word inline-block italic font-serif font-normal">intelligence.</span>
          </span>
          <span className="block overflow-hidden">
            <span className="word inline-block">Built for </span>
            <span className="word inline-block text-[var(--color-gold)] glow-gold">scale.</span>
          </span>
        </h1>

        <p
          ref={sub}
          className="mt-10 mx-auto max-w-[640px] text-[19px] leading-[1.55] text-[var(--color-bone-dim)] text-pretty"
        >
          Auron is the agent runtime where production AI happens. Build autonomous workflows in
          seconds, deploy to 38 regions, watch your team ship 10× faster — without a platform team.
        </p>

        <div ref={cta} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="#cta"
            className="group relative inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[var(--color-bone)] text-[var(--color-void)] font-medium text-[15px] overflow-hidden"
          >
            <span className="relative z-10">Start building free</span>
            <svg className="relative z-10 transition-transform group-hover:translate-x-0.5" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10m-4-4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="absolute inset-0 bg-[var(--color-gold)] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(.5,0,.2,1)]" />
          </a>
          <a
            href="#demo"
            className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-white/12 text-[var(--color-bone)] font-medium text-[15px] hover:border-white/25 transition-colors"
          >
            <span className="w-7 h-7 rounded-full bg-[var(--color-gold)]/15 border border-[var(--color-gold)]/30 flex items-center justify-center">
              <svg width="9" height="11" viewBox="0 0 9 11" fill="none" className="ml-0.5">
                <path d="M0 0l9 5.5L0 11V0z" fill="var(--color-gold)" />
              </svg>
            </span>
            Watch the 90-sec tour
          </a>
        </div>

        <div
          ref={scroll}
          className="mt-20 flex flex-col items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-[var(--color-bone-mute)] font-mono"
        >
          <span>scroll to explore</span>
          <span className="block w-px h-10 bg-gradient-to-b from-[var(--color-bone-mute)] to-transparent" />
        </div>
      </div>
    </section>
  );
}
