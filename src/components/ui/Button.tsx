"use client";

import { type ReactNode } from "react";
import type { HTMLMotionProps } from "framer-motion";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

interface BaseProps {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  icon?: boolean;
  className?: string;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-accent-600 text-white hover:bg-accent-700 shadow-soft",
  secondary: "bg-white text-primary-900 border border-primary-100 hover:border-accent-400 hover:text-accent-600",
  ghost: "bg-transparent text-primary-900 hover:bg-primary-50",
};

const sizeClasses: Record<Size, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-accent-600";

export function Button({
  variant = "primary",
  size = "md",
  children,
  icon = false,
  className = "",
  ...rest
}: BaseProps & Omit<HTMLMotionProps<"button">, keyof BaseProps>) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...rest}
    >
      {children}
      {icon && <ArrowRight size={16} />}
    </motion.button>
  );
}

interface LinkButtonProps extends BaseProps {
  to: string;
}

export function LinkButton({
  variant = "primary",
  size = "md",
  children,
  icon = false,
  className = "",
  to,
}: LinkButtonProps) {
  return (
    <Link href={to}>
      <motion.span
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={`${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      >
        {children}
        {icon && <ArrowRight size={16} />}
      </motion.span>
    </Link>
  );
}
