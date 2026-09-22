"use client";

import { motion } from "framer-motion";

/**
 * Illustrated stand-ins for the layered PNG assets referenced in the spec
 * (heatpress-top.png, heatpress-bottom.png, shirt-blank.png, dtf-transfer.png,
 * shirt-finished.png, steam.png, glow.png, shadow.png).
 *
 * Each layer below is its own small component so a real photographed PNG can
 * be dropped in later by swapping the JSX body for an <img src="/dtf-guide/xxx.png" />
 * — the absolute positioning, sizing and animation wrapper stay identical.
 */

export function ShadowLayer() {
  return (
    <div
      data-layer="shadow"
      className="absolute left-1/2 bottom-[6%] -translate-x-1/2 w-[68%] h-10 rounded-full bg-primary-900/15 blur-2xl"
    />
  );
}

export function GlowLayer({ opacity, color = "#3bf673" }: { opacity: number; color?: string }) {
  return (
    <motion.div
      data-layer="glow"
      className="absolute left-1/2 top-[38%] -translate-x-1/2 w-[60%] h-[45%] rounded-full blur-3xl pointer-events-none"
      style={{ backgroundColor: color }}
      animate={{ opacity }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
    />
  );
}

export function HeatPressBase() {
  return (
    <div data-layer="heatpress-bottom" className="absolute left-1/2 bottom-[10%] -translate-x-1/2 w-[62%]">
      <div className="h-6 rounded-2xl bg-gradient-to-b from-primary-600 to-primary-900 shadow-lift" />
      <div className="mx-auto w-[88%] h-4 -mt-1 rounded-xl bg-primary-100/70" />
    </div>
  );
}

/** The hinged top platen — rotates down around its top edge like a real heat press lid. */
export function HeatPressLid({ closed }: { closed: boolean }) {
  return (
    <div
      data-layer="heatpress-top"
      className="absolute left-1/2 top-[16%] -translate-x-1/2 w-[62%]"
      style={{ perspective: 900 }}
    >
      <motion.div
        className="origin-top w-full"
        animate={{ rotateX: closed ? 0 : -34 }}
        transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
      >
        <div className="h-8 rounded-2xl bg-gradient-to-b from-primary-900 to-primary-600 shadow-lift" />
        <div className="mx-auto w-[70%] h-3 rounded-b-xl bg-primary-900/60" />
      </motion.div>
    </div>
  );
}

export function PressureHandle({ high }: { high: boolean }) {
  return (
    <motion.div
      data-layer="pressure-handle"
      className="absolute right-[10%] top-[20%] origin-left"
      animate={{ rotate: high ? 26 : 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 14 }}
    >
      <div className="w-10 h-1.5 rounded-full bg-accent-600" />
      <div className="w-2.5 h-2.5 -mt-2 rounded-full bg-accent-700" />
    </motion.div>
  );
}

export function ShirtBlank({ settled }: { settled: boolean }) {
  return (
    <motion.div
      data-layer="shirt-blank"
      className="absolute left-1/2 top-[46%] -translate-x-1/2 w-[46%]"
      initial={{ x: "-140%", opacity: 0 }}
      animate={{ x: settled ? "-50%" : "-140%", opacity: settled ? 1 : 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      style={{ position: "absolute" }}
    >
      <svg viewBox="0 0 200 170" className="w-full drop-shadow-md">
        <path
          d="M60 8 L80 0 L100 14 L120 0 L140 8 L172 34 L150 58 L138 50 L138 160 L62 160 L62 50 L50 58 L28 34 Z"
          fill="#0F172A"
        />
      </svg>
    </motion.div>
  );
}

export function ShirtFinished({ visible }: { visible: boolean }) {
  return (
    <motion.div
      data-layer="shirt-finished"
      className="absolute left-1/2 top-[46%] -translate-x-1/2 w-[46%]"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.96 }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
    >
      <svg viewBox="0 0 200 170" className="w-full drop-shadow-md">
        <path
          d="M60 8 L80 0 L100 14 L120 0 L140 8 L172 34 L150 58 L138 50 L138 160 L62 160 L62 50 L50 58 L28 34 Z"
          fill="#0F172A"
        />
        <rect x="76" y="60" width="48" height="48" rx="6" fill="#2563EB" opacity="0.9" />
        <path d="M84 84 L96 96 L118 70" stroke="#F8FAFC" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </motion.div>
  );
}

export function DtfTransferSheet({ stage }: { stage: "hidden" | "placed" | "peeling" }) {
  return (
    <motion.div
      data-layer="dtf-transfer"
      className="absolute left-1/2 top-[46%] -translate-x-1/2 w-[46%]"
      initial={{ opacity: 0, y: -14 }}
      animate={
        stage === "hidden"
          ? { opacity: 0, y: -14, rotate: 0 }
          : stage === "placed"
          ? { opacity: 0.85, y: 0, rotate: 0 }
          : { opacity: 0, y: -60, rotate: -14 }
      }
      transition={{ duration: stage === "peeling" ? 0.9 : 0.6, ease: "easeInOut" }}
    >
      <div className="w-full aspect-[200/170] rounded-md border border-white/40 bg-white/30 backdrop-blur-[1px]" />
    </motion.div>
  );
}

export function SteamLayer({ visible, tone = "white" }: { visible: boolean; tone?: "white" | "blue" }) {
  return (
    <motion.div
      data-layer="steam"
      className="absolute left-1/2 top-[32%] -translate-x-1/2 w-[40%] h-24 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? [0, 0.6, 0] : 0, y: visible ? [-4, -34] : 0 }}
      transition={{ duration: 1.8, ease: "easeOut", repeat: visible ? Infinity : 0 }}
    >
      <div
        className={`w-full h-full rounded-full blur-2xl ${tone === "blue" ? "bg-accent-400/50" : "bg-white/70"}`}
      />
    </motion.div>
  );
}

export function SparklesLayer({ visible }: { visible: boolean }) {
  const dots = [
    { x: "20%", y: "20%", d: 0 },
    { x: "78%", y: "16%", d: 0.15 },
    { x: "12%", y: "62%", d: 0.3 },
    { x: "84%", y: "58%", d: 0.45 },
    { x: "50%", y: "6%", d: 0.6 },
  ];
  return (
    <div data-layer="sparkles" className="absolute inset-0 pointer-events-none">
      {dots.map((dot, i) => (
        <motion.span
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-accent-400"
          style={{ left: dot.x, top: dot.y }}
          initial={{ opacity: 0, scale: 0 }}
          animate={visible ? { opacity: [0, 1, 0], scale: [0, 1.4, 0] } : { opacity: 0, scale: 0 }}
          transition={{ duration: 1.1, delay: dot.d, repeat: visible ? Infinity : 0, repeatDelay: 0.6 }}
        />
      ))}
    </div>
  );
}

export function DigitalDisplay({ value, glow = false, label }: { value: string; glow?: boolean; label: string }) {
  return (
    <div
      data-layer="digital-display"
      className="absolute right-[6%] top-[8%] flex flex-col items-center gap-1 rounded-xl bg-primary-900 px-4 py-2.5 shadow-lift"
    >
      <span className="text-[10px] uppercase tracking-widest text-primary-400">{label}</span>
      <motion.span
        className="font-mono text-xl font-semibold tabular-nums text-accent-400"
        animate={glow ? { textShadow: ["0 0 0px #2563EB", "0 0 12px #2563EB", "0 0 0px #2563EB"] } : {}}
        transition={{ duration: 1.6, repeat: glow ? Infinity : 0, ease: "easeInOut" }}
      >
        {value}
      </motion.span>
    </div>
  );
}

export function FanIcon({ spinning }: { spinning: boolean }) {
  return (
    <motion.div
      data-layer="fan"
      className="absolute left-[8%] top-[10%] w-7 h-7 rounded-full border-2 border-accent-400 flex items-center justify-center"
      animate={spinning ? { rotate: 360 } : { rotate: 0 }}
      transition={{ duration: 1.1, repeat: spinning ? Infinity : 0, ease: "linear" }}
    >
      <div className="w-3 h-0.5 bg-accent-400 rotate-45" />
      <div className="w-3 h-0.5 bg-accent-400 -rotate-45 -ml-3" />
    </motion.div>
  );
}
