"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

// Pre-defined Q&A tailored for PrintPressRepeat
const CHAT_OPTIONS = [
  {
    id: "turnaround",
    label: "What is your turnaround time?",
    response: "Our standard turnaround time for DTF transfers is 1-2 business days. Same-day printing is available for rush orders placed before 12 PM!",
  },
  {
    id: "moq",
    label: "Is there a minimum order quantity?",
    response: "We have NO minimum order quantity (MOQ)! Whether you need a single transfer for a sample or 10,000 for a large brand run, we have you covered.",
  },
  {
    id: "application",
    label: "How do I press the transfers?",
    response: "Press at 320°F (160°C) for 15 seconds with medium-heavy pressure. Wait until completely cool (Cold Peel), peel the film, and press again for 5 seconds with a Teflon sheet.",
  },
  {
    id: "bulk",
    label: "Do you offer bulk discounts?",
    response: "Yes! We offer tiered pricing for gang sheets and bulk orders. The more you buy, the more you save. You can request a custom quote for large projects.",
  },
];

type Message = {
  id: string;
  sender: "bot" | "user";
  text: string | ReactNode;
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "Hi there! 👋 Welcome to PrintPressRepeat. How can I help you today?",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleOptionClick = (option: (typeof CHAT_OPTIONS)[0]) => {
    // 1. Add User Message
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), sender: "user", text: option.label },
    ]);

    // 2. Show Typing Indicator
    setIsTyping(true);

    // 3. Simulate Network Delay, then add Bot Response
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), sender: "bot", text: option.response },
      ]);
    }, 1000); // 1 second delay
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {/* The Chat Window */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-4 flex h-[500px] max-h-[80vh] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200 sm:w-[380px]"
          >
            {/* Chat Header */}
            <div className="flex items-center justify-between bg-[#161616] p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#56C21C]">
                  <Bot size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold leading-none">PrintPress Support</h3>
                  <span className="text-xs text-gray-400">Typically replies instantly</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close chat"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50">
              <div className="flex flex-col gap-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                        msg.sender === "user"
                          ? "bg-[#56C21C] text-white rounded-br-sm"
                          : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex max-w-[85%] gap-1 rounded-2xl rounded-bl-sm border border-gray-100 bg-white px-4 py-3 shadow-sm">
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                        className="h-1.5 w-1.5 rounded-full bg-gray-400"
                      />
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                        className="h-1.5 w-1.5 rounded-full bg-gray-400"
                      />
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                        className="h-1.5 w-1.5 rounded-full bg-gray-400"
                      />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Interactive Options Area */}
            <div className="border-t border-gray-100 bg-white p-3">
              {!isTyping && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {CHAT_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleOptionClick(option)}
                      className="rounded-full border border-[#56C21C] bg-[#56C21C]/5 px-3 py-1.5 text-xs font-medium text-[#56C21C] transition-colors hover:bg-[#56C21C] hover:text-white"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Fake Input field to complete the look */}
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 opacity-60">
                <input
                  type="text"
                  disabled
                  placeholder="Select a question above..."
                  className="flex-1 bg-transparent text-sm outline-none cursor-not-allowed"
                />
                <Send size={18} className="text-gray-400" />
              </div>

              <div className="mt-2 text-center">
                <Link href="/contact" onClick={() => setIsOpen(false)} className="text-[10px] text-gray-500 hover:text-[#56C21C] underline">
                  Need more help? Contact Us
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#56C21C] text-white shadow-lg shadow-[#56C21C]/30 transition-colors hover:bg-[#45a315]"
        aria-label="Open chat"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </motion.button>
    </div>
  );
}
