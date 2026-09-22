"use client";

import { useState } from "react";
import { Button } from "../ui/Button";
import { Reveal } from "../ui/Reveal";
import QuoteModal from "../forms/QuoteModal";

export function CtaBanner() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <section className="container-px pb-20 md:pb-28">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-primary-900 px-8 py-16 md:py-20 text-center">
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
            aria-hidden="true"
          />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Let&apos;s Bring Your Ideas to Life
            </h2>

            <p className="mt-4 text-primary-100 max-w-2xl mx-auto">
              Whether you need premium DTF transfers, UV DTF stickers, sublimation transfers, or custom printing, our team is ready to deliver exceptional quality, fast turnaround, and service you can count on.
            </p>

            <div className="mt-8">
              <Button
                size="lg"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2"
              >
                Get a Quote
              </Button>
            </div>
          </div>
        </div>
      </Reveal>

      <QuoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
}
