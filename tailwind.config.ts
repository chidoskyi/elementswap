import type { Config } from "tailwindcss";

export default {
  content: ["./client/index.html", "./client/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        /* Map Tailwind classes to CSS variables set by theme */
        surface0: "var(--bg)",
        surface1: "var(--surface1)",
        surface2: "var(--surface2)",
        surface3: "var(--surface3)",
        surface4: "var(--surface4)",
        border1:  "var(--border1)",
        border2:  "var(--border2)",
        text1:    "var(--text1)",
        text2:    "var(--text2)",
        text3:    "var(--text3)",
        pink:     "var(--pink)",
        "pink-d": "var(--pink-d)",
        blue:     "var(--blue)",
        green:    "var(--green)",
        red:      "var(--red)",
        yellow:   "var(--yellow)",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      borderRadius: {
        pill: "100px",
      },
      boxShadow: {
        card:  "var(--shadow-card)",
        modal: "var(--shadow-modal)",
      },
    },
  },
  plugins: [],
} satisfies Config;
