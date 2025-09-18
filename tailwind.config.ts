import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // allow toggling with the .dark class; prefers-color-scheme still works via CSS
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        foreground: 'var(--color-foreground)',
        muted: 'var(--color-muted)',

        primary: {
          DEFAULT: 'var(--color-primary)',
          foreground: 'var(--color-primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          foreground: 'var(--color-secondary-foreground)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          foreground: 'var(--color-accent-foreground)',
        },

        info: 'var(--color-info)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',

        sand: {
          50: 'var(--color-sand-50)',
          100: 'var(--color-sand-100)',
          200: 'var(--color-sand-200)',
        },
        sea: {
          50: 'var(--color-sea-50)',
          100: 'var(--color-sea-100)',
          200: 'var(--color-sea-200)',
        },
        forest: {
          50: 'var(--color-forest-50)',
          100: 'var(--color-forest-100)',
          200: 'var(--color-forest-200)',
        },
        stone: {
          50: 'var(--color-stone-50)',
          100: 'var(--color-stone-100)',
          200: 'var(--color-stone-200)',
        },
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        medium: 'var(--shadow-medium)',
        strong: 'var(--shadow-strong)',
      },
      fontFamily: {
        sans: ['var(--font-family-sans)'],
        mono: ['var(--font-family-mono)'],
      },
      fontSize: {
        base: 'var(--font-size-base)',
      },
      lineHeight: {
        base: 'var(--line-height-base)',
      },
    },
  },
  plugins: [],
}

export default config
