import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/app/**/*.{js,ts,jsx,tsx,mdx}", "./src/components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#18212f",
        ocean: "#0f766e",
        deepGreen: "#173f35",
        gold: "#9c7a37",
        sun: "#f59e0b",
        ivory: "#f7f4ed",
        mist: "#f5f7fb",
      },
      boxShadow: {
        soft: "0 18px 60px rgba(24, 33, 47, 0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
