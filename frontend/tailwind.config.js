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
          DEFAULT: '#C9A84C',
          50:  '#FDF8EC',
          100: '#F9EDCC',
          200: '#F2D98A',
          300: '#E8C45A',
          400: '#D9AC3E',
          500: '#C9A84C',
          600: '#A8862C',
          700: '#876A1E',
          800: '#654F16',
          900: '#45360D',
        },
        dark: {
          DEFAULT: '#0C0608',
          100: '#140A0D',
          200: '#1E1015',
          300: '#271419',
          400: '#341B22',
          500: '#3F2029',
        },
        maroon: {
          DEFAULT: '#5C1A2E',
          light: '#7A2340',
          dark:  '#3D0F1E',
        },
        gold: {
          DEFAULT: '#C9A84C',
          light:   '#E8C45A',
          bright:  '#FFD700',
          muted:   '#A8862C',
          pale:    '#F2D98A',
        },
        surface: '#1A0D11',
        accent:  '#E8C45A',
        danger:  '#FF4757',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #C9A84C 0%, #E8C45A 50%, #C9A84C 100%)',
        'gradient-royal':   'linear-gradient(135deg, #5C1A2E 0%, #3D0F1E 100%)',
        'gradient-card':    'linear-gradient(145deg, rgba(201,168,76,0.08) 0%, rgba(92,26,46,0.05) 100%)',
        'gradient-glow':    'radial-gradient(ellipse at center, rgba(201,168,76,0.25) 0%, transparent 70%)',
        'gradient-gold':    'linear-gradient(90deg, #C9A84C, #E8C45A, #C9A84C)',
      },
      animation: {
        'float':          'float 6s ease-in-out infinite',
        'pulse-slow':     'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'slide-up':       'slide-up 0.5s ease-out',
        'fade-in':        'fade-in 0.3s ease-out',
        'shimmer':        'shimmer 2s linear infinite',
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
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
      boxShadow: {
        'glow':       '0 0 30px rgba(201,168,76,0.35)',
        'glow-gold':  '0 0 50px rgba(201,168,76,0.4)',
        'glow-maroon':'0 0 30px rgba(92,26,46,0.5)',
        'card':       '0 4px 24px rgba(0,0,0,0.6)',
        'card-hover': '0 8px 48px rgba(201,168,76,0.2)',
        'royal':      '0 0 0 1px rgba(201,168,76,0.2), 0 8px 32px rgba(0,0,0,0.6)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

