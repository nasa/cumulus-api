/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./website/index.html'],
  theme: {
    screens: {
      sm: '480px',
      md: '768px',
      lg: '976px',
      xl: '1440px',
    },
    fontFamily: {
      sans: ['Open Sans', 'sans-serif'],
    },
    extend: {
      colors: {
        'blue': '#2276AC',
        'gray-light': '#F5F6F7',
        'dark-surface': '#1D1D1D',
        'dark-blue': '#52BDFF',
        'dark-highlight': '#EBF7FF'
      },
    },
  },
  plugins: [],
};
