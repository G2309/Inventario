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
        bio: {
          dark: "#012326",
          green_dark: "#31591E",
          green: "#568C1F",
          green_light: "#88BF11",
          light: "#F2F2F2",
        }
      }
    },
  },
  plugins: [],
};
export default config;
