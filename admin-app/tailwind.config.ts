import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Palette gothique du studio (miroir de theme.json cote site public)
        noir: {
          profond:  "#050505",
          velours:  "#0d0709",
          marbre:   "#150b10"
        },
        rubis: {
          DEFAULT: "#A10B1B",
          sang:    "#6b0510"
        },
        rose: {
          DEFAULT: "#E2A9B3",
          poudre:  "#f0c9d1"
        },
        argent: {
          givre: "#D1D5DB",
          doux:  "#9ba0a8"
        }
      },
      fontFamily: {
        titre:  ["Cinzel", "serif"],
        script: ["Italianno", "cursive"],
        corps:  ["Montserrat", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
