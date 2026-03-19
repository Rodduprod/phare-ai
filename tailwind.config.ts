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
        // Couleurs principales selon charte
        primary: {
          DEFAULT: "#99ccff", // bleu labo
          hover: "#5ba3e6",   // bleu labo hover  
          deep: "#2a6db5",    // bleu labo profond
        },
        // Texte
        text: {
          DEFAULT: "#1a1a1a",  // noir éditorial
          body: "#4a4a4a",     // gris texte
          muted: "#8a8a8a",    // gris secondaire
        },
        // Fonds  
        bg: {
          DEFAULT: "#ffffff",  // blanc
          alt: "#f7f7f5",      // gris chaud
        },
        border: {
          DEFAULT: "#e8e8e5",  // gris bordure
        },
        // Fonctionnelles
        success: "#34c759",
        warning: "#f5a623", 
        error: "#e53e3e",
        // Rétrocompatibilité (à supprimer progressivement)
        ink: {
          50: "#f7f7f5",
          100: "#e8e8e5",
          200: "#e8e8e5", 
          300: "#8a8a8a",
          400: "#8a8a8a",
          500: "#8a8a8a",
          600: "#4a4a4a",
          700: "#4a4a4a",
          800: "#4a4a4a",
          900: "#1a1a1a",
          950: "#1a1a1a",
        },
        signal: {
          DEFAULT: "#99ccff",
          light: "#99ccff",
          dark: "#2a6db5",
        },
        surface: {
          DEFAULT: "#f7f7f5",
          raised: "#ffffff", 
          sunken: "#f7f7f5",
        },
      },
      fontFamily: {
        sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        display: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'], // Plus de serif
        body: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      fontSize: {
        // Tailles selon charte
        "display-xl": ["2.25rem", { lineHeight: "1.2", fontWeight: "700" }], // H1 36px
        "display-lg": ["1.5rem", { lineHeight: "1.3", fontWeight: "600" }],   // H2 24px
        "display-md": ["1.25rem", { lineHeight: "1.35", fontWeight: "600" }], // H3 20px
        "body": ["1.0625rem", { lineHeight: "1.7", fontWeight: "400" }],      // Corps 17px
        "intro": ["1.25rem", { lineHeight: "1.6", fontWeight: "400" }],       // Chapô 20px
        "meta": ["0.875rem", { lineHeight: "1.5", fontWeight: "400" }],       // Métadonnées 14px
        "nav": ["0.9375rem", { lineHeight: "1.4", fontWeight: "500" }],       // Navigation 15px
        "btn": ["0.9375rem", { lineHeight: "1", fontWeight: "600" }],         // Boutons 15px
      },
      spacing: {
        // Espacements basés sur unité 8px
        "unit": "8px",
        "2unit": "16px", 
        "3unit": "24px",
        "4unit": "32px",
        "8unit": "64px",
      },
      borderRadius: {
        sm: "6px",
        md: "8px", 
        lg: "12px",
      },
      maxWidth: {
        "content": "1200px",  // Conteneur principal
        "prose": "680px",     // Largeur de lecture
      },
      screens: {
        // Breakpoints selon charte
        'sm': '640px',   // Tablette
        'lg': '1024px',  // Desktop  
        // Suppression de 'md' pour simplifier (640px → 1024px direct)
      },
      animation: {
        "fade-in": "fadeIn 300ms ease forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      transitionTimingFunction: {
        'ease': 'cubic-bezier(0.4, 0, 0.2, 1)', // Easing selon charte
      },
    },
  },
  plugins: [],
};

export default config;
