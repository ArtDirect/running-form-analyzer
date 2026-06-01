import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        // Warm charcoal + sodium amber palette
        bg: "oklch(0.16 0.01 60)",
        surface: "oklch(0.21 0.012 60)",
        "surface-2": "oklch(0.26 0.013 60)",
        fg: "oklch(0.96 0.005 90)",
        muted: "oklch(0.55 0.02 70)",
        "muted-fg": "oklch(0.72 0.015 70)",
        accent: "oklch(0.78 0.16 70)",
        "accent-fg": "oklch(0.16 0.01 60)",
        border: "oklch(0.32 0.014 60)",
        danger: "oklch(0.62 0.18 25)",
        success: "oklch(0.72 0.14 145)",
      },
      fontFamily: {
        display: ['"Fraunces"', "ui-serif", "Georgia", "serif"],
        sans: ['"Archivo"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "14px",
        md: "10px",
        sm: "6px",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 240ms ease-out",
      },
    },
  },
  plugins: [animate],
} satisfies Config;
