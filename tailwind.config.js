/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2E6DA4",
        secondary: "#27AE60",
        accent: "#E74C3C",
      },
      spacing: {
        safe: "var(--safe-area-inset-bottom)",
      },
    },
  },
  plugins: [],
};
