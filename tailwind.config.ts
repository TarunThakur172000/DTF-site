import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0F172A",
          50: "#F1F5F9",
          100: "#E2E8F0",
          400: "#475569",
          600: "#1E293B",
          900: "#0F172A",
        },
        accent: {
          DEFAULT: "#56C21C",
          50: "#F7FDF3",
          100: "#EEFBE6",
          200: "#DCF6CD",
          400: "#8CDB4A",
          600: "#56C21C",
          700: "#49A817",
        },
        success: {
          DEFAULT: "#22C55E",
          50: "#F0FDF4",
          600: "#16A34A",
        },
        surface: "#FFFFFF",
        surfaceMuted: "#F8FAFC",
      },
      fontFamily: {
        display: ["var(--font-sora)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "16px",
        "2xl": "20px",
        "3xl": "28px",
      },
      boxShadow: {
        soft: "0 2px 8px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.06)",
        lift: "0 12px 32px rgba(15, 23, 42, 0.12)",
        card: "0 1px 2px rgba(15,23,42,0.04), 0 4px 16px rgba(15,23,42,0.06)",
      },
      backgroundImage: {
        "registration-marks":
          "radial-gradient(circle, rgba(37,99,235,0.15) 1px, transparent 1px)",
      },
      animation: {
        marquee: "marquee 32s linear infinite",
        "fade-up": "fadeUp 0.6s ease forwards",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
