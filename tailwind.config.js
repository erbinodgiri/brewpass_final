/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        coffee: {
          50:  '#fdf8f0',
          100: '#f9edd8',
          200: '#f0d5a8',
          300: '#e4b46a',
          400: '#e8a24b',
          500: '#c97a20',
          600: '#a8621a',
          700: '#834c17',
          800: '#1a1208',
          900: '#0e0a06',
        }
      },
      fontFamily: {
        display: ['Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}
