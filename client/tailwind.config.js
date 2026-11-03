/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#FA541C',
          'orange-hover': '#E0410E',
          'orange-light': '#FFF2ED',
          'orange-subtle': '#FEE7DC',
          teal: '#0D9488',
          'teal-hover': '#0F766E',
          'teal-light': '#F0FDFA',
          navy: '#0F172A',
          'navy-hover': '#1E293B',
          'navy-dark': '#020617',
          ivory: '#F8FAFC',
          'ivory-dark': '#F1F5F9',
        },
        surface: {
          DEFAULT: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
          muted: '#F1F5F9'
        },
        content: {
          primary: '#0F172A',
          secondary: '#475569',
          muted: '#94A3B8'
        },
        status: {
          success: '#10B981',
          'success-bg': '#ECFDF5',
          warning: '#F59E0B',
          'warning-bg': '#FFFBEB',
          error: '#EF4444',
          'error-bg': '#FEF2F2'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
