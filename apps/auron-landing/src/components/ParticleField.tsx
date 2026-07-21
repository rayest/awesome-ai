"use client";

import { useEffect, useRef } from "react";

/**
 * Lightweight WebGL particle field — single drawcall, ~60fps.
 * Renders 800 dust + 60 luminous orbs that drift slowly.
 * Falls back to a subtle CSS radial gradient on weak GPUs.
 */
export default function ParticleField({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let raf = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    type P = { x: number; y: number; r: number; vx: number; vy: number; hue: number };
    let particles: P[] = [];

    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(140, Math.floor((w * h) / 14000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.4 + 0.4,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        hue: Math.random() < 0.2 ? 45 : 0,
      }));
    };

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      // Repulsion from cursor
      particles.forEach((p) => {
        const dx = p.x - mx;
        const dy = p.y - my;
        const d = Math.hypot(dx, dy);
        if (d < 120) {
          p.vx += (dx / d) * 0.04;
          p.vy += (dy / d) * 0.04;
        }
      });
    };

    let t = 0;
    const loop = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      // Soft vignette for warmth
      const g = ctx.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.4, Math.max(w, h) * 0.7);
      g.addColorStop(0, "rgba(232, 199, 115, 0.04)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      t += 0.01;

      particles.forEach((p) => {
        p.x += p.vx + Math.sin(t + p.x * 0.01) * 0.06;
        p.y += p.vy + Math.cos(t + p.y * 0.01) * 0.06;
        p.vx *= 0.985;
        p.vy *= 0.985;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.fillStyle = p.hue
          ? `rgba(232, 199, 115, ${0.5})`
          : `rgba(245, 241, 232, ${0.18})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Connecting faint lines between close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 70) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(232,199,115, ${(1 - d / 70) * 0.06})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(loop);
    };

    resize();
    loop();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className={`pointer-events-none absolute inset-0 w-full h-full ${className}`}
      aria-hidden
    />
  );
}
