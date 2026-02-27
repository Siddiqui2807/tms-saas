/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "Segoe UI", "Roboto", "Arial", "sans-serif"],
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(135deg, rgba(59,130,246,0.85), rgba(147,51,234,0.85))",
      },
    },
  },
  plugins: [],
}
