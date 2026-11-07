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
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        charcoal: {
          50: '#F8F9FB',
          100: '#F0F2F6',
          200: '#E2E6EE',
          300: '#C8CFDE',
          400: '#94A0B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#090D16',
        },
        brand: {
          50: '#EEF4FF',
          100: '#E0EBFF',
          200: '#C7D9FE',
          300: '#A4C0FE',
          400: '#7B9FFC',
          500: '#4361EE',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
      },
      boxShadow: {
        'card': '0 2px 10px -2px rgba(15, 23, 42, 0.05), 0 1px 3px 0 rgba(15, 23, 42, 0.03)',
        'card-hover': '0 20px 30px -10px rgba(15, 23, 42, 0.10), 0 8px 12px -4px rgba(15, 23, 42, 0.04)',
        'elevated': '0 25px 50px -12px rgba(15, 23, 42, 0.18)',
        'glow': '0 0 35px -5px rgba(37, 99, 235, 0.22)',
      },
      borderRadius: {
        '2.5xl': '1.25rem',
      },
    },
  },
  plugins: [],
}
