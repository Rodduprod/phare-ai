import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f7f7f5",
          100: "#eeedea",
          200: "#d5d3cc",
          300: "#b8b5ab",
          400: "#9a968a",
          500: "#7d7969",
          600: "#605d50",
          700: "#484640",
          800: "#302f2c",
          900: "#1a1918",
          950: "#0d0d0c",
        },
        signal: {
          DEFAULT: "#e85d24",
          light: "#f0997b",
          dark: "#993c1d",
        },
        surface: {
          DEFAULT: "#faf9f7",
          raised: "#ffffff",
          sunken: "#f0efe9",
        },
      },
      fontFamily: {
        display: ['"Instrument Serif"', "Georgia", "serif"],
        body: ['"Satoshi"', '"DM Sans"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      fontSize: {
        "display-xl": ["3.5rem", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
        "display-lg": ["2.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-md": ["1.75rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease-out forwards",
        "fade-in": "fadeIn 0.4s ease-out forwards",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
