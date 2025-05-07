/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
        gold: {
          50: "#fffbeb",
          100: "#fff3c4",
          200: "#ffe985",
          300: "#ffd74d",
          400: "#ffcb29",
          500: "#ffb30d",
          600: "#e68800",
          700: "#cc6e02",
          800: "#a15108",
          900: "#84430b",
          950: "#472000",
        },
        dark: {
          50: "#f7f7f7",
          100: "#e3e3e3",
          200: "#c8c8c8",
          300: "#a4a4a4",
          400: "#818181",
          500: "#666666",
          600: "#515151",
          700: "#434343",
          800: "#383838",
          900: "#313131",
          950: "#1a1a1a",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gold-gradient": "linear-gradient(135deg, #ffd700 0%, #b8860b 100%)",
      },
      boxShadow: {
        gold: "0 0 15px rgba(255, 215, 0, 0.3)",
        "gold-lg": "0 0 30px rgba(255, 215, 0, 0.5)",
      },
    },
  },
  plugins: [],
};
