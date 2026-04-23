/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#050508",
        surface: "#0d0d14",
        surface2: "#13131e",
        border: "#1e1e2e",
        "border-bright": "#2e2e4e",
        cyan: "#00e5ff",
        green: "#00ff88",
        red: "#ff3b5c",
        text: "#e8e8f0",
        "text-dim": "#6b6b8a",
        "text-muted": "#3a3a5c",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
        sans: ["Space Grotesk", "sans-serif"],
      },
    },
  },
  plugins: [],
};
