"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import {
  ShadowLayer,
  GlowLayer,
  HeatPressBase,
  HeatPressLid,
  PressureHandle,
  ShirtBlank,
  ShirtFinished,
  DtfTransferSheet,
  SteamLayer,
  SparklesLayer,
  DigitalDisplay,
  FanIcon,
} from "./sceneLayers";

interface AnimationSceneProps {
  activeStep: number;
}

type DisplayMode = "count-up" | "count-down" | "static" | "hidden";

interface DisplayConfig {
  mode: DisplayMode;
  label: string;
  from?: number;
  to?: number;
  unit: string;
  glow: boolean;
}

const DISPLAY_BY_STEP: DisplayConfig[] = [
  { mode: "count-up", label: "Temp", from: 295, to: 330, unit: "°F", glow: true },
  { mode: "static", label: "Pressure", unit: "", glow: false },
  { mode: "static", label: "Temp", unit: "°F", glow: false },
  { mode: "static", label: "Temp", unit: "°F", glow: false },
  { mode: "count-down", label: "Press", from: 15, to: 0, unit: "s", glow: true },
  { mode: "static", label: "Status", unit: "", glow: false },
  { mode: "hidden", label: "", unit: "", glow: false },
  { mode: "count-down", label: "Final", from: 5, to: 0, unit: "s", glow: true },
];

/**
 * Large interactive animation area. All visual "layers" are absolutely positioned
 * inside a fixed-ratio stage, matching the layered-PNG architecture from the spec —
 * see sceneLayers.tsx for what would be swapped for real photography.
 */
export function AnimationScene({ activeStep }: AnimationSceneProps) {
  const [displayValue, setDisplayValue] = useState("295");
  const timerRef = useRef<number | null>(null);

  const config = DISPLAY_BY_STEP[activeStep];
  const lidClosed = activeStep === 4 || activeStep === 7;
  const shirtSettled = activeStep >= 2 && activeStep <= 6;
  const transferStage: "hidden" | "placed" | "peeling" =
    activeStep >= 3 && activeStep <= 5 ? "placed" : activeStep === 6 ? "peeling" : "hidden";
  const finishedVisible = activeStep >= 6;
  const steamVisible = activeStep === 2 || activeStep === 5;
  const steamTone = activeStep === 5 ? "blue" : "white";
  const sparklesVisible = activeStep === 6 || activeStep === 7;
  const fanSpinning = activeStep === 5;
  const pressureHigh = activeStep >= 1;
  const showFinalBadge = activeStep === 7;

  const glowOpacity = activeStep === 4 ? 0.45 : activeStep === 5 ? 0.3 : activeStep <= 3 ? 0.18 : 0.12;
  const glowColor = activeStep === 5 ? "#3bf673" : activeStep === 4 ? "#3bf673" : "#3bf673";

  // Drives the digital readout counting up/down whenever the step changes.
  useEffect(() => {
    if (timerRef.current) window.clearInterval(timerRef.current);

    if (config.mode === "static") {
      setDisplayValue(activeStep === 1 ? "HIGH" : "330");
      return;
    }
    if (config.mode === "hidden") return;

    const from = config.from ?? 0;
    const to = config.to ?? 0;
    const steps = Math.abs(to - from);
    const stepDuration = Math.max(45, 650 / Math.max(steps, 1));
    let current = from;
    setDisplayValue(String(current));

    timerRef.current = window.setInterval(() => {
      current += to > from ? 1 : -1;
      setDisplayValue(String(current));
      if (current === to && timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    }, stepDuration);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep]);

  return (
    <div className="relative">
      <motion.div
        className="relative mx-auto w-full max-w-[800px] aspect-[800/700] rounded-3xl bg-gradient-to-b from-surfaceMuted to-white overflow-hidden border border-primary-50"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 30%, rgba(37,99,235,0.06), transparent 60%)",
        }}
      >
        {/* Idle floating rig — every layer rides on this for the slow 2-3px float */}
        <motion.div
          className="absolute inset-0"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div
            className="absolute inset-0"
            animate={activeStep === 4 ? { x: [0, -1.5, 1.5, -1, 1, 0] } : { x: 0 }}
            transition={activeStep === 4 ? { duration: 0.5, repeat: Infinity, ease: "easeInOut" } : {}}
          >
            <ShadowLayer />
            <GlowLayer opacity={glowOpacity} color={glowColor} />
            <HeatPressBase />
            <ShirtBlank settled={shirtSettled} />
            <DtfTransferSheet stage={transferStage} />
            <ShirtFinished visible={finishedVisible} />
            <SteamLayer visible={steamVisible} tone={steamTone as "white" | "blue"} />
            <SparklesLayer visible={sparklesVisible} />
            <HeatPressLid closed={lidClosed} />
            <PressureHandle high={pressureHigh} />
            <FanIcon spinning={fanSpinning} />
          </motion.div>
        </motion.div>

        {config.mode !== "hidden" && (
          <DigitalDisplay
            value={config.mode === "static" ? displayValue : `${displayValue}${config.unit}`}
            glow={config.glow}
            label={config.label}
          />
        )}

        <AnimatePresence>
          {showFinalBadge && displayValue === "0" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute inset-x-0 bottom-[10%] flex flex-col items-center gap-2"
            >
              <span className="flex items-center justify-center w-11 h-11 rounded-full bg-success-50 text-success-600">
                <CheckCircle2 size={24} />
              </span>
              <span className="font-display font-semibold text-primary-900">Ready to Wear</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
