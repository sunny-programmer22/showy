/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Sora"', '"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
          800: '#0c4a6e',
          900: '#082f49',
        },
        bkash: '#e2136e',
        nagad: '#f7921e',
      },
      boxShadow: {
        soft: '0 2px 20px -4px rgb(15 23 42 / 0.06), 0 1px 3px rgb(15 23 42 / 0.04)',
        lift: '0 20px 40px -16px rgb(15 23 42 / 0.18), 0 4px 12px -4px rgb(15 23 42 / 0.08)',
        glow: '0 0 0 1px rgb(2 132 199 / 0.10), 0 12px 32px -8px rgb(2 132 199 / 0.25)',
        cta: '0 8px 24px -8px rgb(2 132 199 / 0.55)',
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem', letterSpacing: '0.02em' }],
        '3xs': ['0.6875rem', { lineHeight: '0.875rem' }],
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(.96) translateY(8px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up .55s cubic-bezier(.21,.61,.35,1) both',
        'pop-in': 'pop-in .28s cubic-bezier(.21,.61,.35,1) both',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2.6s linear infinite',
      },
    },
  },
  plugins: [],
}
