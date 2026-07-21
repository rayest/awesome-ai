"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    id: "autonomy",
    label: "Autonomous Workflows",
    headline: "Agents that finish the job.",
    body: "Auron agents reason, plan, retry, and verify themselves. Hand them a goal, not a script. They ship.",
    visual: <NeuralArt />,
  },
  {
    id: "collab",
    label: "Real-Time Collaboration",
    headline: "A room full of humans + AI.",
    body: "Multiple cursors, shared reasoning, instant replay. Build with your team and your agents in the same canvas.",
    visual: <CollabArt />,
  },
  {
    id: "security",
    label: "Enterprise Security",
    headline: "Built for the audit trail you actually need.",
    body: "SOC 2 Type II, ISO 27001, HIPAA-ready. Every decision encrypted, signed, replayable. Air-gapped deploys available.",
    visual: <ShieldArt />,
  },
  {
    id: "edge",
    label: "Global Edge Deploy",
    headline: "38 regions. 12 ms. One push.",
    body: "Deploy your agents to the closest human on earth. Lenis-fast replication, automatic canaries, zero-downtime rollbacks.",
    visual: <GlobeArt />,
  },
];

export default function Features() {
  const [active, setActive] = useState(0);
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(root.current?.querySelectorAll("[data-feat-reveal]") ?? [], {
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 1,
        ease: "expo.out",
        scrollTrigger: { trigger: root.current, start: "top 70%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="features" ref={root} className="relative py-32">
      <div className="mx-auto max-w-[1280px] px-6">
        <div data-feat-reveal className="max-w-[760px] mb-16">
          <p className="text-[11px] uppercase tracking-[0.3em] font-mono text-[var(--color-gold)] mb-4">
            — what ships inside
          </p>
          <h2 className="font-display text-[clamp(40px,6vw,80px)] tracking-[-0.03em] font-medium leading-[0.95] text-balance">
            Everything your AI team <span className="italic font-serif font-normal text-[var(--color-bone-mute)]">won&apos;t</span> have to build.
          </h2>
        </div>

        <div
          data-feat-reveal
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6"
          onMouseLeave={() => setActive(0)}
        >
          {features.map((f, i) => (
            <article
              key={f.id}
              onMouseEnter={() => setActive(i)}
              className={[
                "group relative overflow-hidden rounded-2xl border p-8 lg:p-10 transition-all duration-700 ease-out min-h-[360px] flex flex-col justify-between",
                active === i
                  ? "border-[var(--color-gold)]/40 bg-gradient-to-br from-[var(--color-gold)]/[0.06] to-transparent shadow-[0_0_80px_rgba(232,199,115,0.1)]"
                  : "border-white/[0.08] bg-[var(--color-obsidian)]",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.25em] font-mono text-[var(--color-gold)] mb-3">
                    0{i + 1}
                  </p>
                  <h3 className="font-display text-2xl md:text-3xl font-medium tracking-tight leading-[1.1]">
                    {f.headline}
                  </h3>
                </div>
                <div className="flex-shrink-0 w-20 h-20 lg:w-28 lg:h-28 relative opacity-90 group-hover:opacity-100 transition-opacity">
                  {f.visual}
                </div>
              </div>

              <p
                className={[
                  "mt-10 text-[var(--color-bone-dim)] text-[15px] leading-relaxed transition-all duration-500 max-w-[460px]",
                  active === i ? "opacity-100 translate-y-0" : "opacity-70 translate-y-0",
                ].join(" ")}
              >
                {f.body}
              </p>

              <div className="mt-6 flex items-center justify-between text-[12px]">
                <span className="font-mono text-[var(--color-bone-mute)] uppercase tracking-wider">
                  {f.label}
                </span>
                <span
                  className={[
                    "inline-flex items-center gap-1 text-[var(--color-gold)] transition-all",
                    active === i ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-1",
                  ].join(" ")}
                >
                  Learn more →
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* === Visual artworks === */

function NeuralArt() {
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full">
      <defs>
        <radialGradient id="ng" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e8c773" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#e8c773" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="48" fill="url(#ng)" opacity="0.4" />
      {[
        [60, 18], [30, 42], [90, 42], [22, 76], [98, 76], [60, 102], [60, 60],
      ].map(([x, y], i, a) => (
        <g key={i}>
          {a.slice(i + 1).map(([x2, y2], j) => (
            <line
              key={j}
              x1={x} y1={y} x2={x2} y2={y2}
              stroke="#e8c773"
              strokeOpacity={0.18 + Math.random() * 0.3}
              strokeWidth="0.4"
            />
          ))}
        </g>
      ))}
      {[
        [60, 18], [30, 42], [90, 42], [22, 76], [98, 76], [60, 102], [60, 60],
      ].map(([x, y], i) => (
        <circle
          key={i}
          cx={x} cy={y}
          r={i === 6 ? 3 : 1.5}
          fill={i === 6 ? "#e8c773" : "#f5f1e8"}
        />
      ))}
    </svg>
  );
}

function CollabArt() {
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full">
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <circle
            cx={20 + i * 35}
            cy={40 + (i % 2) * 30}
            r="5"
            fill={["#e8c773", "#4a9eff", "#f5f1e8"][i]}
            opacity="0.95"
          />
          <text x={28 + i * 35} y={44 + (i % 2) * 30} fontSize="6" fill="#c9c5b8" fontFamily="monospace">
            {["kira.dev", "jules", "auron"][i]}
          </text>
          <path
            d={`M${25 + i * 35} ${45 + (i % 2) * 30} q ${10 + i * 5} ${5 + i * 4} ${30 + i * 3} ${10}`}
            stroke={["#e8c773", "#4a9eff", "#f5f1e8"][i]}
            strokeWidth="0.6"
            fill="none"
            opacity="0.5"
          />
        </g>
      ))}
      <rect x="14" y="86" width="92" height="2" fill="#e8c773" opacity="0.3" />
    </svg>
  );
}

function ShieldArt() {
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full">
      <g style={{ transformOrigin: "60px 60px", animation: "spin 12s linear infinite" }}>
        <circle cx="60" cy="60" r="40" fill="none" stroke="#e8c773" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.5" />
        <circle cx="60" cy="60" r="30" fill="none" stroke="#e8c773" strokeWidth="0.5" strokeDasharray="3 6" opacity="0.7" />
      </g>
      <path
        d="M60 32 L82 44 V62 C82 76 72 86 60 90 C48 86 38 76 38 62 V44 Z"
        fill="rgba(232,199,115,0.1)"
        stroke="#e8c773"
        strokeWidth="1"
      />
      <path d="M50 60 L57 67 L72 50" stroke="#e8c773" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <style>{`@keyframes spin { from { transform: rotate(0) } to { transform: rotate(360deg) } }`}</style>
    </svg>
  );
}

function GlobeArt() {
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full">
      <defs>
        <radialGradient id="gg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e8c773" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#e8c773" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="45" fill="url(#gg)" />
      <ellipse cx="60" cy="60" rx="45" ry="18" fill="none" stroke="#e8c773" strokeWidth="0.5" opacity="0.6" />
      <ellipse cx="60" cy="60" rx="45" ry="30" fill="none" stroke="#e8c773" strokeWidth="0.5" opacity="0.4" />
      <ellipse cx="60" cy="60" rx="20" ry="45" fill="none" stroke="#f5f1e8" strokeWidth="0.5" opacity="0.5" />
      <circle cx="60" cy="60" r="45" fill="none" stroke="#f5f1e8" strokeWidth="0.7" opacity="0.7" />
      <circle cx="60" cy="60" r="2" fill="#e8c773">
        <animate attributeName="r" values="2;4;2" dur="2s" repeatCount="indefinite" />
      </circle>
      {/* Pulsing nodes */}
      {[
        [22, 50], [98, 50], [60, 22], [60, 98], [35, 28], [85, 85],
      ].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="6" fill="#e8c773" opacity="0.15">
            <animate attributeName="r" values="2;8;2" dur={`${2 + (i % 3)}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0;0.5" dur={`${2 + (i % 3)}s`} repeatCount="indefinite" />
          </circle>
          <circle cx={x} cy={y} r="1.5" fill="#e8c773" />
        </g>
      ))}
    </svg>
  );
}
