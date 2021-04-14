module.exports = {
  darkMode: 'media',
  variants: {
    extend: {},
  },
  purge: [
    './public/views/*.pug',
    './src/**/*.{js,jsx,ts,tsx,vue}',
  ],
  mode: 'jit',
  plugins: []
};