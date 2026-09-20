import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff0f6",
          100: "#ffdeeb",
          200: "#fcc2d7",
          300: "#faa2c1",
          400: "#f783ac",
          500: "#f0508c",
          600: "#e6337a",
          700: "#c81e64",
          800: "#a01852",
          900: "#7d1642"
        }
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"]
      },
      boxShadow: {
        post: "0 1px 2px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.08)"
      }
    }
  },
  plugins: []
};

export default config;
