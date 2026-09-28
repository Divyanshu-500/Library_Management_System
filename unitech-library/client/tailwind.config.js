/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dbe7ff",
          200: "#bcd3ff",
          300: "#8fb5ff",
          400: "#5c8bff",
          500: "#3562ff",
          600: "#213eef",
          700: "#1a2fd4",
          800: "#1c2aa8",
          900: "#1c2984",
          950: "#141a4d",
        },
        ink: {
          900: "#0b0f1a",
          800: "#121729",
          700: "#1a2138",
          600: "#252e4a",
        },
        gold: {
          400: "#f2c14e",
          500: "#e6ac1f",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        display: ["Sora", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,0.06), 0 1px 3px rgba(16,24,40,0.08)",
        soft: "0 10px 30px -10px rgba(31,45,110,0.25)",
        glow: "0 0 0 4px rgba(53,98,255,0.12)",
      },
      backgroundImage: {
        "grid-pattern":
          "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
};
