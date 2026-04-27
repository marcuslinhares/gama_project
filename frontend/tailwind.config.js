/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          container: 'var(--color-primary-container)',
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          low: 'var(--color-surface-low)',
          lowest: 'var(--color-surface-lowest)',
          high: 'var(--color-surface-high)',
          highest: 'var(--color-surface-highest)',
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
