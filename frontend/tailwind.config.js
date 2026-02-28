/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand palette — deep violet + amber gold (NOT the usual blue/white)
        primary: {
          DEFAULT: '#8B5CF6', // violet-500
          dark: '#6D28D9',    // violet-700
          light: '#C4B5FD',   // violet-300
        },
        secondary: {
          DEFAULT: '#F59E0B', // amber-500
          dark: '#B45309',    // amber-700
          light: '#FDE68A',   // amber-200
        },
        accent: '#EC4899',    // pink-500
        dark: {
          DEFAULT: '#0A0A14', // near-black with purple tint
          card: '#13131F',    // card backgrounds
          light: '#1C1C2E',   // slightly lighter panels
          border: '#2A2A40',  // subtle borders
        },
      },
      backgroundImage: {
        'gradient-brand':   'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
        'gradient-gold':    'linear-gradient(135deg, #F59E0B 0%, #EC4899 100%)',
        'gradient-dark':    'linear-gradient(180deg, #0A0A14 0%, #13131F 100%)',
        'gradient-card':    'linear-gradient(135deg, #13131F 0%, #1C1C2E 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float':      'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'spin-slow':  'spin 8s linear infinite',
        'bounce-slow':'bounce 2s ease-in-out infinite',
        'fade-up':    'fadeUp 0.5s ease-out forwards',
        'glow':       'glow 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        fadeUp: {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' },
          '50%':      { boxShadow: '0 0 40px rgba(139, 92, 246, 0.7)' },
        },
      },
      boxShadow: {
        'brand':  '0 0 30px rgba(139, 92, 246, 0.35)',
        'gold':   '0 0 30px rgba(245, 158, 11, 0.35)',
        'card':   '0 4px 24px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
};
