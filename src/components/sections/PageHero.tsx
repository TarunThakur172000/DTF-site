"use client";

import { motion } from "framer-motion";
import { Eyebrow } from "../ui/Eyebrow";
import { Breadcrumbs } from "../ui/Breadcrumbs";

interface Crumb {
  label: string;
  to?: string;
}

export function PageHero({
  eyebrow,
  title,
  description,
  crumbs,
}: {
  eyebrow: string;
  title: string;
  description: string;
  crumbs: Crumb[];
}) {
  return (
    <section className="bg-surfaceMuted border-b border-primary-50">
      <Breadcrumbs items={crumbs} />
      <div className="container-px pt-6 pb-14 md:pb-20">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-2xl">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight">{title}</h1>
          <p className="mt-5 text-lg text-primary-400">{description}</p>
        </motion.div>
      </div>
    </section>
  );
}
