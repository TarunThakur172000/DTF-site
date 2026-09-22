"use client";

import { motion } from "framer-motion";
import { Button, LinkButton } from "../ui/Button";
import QuoteModal from "../forms/QuoteModal";
import { useState } from "react";

const heroimg = "/images/herosection.png";

export function Hero() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <section className="relative overflow-hidden bg-surfaceMuted">
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(37,99,235,0.18) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
        aria-hidden="true"
      />
      <div className="container-px relative grid lg:grid-cols-2 gap-12 items-center pt-16 pb-20 md:pt-24 md:pb-28">
        <div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]"
          >
            Custom printing
               <br />
                Built for

            <br />
            <span className="text-accent-600">Growing Brands.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg text-primary-400 max-w-lg"
          >
           From premium DTF transfers and UV DTF stickers to custom apparel and promotional products, we help brands, print shops, schools, and businesses produce high-quality products with fast turnaround and dependable service.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-wrap gap-4"
          >
            <Button
              size="lg"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2"
            >
              Get a Quote
            </Button>

            <QuoteModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            />
            <LinkButton to="/promotional-products" size="lg" variant="secondary">Browse Products</LinkButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10 flex items-center gap-8"
          >
            <Stat value={12000} suffix="+" label="Orders shipped" />
            <Stat value={4.9} suffix="/5" label="Average rating" decimals />
            <Stat value={3} suffix=" days" label="Avg. turnaround" />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative"
        >
          <div className="rounded-3xl overflow-hidden shadow-lift">
            <img
              src={heroimg}
              alt="Stack of freshly printed custom apparel and marketing materials"
              className="w-full h-[420px] object-cover"
              loading="eager"
            />
          </div>
          <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-lift p-4 flex items-center gap-3 border border-primary-50">
            <span className="w-2.5 h-2.5 rounded-full bg-success-600 animate-pulse" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-primary-900">Order #4821 shipped</p>
              <p className="text-xs text-primary-400">200 DTF transfers — 2 days</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Stat({ value, suffix = "", label, decimals = false }: { value: number; suffix?: string; label: string; decimals?: boolean }) {
  return (
    <div>
      <p className="text-2xl font-display font-bold text-primary-900">
        {decimals ? value.toFixed(1) : value.toLocaleString()}
        {suffix}
      </p>
      <p className="text-xs text-primary-400 mt-0.5">{label}</p>
    </div>
  );
}
