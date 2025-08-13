/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-navy': '#002b5c',
        'brand-gold': '#C2860A',
      },
    },
  },
  plugins: [],
}
