/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./website/index.html"],
  theme: {
    screens: {
      sm: "480px",
      md: "768px",
      lg: "976px",
      xl: "1440px",
    },
    colors: {
      blue: "#2276AC",
    },
    fontFamily: {
      sans: ["Open Sans", "sans-serif"],
    },
    extend: {},
  },
  plugins: [],
};
