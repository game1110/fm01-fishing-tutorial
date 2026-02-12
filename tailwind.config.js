/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        'swim-ltr': {
          '0%': { transform: 'translateX(-80px) scaleX(1)' },
          '100%': { transform: 'translateX(calc(100vw + 80px)) scaleX(1)' },
        },
        'swim-rtl': {
          '0%': { transform: 'translateX(calc(100vw + 80px)) scaleX(-1)' },
          '100%': { transform: 'translateX(-80px) scaleX(-1)' },
        },
        'float-up': {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-60px)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '0.8' },
          '50%': { transform: 'scale(1.2)', opacity: '0.4' },
          '100%': { transform: 'scale(0.8)', opacity: '0.8' },
        },
        'water-shimmer': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'splash': {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '60%': { transform: 'scale(1.5)', opacity: '0.6' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
        'confetti-fall': {
          '0%': { transform: 'translateY(-100%) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
        'bob': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'highlight-pulse': {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(250, 204, 21, 0.4)' },
          '50%': { transform: 'scale(1.08)', boxShadow: '0 0 20px 8px rgba(250, 204, 21, 0.3)' },
        },
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateX(-50%) translateY(0)' },
          '50%': { transform: 'translateX(-50%) translateY(-4px)' },
        },
      },
      animation: {
        'swim-ltr': 'swim-ltr var(--swim-duration, 8s) linear forwards',
        'swim-rtl': 'swim-rtl var(--swim-duration, 8s) linear forwards',
        'float-up': 'float-up 1s ease-out forwards',
        'pulse-ring': 'pulse-ring 1.5s ease-in-out infinite',
        'water-shimmer': 'water-shimmer 3s ease infinite',
        'splash': 'splash 0.5s ease-out forwards',
        'confetti-fall': 'confetti-fall var(--confetti-duration, 3s) linear forwards',
        'bob': 'bob 2s ease-in-out infinite',
        'highlight-pulse': 'highlight-pulse 1.5s ease-in-out infinite',
        'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
