const colors = require('tailwindcss/colors')

module.exports = {
  purge: ['./public/index.html', './src/**/*.{vue,js}'],
  content: [],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: colors.black,
      white: colors.white,
      gray: colors.trueGray,
      orange: {
        50: '#FFF7ED',
        100: '#FFEDD5',
        200: '#FFDCAD',
        300: '#FBCC8D',
        400: '#FFB341',
        500: '#FF9E1A',
        600: '#FF6B17',
        700: '#EB5704',
        800: '#C94800',
        900: '#945011'
      }
    },
    extend: {
      zIndex: {
        '75': 75,
        '100': 100,
        '200': 200,
        '500': 500,
        '1000': 1000,
        '1500': 1500
      }
    },
  },
  plugins: []
}
