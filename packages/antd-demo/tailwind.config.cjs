// eslint-disable-next-line @typescript-eslint/no-require-imports
const { slate, sky, red } = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  corePlugins: {
    // Avoid conflicts with antd
    preflight: false,
  },
  theme: {
    // Custom theme color, for basic layout, header, sidebar, iframe, etc.
    // overrides the default theme, it we need to keep default colors ... we can extends it at `theme.extend.colors`
    colors: {
      // Keep sky color
      sky,
      // Keep slate color
      slate,
      // Keep red color
      red,
      // default support white color
      white: '#ffffff',
      // Custom hypese theme color
      hyperse: {
        primary: '#067cba',
        header: {
          bg: '#001529',
          bgActive: '#08223b',
          logo: {
            bg: '#1b2a32',
          },
        },
        sider: {
          bg: '#e8e8e8',
        },
        frame: {
          tabs: {
            activeBg: '#f1f1f1',
          },
        },
      },
    },
  },
  plugins: [
    // require('@tailwindcss/typography'),
    // require('@tailwindcss/aspect-ratio'),
    // require('@tailwindcss/forms'),
  ],
};
