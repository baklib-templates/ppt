/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./layout/**/*.liquid",
    "./snippets/**/*.liquid",
    "./templates/**/*.liquid",
    "./statics/**/*.liquid"
  ],
  theme: {
    extend: {
      colors: () => {
        return {
          ...["primary", "secondary", "accent", "info", "success", "warning"].reduce((map, name) => {
            return {
              ...map,
              [name]: {
                DEFAULT: `hsl(var(--theme-color-${name}) / <alpha-value>)`,
                lighten: `hsl(var(--theme-color-${name}-hsl-h) var(--theme-color-${name}-hsl-s) calc(var(--theme-color-${name}-hsl-l) + 15%))`,
                darken: `hsl(var(--theme-color-${name}-hsl-h) var(--theme-color-${name}-hsl-s) calc(var(--theme-color-${name}-hsl-l) - 15%))`,
                ...[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].reduce((map,lightness) => {
                  return {
                    ...map,
                    [lightness]: `hsl(var(--theme-color-${name}-hsl-h) var(--theme-color-${name}-hsl-s) ${100 - lightness/10*0.8}%)`
                  }
                }, {})
              }
            }
          }, {}),
          // 错误色永远是红色，饱和度与主色调保持一致
          error: {
            DEFAULT: `hsl(355 75% var(--theme-color-primary-hsl-l) / <alpha-value>)`,
            lighten: `hsl(355 75% calc(var(--theme-color-primary-hsl-l) + 15%))`,
            darken: `hsl(355 75% calc(var(--theme-color-primary-hsl-l) - 15%))`,
            ...[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].reduce((map,lightness) => {
              return {
                ...map,
                [lightness]: `hsl(355 75% ${100 - lightness/10*0.8}%)`
              }
            }, {})
          }
        }
      },
      keyframes: {
        rotate: {
          '100%': {
              transform: 'rotate(1turn)'
          }
        },
        float: {
          '0%': {
            transform: 'translateY(-20px)'
          },
          '100%': {
            transform: 'translateY(0px)'
          }
        },
        'hero-thumb-sm-animation': {
          '0%': {
            transform: 'translateX(50px)'
          },
          '100%': {
            transform: 'translateX(0px)'
          }
        }
      },
      animation: {
        'float': 'float 2s linear infinite alternate',
        'rotate': 'rotate 4s linear infinite',
        'float-md': 'float 4s linear infinite alternate',
        'hero-thumb-sm-animation': 'hero-thumb-sm-animation 4s linear infinite alternate',
        'hero-thumb-md-animation': 'hero-thumb-sm-animation 2s linear infinite alternate'
      },
      spacing: {
        4.5: "1.125rem",
        5.5: "1.375rem",
        18: "4.5rem",
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography')
  ],
}
