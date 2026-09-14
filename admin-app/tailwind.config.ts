import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Palette gothique du studio — noms alignes sur les CSS vars
        // de public/content/theme.json (miroir cote admin).
        "noir-profond":  "#050505",
        "noir-velours":  "#0d0709",
        "noir-marbre":   "#150b10",
        "rouge-rubis":   "#A10B1B",
        "rouge-sang":    "#6b0510",
        "rose-metal":    "#E2A9B3",
        "rose-poudre":   "#f0c9d1",
        "argent-givre":  "#D1D5DB",
        "argent-doux":   "#9ba0a8"
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
