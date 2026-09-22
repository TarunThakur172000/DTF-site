"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = ((current + 1) / total) * 100;

  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-xs font-semibold tracking-[0.12em] uppercase text-accent-600">
          Step {current + 1} of {total}
        </span>
      </div>
      <div
        className="h-1.5 w-full rounded-full bg-primary-50 overflow-hidden"
        role="progressbar"
        aria-valuenow={current + 1}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`Step ${current + 1} of ${total}`}
      >
        <motion.div
          className="h-full rounded-full bg-accent-600"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
        />
      </div>
    </div>
  );
}
