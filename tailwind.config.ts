import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/app/**/*.{js,ts,jsx,tsx,mdx}", "./src/components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#18212f",
        ocean: "#0f766e",
        sun: "#f59e0b",
        mist: "#f5f7fb",
      },
      boxShadow: {
        soft: "0 18px 60px rgba(24, 33, 47, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
