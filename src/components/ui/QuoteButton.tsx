"use client";

import { useState, type ButtonHTMLAttributes } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import QuoteModal from "../forms/QuoteModal";

export interface QuoteButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export default function QuoteButton({
  text = "Get a Free Quote",
  size = "md",
  fullWidth = false,
  className = "",
  ...props
}: QuoteButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Size variations
  const sizeClasses = {
    sm: "px-5 py-2.5 text-sm gap-1.5 rounded-lg",
    md: "px-8 py-4 text-base gap-2 rounded-xl",
    lg: "px-10 py-5 text-lg gap-3 rounded-2xl",
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsModalOpen(true)}
        className={`
          group relative inline-flex items-center justify-center font-semibold text-white
          bg-gradient-to-r from-[#56C21C] to-[#45a315]
          shadow-[0_8px_30px_rgb(86,194,28,0.3)] hover:shadow-[0_8px_30px_rgb(86,194,28,0.5)]
          transition-all duration-200 overflow-hidden
          focus:outline-none focus:ring-2 focus:ring-[#56C21C] focus:ring-offset-2
          ${sizeClasses[size]}
          ${fullWidth ? "w-full" : ""}
          ${className}
        `}
        {...(props as React.ComponentPropsWithoutRef<typeof motion.button>)}
      >
        <span>{text}</span>
        <ArrowRight
          className={`
            transition-transform duration-200 group-hover:translate-x-1
            ${size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5"}
          `}
        />
      </motion.button>

      <QuoteModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
