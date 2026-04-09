export default {
  content: [
    "./index.html",
    "./main.jsx",
    "./App.jsx",
    "./components/**/*.{js,jsx}",
    "./pages/**/*.{js,jsx}",
    "./hooks/**/*.{js,jsx}",
    "./services/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Manrope", "sans-serif"],
        body: ["Plus Jakarta Sans", "sans-serif"]
      },
      colors: {
        ink: "#121826",
        sky: "#64d2ff",
        coral: "#ff6b6b",
        lime: "#9be564",
        amber: "#ffbe0b"
      },
      boxShadow: {
        aura: "0 20px 50px -20px rgba(100, 210, 255, 0.5)"
      }
    }
  },
  plugins: []
};
