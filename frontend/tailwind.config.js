/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#6C63FF',
          50: '#f0efff',
          100: '#e3e1ff',
          200: '#c9c5ff',
          300: '#a89fff',
          400: '#8577ff',
          500: '#6C63FF',
          600: '#5a51e0',
          700: '#4940b8',
          800: '#3a3393',
          900: '#2d2872',
        },
        pink: {
          accent: '#FF6584',
        },
        dark: {
          DEFAULT: '#0A0A0F',
          100: '#12121A',
          200: '#1A1A2E',
          300: '#1e1e30',
          400: '#252540',
        },
        surface: '#1A1A2E',
        accent: '#00D4AA',
        danger: '#FF4757',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #6C63FF 0%, #FF6584 100%)',
        'gradient-dark': 'linear-gradient(180deg, #0A0A0F 0%, #12121A 100%)',
        'gradient-card': 'linear-gradient(145deg, rgba(108,99,255,0.1) 0%, rgba(255,101,132,0.05) 100%)',
        'gradient-glow': 'radial-gradient(ellipse at center, rgba(108,99,255,0.3) 0%, transparent 70%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'gradient-shift': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      boxShadow: {
        'glow': '0 0 20px rgba(108, 99, 255, 0.4)',
        'glow-pink': '0 0 20px rgba(255, 101, 132, 0.4)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 40px rgba(108, 99, 255, 0.3)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
