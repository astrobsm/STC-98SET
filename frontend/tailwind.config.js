/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        stoba: {
          green: '#1B5E20',
          'green-light': '#2E7D32',
          'green-dark': '#0D3B13',
          yellow: '#FBC02D',
          'yellow-light': '#FDD835',
          brown: '#5D4037',
          'brown-light': '#795548',
          'brown-dark': '#3E2723',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
