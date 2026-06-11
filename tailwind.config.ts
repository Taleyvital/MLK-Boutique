import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4c0002',
          container: '#720808',
        },
        secondary: {
          DEFAULT: '#7d525d',
          container: '#fec6d3',
        },
        tertiary: {
          DEFAULT: '#072436',
          container: '#bad4ed',
        },
        surface: {
          DEFAULT: '#fef8f2',
          low: '#f9f3ed',
          rose: '#f6e6e5',
          mist: '#dae9f7',
        },
        'on-surface': '#1d1b18',
        'on-surface-variant': '#58413e',
        outline: '#8c716d',
        'outline-variant': '#dfbfbb',
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        serif: ['Libre Caslon Text', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
        full: '9999px',
      },
      boxShadow: {
        brand: '0 4px 20px rgba(114, 8, 8, 0.05)',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
}

export default config
