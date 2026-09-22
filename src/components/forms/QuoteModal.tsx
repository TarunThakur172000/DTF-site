"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle } from "lucide-react";
import { QuoteForm } from "./QuoteForm";
import type { QuoteModalProps } from "../../hooks/types";

export default function QuoteModal({ isOpen, onClose }: QuoteModalProps) {
  const [isSuccess, setIsSuccess] = useState(false);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      // Reset success state after closing
      setTimeout(() => setIsSuccess(false), 300);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#161616]/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex max-h-[95vh] sm:max-h-[90vh] w-full max-w-[900px] flex-col overflow-hidden rounded-2xl sm:rounded-3xl bg-white shadow-2xl ring-1 ring-[#E5E7EB]/50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#E5E7EB] bg-white/95 px-4 py-4 sm:px-8 sm:py-6 backdrop-blur-md">
              <div>
                <h2 id="modal-title" className="text-xl sm:text-2xl font-bold tracking-tight text-[#161616]">
                  Request a Free Quote
                </h2>
                <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-[#6B7280]">
                  Tell us about your project and we&apos;ll prepare a personalized quotation within 2 business hours.
                </p>
              </div>
              <button
                onClick={onClose}
                className="shrink-0 rounded-full p-2 text-[#6B7280] transition-colors hover:bg-gray-100 hover:text-[#161616] focus:outline-none focus:ring-2 focus:ring-[#56C21C]"
                aria-label="Close modal"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>

            {/* Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <AnimatePresence mode="wait">
                {!isSuccess ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <QuoteForm onSuccess={() => setIsSuccess(true)} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-12 px-4 sm:py-20 sm:px-6 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 15, delay: 0.1 }}
                    >
                      <CheckCircle className="mb-4 sm:mb-6 h-16 w-16 sm:h-24 sm:w-24 text-[#56C21C]" />
                    </motion.div>
                    <h3 className="mb-2 text-2xl sm:text-3xl font-bold text-[#161616]">
                      Quote Request Submitted!
                    </h3>
                    <p className="mb-6 sm:mb-8 max-w-md text-sm sm:text-base text-[#6B7280]">
                      Thank you for contacting PrintPressRepeat. We&apos;ll review your files and send you a personalized quotation within 2 business hours.
                    </p>

                    {/* Action Buttons (Stacked on mobile, side-by-side on desktop) */}
                    <div className="flex w-full sm:w-auto flex-col-reverse sm:flex-row gap-3 sm:gap-4">
                      <button
                        onClick={onClose}
                        className="w-full sm:w-auto rounded-xl border border-[#E5E7EB] bg-white px-6 py-3 font-medium text-[#161616] transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => setIsSuccess(false)}
                        className="w-full sm:w-auto rounded-xl bg-[#161616] px-6 py-3 font-medium text-white transition-colors hover:bg-black focus:outline-none focus:ring-2 focus:ring-gray-800"
                      >
                        Submit Another Request
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
