/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        // MANDATORY PREFERRED EDITORIAL LIGHT THEME
        bg: {
          DEFAULT: '#FAFAF8',
          subtle: '#F1F3F3',
          surface: '#FFFFFF',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          hover: '#F9FAFA',
          subtle: '#F1F3F3',
        },
        text: {
          DEFAULT: '#17191C',
          primary: '#17191C',
          secondary: '#66707A',
          muted: '#8C959F',
        },
        border: {
          DEFAULT: '#E5E8EA',
          subtle: '#F1F3F3',
          strong: '#D0D5DD',
        },
        primary: {
          DEFAULT: '#315CF5',
          hover: '#2447C9',
          light: '#EFF3FE',
          50: '#F5F7FE',
          100: '#EFF3FE',
          200: '#DBE4FD',
          300: '#BDCEFB',
          400: '#7599F8',
          500: '#315CF5',
          600: '#2447C9',
          700: '#1D379E',
          800: '#162870',
          900: '#101B48',
        },
        positive: {
          DEFAULT: '#13795B',
          hover: '#0E5B44',
          light: '#EBF5F1',
          50: '#F2F8F5',
          100: '#EBF5F1',
          500: '#13795B',
          600: '#0E5B44',
          700: '#0A3F2F',
        },
        warning: {
          DEFAULT: '#B76E16',
          hover: '#945811',
          light: '#FEF7ED',
          50: '#FFFBF5',
          100: '#FEF7ED',
          500: '#B76E16',
          600: '#945811',
        },
        error: {
          DEFAULT: '#C43838',
          hover: '#9F2D2D',
          light: '#FDF2F2',
          50: '#FFF5F5',
          100: '#FDF2F2',
          500: '#C43838',
          600: '#9F2D2D',
        },

        // Semantic BB Tokens
        'bb-bg': '#FAFAF8',
        'bb-surface': '#FFFFFF',
        'bb-text': '#17191C',
        'bb-secondary': '#66707A',
        'bb-border': '#E5E8EA',
        'bb-subtle': '#F1F3F3',
        'bb-action': '#315CF5',
        'bb-action-hover': '#2447C9',
        'bb-positive': '#13795B',
        'bb-warning': '#B76E16',
        'bb-error': '#C43838',

        // Legacy Token Aliases safely mapped to new palette to prevent breaks
        navy: {
          DEFAULT: '#17191C',
          hover: '#24282D',
          50: '#F1F3F3',
          100: '#E5E8EA',
          500: '#66707A',
          800: '#24282D',
          900: '#17191C',
        },
        coral: {
          DEFAULT: '#315CF5',
          hover: '#2447C9',
          light: '#EFF3FE',
          500: '#315CF5',
          600: '#2447C9',
        },
        teal: {
          DEFAULT: '#13795B',
          light: '#EBF5F1',
          500: '#13795B',
          600: '#0E5B44',
        },
        amber: {
          DEFAULT: '#B76E16',
          light: '#FEF7ED',
          500: '#B76E16',
        },
        charcoal: {
          DEFAULT: '#17191C',
        },
        slate: {
          DEFAULT: '#66707A',
          500: '#66707A',
        },
        porcelain: {
          DEFAULT: '#FAFAF8',
        },
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(16, 24, 40, 0.05)',
        'card': '0 1px 3px 0 rgba(23, 25, 28, 0.04), 0 1px 2px -1px rgba(23, 25, 28, 0.03)',
        'card-hover': '0 8px 24px -4px rgba(23, 25, 28, 0.08), 0 2px 6px -1px rgba(23, 25, 28, 0.03)',
        'elevated': '0 16px 36px -8px rgba(23, 25, 28, 0.12), 0 4px 12px -2px rgba(23, 25, 28, 0.04)',
        'dropdown': '0 12px 32px -4px rgba(23, 25, 28, 0.12), 0 2px 8px -1px rgba(23, 25, 28, 0.04)',
      },
      borderRadius: {
        'xl': '0.75rem',    // 12px
        '2xl': '1rem',      // 16px
        '3xl': '1.25rem',   // 20px
      },
    },
  },
  plugins: [],
}
