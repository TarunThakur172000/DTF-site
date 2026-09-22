"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import type { ReactNode } from "react";

export default function Template({ children }: { children: ReactNode }) {
  // A fresh instance of this component mounts on every navigation,
  // so this recreates the old ScrollToTop + PageTransition behavior.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
