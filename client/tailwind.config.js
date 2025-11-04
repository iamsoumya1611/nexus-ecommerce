/** @type {import('tailwindcss').Config} */
const { colorPalette } = require('./src/config/colors');

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: colorPalette,
    },
  },
  plugins: [],
}