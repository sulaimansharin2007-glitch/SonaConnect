/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#00D4FF',
          50:  '#E0FAFF',
          100: '#B3F3FF',
          200: '#7EEAFF',
          300: '#3DDFFF',
          400: '#00D4FF',
          500: '#00B8E0',
          600: '#0098BC',
          700: '#007A96',
          800: '#005C70',
          900: '#003D4A',
        },
        dark: {
          DEFAULT: '#040810',
          100: '#070D18',
          200: '#0A1220',
          300: '#0D1828',
          400: '#122033',
          500: '#182840',
        },
        surface: '#0A1220',
        accent:  '#00FFD1',
        danger:  '#FF4757',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #00D4FF 0%, #00FFD1 100%)',
        'gradient-dark':    'linear-gradient(180deg, #040810 0%, #070D18 100%)',
        'gradient-card':    'linear-gradient(145deg, rgba(0,212,255,0.06) 0%, rgba(0,255,209,0.03) 100%)',
        'gradient-glow':    'radial-gradient(ellipse at center, rgba(0,212,255,0.2) 0%, transparent 70%)',
      },
      animation: {
        'float':          'float 6s ease-in-out infinite',
        'pulse-slow':     'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'slide-up':       'slide-up 0.5s ease-out',
        'fade-in':        'fade-in 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        'gradient-shift': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%':      { 'background-position': '100% 50%' },
        },
        'slide-up': {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      boxShadow: {
        'glow':       '0 0 30px rgba(0,212,255,0.35)',
        'glow-teal':  '0 0 50px rgba(0,255,209,0.3)',
        'card':       '0 4px 24px rgba(0,0,0,0.7)',
        'card-hover': '0 8px 48px rgba(0,212,255,0.15)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
