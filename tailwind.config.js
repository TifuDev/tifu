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
        /^p-[\d]/,
        /border-.*/,
        /m-[\d]/,
        'list-disc',
        'font-light',
        'font-semibold',
        'my-2',
        /bg-.*/,
        'inset-y-0',
        'left-0',
        'order-2',
        'inline-flex',
        'justify-between',
        'items-center',
        'shadow-2xl',
        'mx-auto',
        'w-full',
        'flex-1',
        /rounded-.*/,
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