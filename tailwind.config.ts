import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#baddfd",
          300: "#7ec3fb",
          400: "#39a4f7",
          500: "#0f87e8",
          600: "#0369c6",
          700: "#0453a0",
          800: "#084784",
          900: "#0c3c6e",
          950: "#082649",
        },
        accent: {
          50: "#fff7ed",
          100: "#ffeed4",
          200: "#fdd9a8",
          300: "#fbbc71",
          400: "#f89538",
          500: "#f67512",
          600: "#e75808",
          700: "#c04009",
          800: "#993310",
          900: "#7c2b10",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(15,135,232,0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(15,135,232,0.6)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 2s linear infinite",
        float: "float 3s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite",
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(15,135,232,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(15,135,232,0.05) 1px, transparent 1px)",
        "hero-gradient":
          "radial-gradient(ellipse 80% 80% at 50% -20%, rgba(15,135,232,0.3), transparent)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
