/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        logo: ['Bebas Neue', 'Bangers', 'Oswald', 'sans-serif'],
        title: ['Playfair Display', 'Oswald', 'serif'],
        body: [ 'Roboto', 'Inter', 'Poppins', 'Manrope', 'Noto Sans', 'sans-serif'],
      },},
  },
  plugins: [],
}