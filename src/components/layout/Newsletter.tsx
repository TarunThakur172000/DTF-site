"use client";

import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setDone(true);
    setEmail("");
  };

  return (
    <div>
      <h3 className="font-display font-semibold text-white">Stay in the loop</h3>
      <p className="text-sm text-primary-400 mt-2">Product drops, print tips, and seasonal offers — no spam.</p>
      {done ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-success-400 text-success">
          <CheckCircle2 size={16} /> You&apos;re subscribed.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-4 flex gap-2">
          <label htmlFor="newsletter-email" className="sr-only">Email address</label>
          <input
            id="newsletter-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="flex-1 min-w-0 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-primary-400 focus:border-accent-400 outline-none"
          />
          <button
            type="submit"
            aria-label="Subscribe"
            className="flex items-center justify-center rounded-xl bg-accent-600 hover:bg-accent-700 transition-colors px-3.5 text-white"
          >
            <Send size={16} />
          </button>
        </form>
      )}
    </div>
  );
}
