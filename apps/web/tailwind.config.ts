import type { Config } from 'tailwindcss'

// Design tokens mirror the mobile app's warm earthy palette so the site visually
// matches the store screenshots (cream background, terracotta accent, dark-brown
// headings).
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FBF6EE',
        sand: '#F3E9D8',
        terracotta: {
          DEFAULT: '#B5562B',
          dark: '#92431F',
          light: '#D2774A',
        },
        bark: {
          DEFAULT: '#3E2A1E',
          light: '#6B4E3D',
        },
        sage: '#7C8C6B',
        meadow: '#4F7A3F',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Fraunces"', 'Georgia', 'serif'],
      },
      maxWidth: {
        content: '72rem',
      },
    },
  },
  plugins: [],
}

export default config
