"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { StepList } from "./StepList";
import { DTF_STEPS, DTF_STEP_COUNT } from "./dtfSteps";
import { Eyebrow } from "../ui/Eyebrow";

const instruction = "/video/instruction.mp4";

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const suppressObserver = useRef(false);

  // Store refs for each list item so the IntersectionObserver can track them
  const setStepRef = useCallback(
    (index: number) => (el: HTMLLIElement | null) => {
      stepRefs.current[index] = el;
    },
    []
  );

  // Handle clicking a step directly
  const goToStep = useCallback((index: number, scroll = true) => {
    const clamped = Math.max(0, Math.min(DTF_STEP_COUNT - 1, index));
    setActiveStep(clamped);
    
    if (scroll) {
      suppressObserver.current = true;
      stepRefs.current[clamped]?.scrollIntoView({ behavior: "smooth", block: "center" });
      
      // Re-enable scroll observer after the smooth scroll finishes
      window.setTimeout(() => {
        suppressObserver.current = false;
      }, 700);
    }
  }, []);

  // Scroll-linked activation: whichever step block is nearest the vertical center wins
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (suppressObserver.current) return;
        
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length === 0) return;
        
        const closest = visible.reduce((a, b) =>
          Math.abs(a.boundingClientRect.top) < Math.abs(b.boundingClientRect.top) ? a : b
        );
        
        const index = stepRefs.current.findIndex((el) => el === closest.target);
        if (index !== -1) setActiveStep(index);
      },
      { rootMargin: "-42% 0px -42% 0px", threshold: 0 } // Triggers near the middle of the viewport
    );

    stepRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Sync Video Timestamp with Active Step
  useEffect(() => {
    if (videoRef.current) {
      const targetTime = DTF_STEPS[activeStep]?.startTime || 0;
      videoRef.current.currentTime = targetTime;
      
      // Optional: Automatically play the video from that point
      // videoRef.current.play().catch(() => {});
    }
  }, [activeStep]);

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-start">
          
          {/* Right on desktop / First on mobile: Sticky Video Player */}
          <div className="order-1 lg:order-2 lg:sticky lg:top-32 rounded-2xl overflow-hidden shadow-2xl bg-gray-100 border border-gray-200">
            <video
              ref={videoRef}
              src={instruction} /* <--- REPLACE WITH YOUR VIDEO URL */
              className="w-full h-auto object-cover aspect-[4/3] lg:aspect-video"
              muted
              playsInline
              
            />
          </div>

          {/* Left on desktop / Second on mobile: Heading + Scrollable Step List */}
          <div className="order-2 lg:order-1">
            <Eyebrow>Application Guide</Eyebrow>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
              How to Apply DTF Transfers
            </h2>
            <p className="text-gray-500 text-lg md:text-xl max-w-lg mb-12">
              Scroll through the process or tap any step — the video on the
              right follows along to show you exactly how it's done.
            </p>

            {/* Added bottom padding so the user can scroll past the last item comfortably */}
            <div className="pb-48">
              <StepList
                steps={DTF_STEPS}
                activeStep={activeStep}
                onSelect={(index) => goToStep(index)}
                setStepRef={setStepRef}
              />
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}