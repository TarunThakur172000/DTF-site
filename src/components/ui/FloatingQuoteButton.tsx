"use client";

import { motion } from "framer-motion";
import ChatWidget from "../chats/ChatWidget";

export function FloatingQuoteButton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 }}
      className="fixed bottom-6 right-6 z-40 hidden md:block"
    >
      <ChatWidget />
    </motion.div>
  );
}
