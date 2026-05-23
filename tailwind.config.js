/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff1f0',
          100: '#ffe0db',
          200: '#ffc1b8',
          300: '#ff9585',
          400: '#ff5c4a',
          500: '#e63020',
          600: '#c52518',
          700: '#a11e13',
          800: '#851b11',
          900: '#6e1b13',
        },
      },
    },
  },
  plugins: [],
}

