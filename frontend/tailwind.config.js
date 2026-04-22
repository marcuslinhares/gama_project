/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#003f87',
          container: '#0056b3',
        },
        surface: {
          DEFAULT: '#f9f9ff',
          low: '#f2f3fc',
          lowest: '#ffffff',
          high: '#e7e8f0',
          highest: '#e1e2ea',
        },
      },
      fontFamily: {
        headline: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
