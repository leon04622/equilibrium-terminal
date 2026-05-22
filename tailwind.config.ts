import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    borderRadius: {
      none: "0",
      DEFAULT: "0",
      sm: "0",
      md: "0",
      lg: "0",
      xl: "0",
      "2xl": "0",
      "3xl": "0",
      full: "0",
    },
    extend: {
      fontFamily: {
        mono: ["var(--font-jetbrains-mono)", "ui-monospace", "monospace"],
        sans: ["var(--font-jetbrains-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tighter: "-0.04em",
      },
      colors: {
        terminal: {
          bg: "#020617",
          panel: "#020617",
          border: "#1e293b",
          bid: "#00ff88",
          ask: "#ff3366",
          mid: "#e2e8f0",
          muted: "#64748b",
        },
        neon: {
          green: "#00ff88",
          ruby: "#ff3366",
          amber: "#ffaa00",
          cyan: "#00e5ff",
        },
        signal: {
          up: "#00ff88",
          down: "#ff3366",
          warn: "#ffaa00",
          ai: "#00e5ff",
        },
      },
      animation: {
        "flash-up": "flash-up 0.2s ease-out",
        "flash-down": "flash-down 0.2s ease-out",
      },
      keyframes: {
        "flash-up": {
          "0%": { backgroundColor: "rgb(0 255 136 / 0.14)" },
          "100%": { backgroundColor: "transparent" },
        },
        "flash-down": {
          "0%": { backgroundColor: "rgb(255 51 102 / 0.14)" },
          "100%": { backgroundColor: "transparent" },
        },
      },
    },
  },
  plugins: [animate],
};

export default config;
