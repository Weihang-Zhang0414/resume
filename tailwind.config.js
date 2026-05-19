/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'blob': 'blob 14s infinite ease-in-out',
        'blob-delayed': 'blob-delayed 16s infinite ease-in-out',
        'blob-slow': 'blob-slow 18s infinite ease-in-out',
      },
      keyframes: {
        blob: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(15vw, -10vh) scale(1.25) rotate(30deg)' },
          '66%': { transform: 'translate(-10vw, 15vh) scale(0.85) rotate(-30deg)' },
        },
        'blob-delayed': {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(-12vw, 12vh) scale(0.85) rotate(-45deg)' },
          '66%': { transform: 'translate(15vw, -15vh) scale(1.2) rotate(45deg)' },
        },
        'blob-slow': {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(10vw, 15vh) scale(1.2) rotate(60deg)' },
          '66%': { transform: 'translate(-15vw, -10vh) scale(0.85) rotate(-60deg)' },
        }
      }
    },
  },
  plugins: [],
}
