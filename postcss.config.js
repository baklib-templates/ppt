module.exports = {
  plugins: {
    'postcss-import': {},
    'tailwindcss/nesting': {},
    tailwindcss: {},
    'postcss-replace': {
      pattern: /url\("\.\.\/webfonts\//g,
      data: { replaceAll: 'url("webfonts/' }
    },
    autoprefixer: {},
  }
}
