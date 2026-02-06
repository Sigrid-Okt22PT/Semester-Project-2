/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js}", "!./node_modules/**/*"],
  theme: {
    extend: {
      colors: {
        black: "#000000",
        navy: "#14213D",
        yellow: "#FCA311",
        light: "#E5E5E5",
        white: "#FFFFFF",
        red: "#FF0000",
      },
      fontFamily: {
        sans: ["Jost", "ui-sans-serif", "system-ui"],
      },
    },
    plugins: [],
  },
};
