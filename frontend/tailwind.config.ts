import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"TF Times New Normal"', "Georgia", "serif"],
        serif: ['"UTM Horizon"', "serif"]
      },
      colors: {
        ink: "#17211b",
        leaf: "#1d5f46",
        moss: "#6f8f4e",
        clay: "#b8573c",
        gold: "#d8a94f",
        paper: "#fbfaf6"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(23, 33, 27, 0.12)"
      }
    }
  },
  plugins: []
} satisfies Config;

