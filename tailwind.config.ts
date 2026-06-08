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
        primary: {
          50:  "#f0faf0",
          100: "#dcf5dc",
          200: "#bbebbb",
          300: "#8dd98d",
          400: "#5cbf5c",
          500: "#3a9e3a",
          600: "#2E7D32", // ← warna utama
          700: "#256327",
          800: "#1e4e1f",
          900: "#193f1a",
          DEFAULT: "#2E7D32",
        },
        accent: {
          DEFAULT: "#F9A825", // kuning — hanya untuk badge status lulus/prestasi
        },
        danger: {
          DEFAULT: "#C62828",
          light: "#FFEBEE",
        },
        neutral: {
          50:  "#F8F9FA",
          100: "#F1F3F5",
          200: "#E9ECEF",
          300: "#DEE2E6",
          400: "#CED4DA",
          500: "#ADB5BD",
          600: "#6C757D",
          700: "#495057",
          800: "#343A40",
          900: "#212529",
        },
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        card: "12px",
        btn:  "8px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.10)",
        sidebar: "2px 0 8px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
};
export default config;