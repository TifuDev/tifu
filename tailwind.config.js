const colors = require('tailwindcss/colors')

module.exports = {
  purge: {
    enabled: true,
    content: ['./src/**/*.html'],
    options: {
      safelist: [
        'flex',
        'container',
        /h[\d]/,
        'p',
        'span',
        /text-(xs|sm|base|lg|xl|\dxl)/,
        'p-2',
        'm-2',
        'list-disc',
        'font-light',
        'font-semibold',
        'my-2',
        'justify-between',
        'items-center',
        'shadow-2xl',
        'mx-auto',
        'w-full',
        'flex-1',
        'underline'
      ],
    }
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Open Sans']
      }
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      blue: colors.blue
    }
  },
  variants: {
    extend: {},
  },
  plugins: [],
};