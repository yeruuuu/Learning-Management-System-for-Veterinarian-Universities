import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cookie: {
          orange: "#C96C17", // Main orange
          white: "#FFFFFF", // White
          cream: "#FFE0B2", // Cream beige
          lightcream: "#FEF8EA", // Very light cream
          lightorange: "#FCA651", // Light orange
          darkorange: "#CE6E16",
          darkbrown: "#3E2C23",
          brown: "#6B4E3D",
          lightbrown: "#D4A574"
        }
      },
      fontFamily: {
        sans: ["Inter", "Poppins", "system-ui", "sans-serif"],
        heading: ["Poppins", "Inter", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: [daisyui],
  daisyui: {
    themes: ["emerald", "dark"]
  }
};
