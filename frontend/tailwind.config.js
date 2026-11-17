/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Manrope', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // EXACT MANDATORY BORROWBUY DESIGN SYSTEM PALETTE
        navy: {
          DEFAULT: '#172B46', // Primary: Midnight Navy
          hover: '#0F1E33',
          50: '#F0F4F8',
          100: '#D9E2EC',
          200: '#BCCCDC',
          300: '#9FB3C8',
          400: '#829AB1',
          500: '#627D98',
          600: '#486581',
          700: '#334E68',
          800: '#243B53',
          900: '#172B46',
        },
        coral: {
          DEFAULT: '#F06449', // Action: Coral
          hover: '#D95339',
          light: '#FDEEEB',
          50: '#FDF6F4',
          100: '#FCECE8',
          200: '#F9D4CC',
          300: '#F6B4A6',
          400: '#F38F7B',
          500: '#F06449',
          600: '#D95339',
          700: '#B83E28',
          800: '#942D1A',
          900: '#751E0F',
        },
        porcelain: {
          DEFAULT: '#F5F6F8', // Page background: Porcelain
          50: '#FFFFFF',
          100: '#FAFAFB',
          200: '#F5F6F8',
          300: '#E9EDF2',
          400: '#E4E7EC',
          500: '#D0D5DD',
        },
        surface: '#FFFFFF', // Pure White
        teal: {
          DEFAULT: '#2F6B65', // Secondary: Teal (Success / Available)
          light: '#EBF3F2',
          50: '#F2F7F6',
          100: '#E0EDE9',
          200: '#C0DCD6',
          300: '#92C4BC',
          400: '#5FA69B',
          500: '#3E8B81',
          600: '#2F6B65',
          700: '#265450',
          800: '#204340',
          900: '#1B3634',
        },
        amber: {
          DEFAULT: '#F2C66D', // Highlight: Amber
          light: '#FEF8EC',
          50: '#FFFBF2',
          100: '#FEF4DE',
          200: '#FDE7B8',
          300: '#FCD78E',
          400: '#F2C66D',
          500: '#E4B251',
          600: '#C79435',
          700: '#A47426',
        },
        charcoal: {
          DEFAULT: '#202833', // Main text: Charcoal
          50: '#F8F9FA',
          100: '#F1F3F5',
          200: '#E9ECEF',
          300: '#DEE2E6',
          400: '#CED4DA',
          500: '#868E96',
          600: '#495057',
          700: '#343A40',
          800: '#212529',
          900: '#202833',
        },
        slate: {
          DEFAULT: '#667085', // Muted text: Slate
          50: '#F8F9FC',
          100: '#F1F3F9',
          200: '#E4E7EC',
          300: '#D0D5DD',
          400: '#98A2B3',
          500: '#667085',
          600: '#475467',
          700: '#344054',
          800: '#1D2939',
          900: '#101828',
        },
        lightGrey: '#E4E7EC', // Border: Light Grey
        lightBlueGrey: '#E9EDF2', // Subtle surface: Light Blue Grey

        // Central Token Aliases (--bb-*)
        'bb-primary': '#172B46',
        'bb-action': '#F06449',
        'bb-action-hover': '#D95339',
        'bb-background': '#F5F6F8',
        'bb-surface': '#FFFFFF',
        'bb-secondary': '#2F6B65',
        'bb-highlight': '#F2C66D',
        'bb-text': '#202833',
        'bb-muted': '#667085',
        'bb-border': '#E4E7EC',
        'bb-subtle': '#E9EDF2',

        // Safe Legacy Aliases: All old beige and green strictly mapped to new palette
        ivory: '#F5F6F8', // Redirects all old ivory/beige to Porcelain
        mist: '#E9EDF2',  // Redirects all old mist/sage to Light Blue Grey
        borderGrey: '#E4E7EC',
        muted: '#667085',
        ink: {
          DEFAULT: '#202833',
          50: '#F8F9FC',
          100: '#F1F3F9',
          200: '#E4E7EC',
          300: '#D0D5DD',
          400: '#98A2B3',
          500: '#667085',
          600: '#475467',
          700: '#344054',
          800: '#202833',
          900: '#172B46',
        },
        cobalt: {
          DEFAULT: '#172B46', // Midnight Navy
          hover: '#0F1E33',
          light: '#F0F4F8',
        },
        tangerine: {
          DEFAULT: '#F06449', // Coral
          hover: '#D95339',
          light: '#FDEEEB',
          50: '#FDF6F4',
          100: '#FCECE8',
          200: '#F9D4CC',
          300: '#F6B4A6',
          400: '#F38F7B',
          500: '#F06449',
          600: '#D95339',
          700: '#B83E28',
          800: '#942D1A',
          900: '#751E0F',
        },
        brand: {
          DEFAULT: '#172B46',
          50: '#F0F4F8',
          100: '#D9E2EC',
          200: '#BCCCDC',
          500: '#486581',
          600: '#172B46',
          700: '#0F1E33',
        },
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(23, 43, 70, 0.05), 0 1px 2px -1px rgba(23, 43, 70, 0.05)',
        'card-hover': '0 12px 24px -6px rgba(23, 43, 70, 0.08), 0 4px 8px -2px rgba(23, 43, 70, 0.03)',
        'elevated': '0 20px 40px -12px rgba(23, 43, 70, 0.16)',
        'coral': '0 8px 20px -4px rgba(240, 100, 73, 0.35)',
        'navy': '0 8px 20px -4px rgba(23, 43, 70, 0.35)',
      },
      borderRadius: {
        '2.5xl': '1.25rem',
      },
    },
  },
  plugins: [],
}
