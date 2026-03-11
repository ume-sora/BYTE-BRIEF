/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0D0F14',
        surface: '#161B22',
        accent: '#00D4FF',
      },
      fontFamily: {
        display: ['"M PLUS 1 Code"', '"Noto Sans JP"', 'monospace'],
        body: ['"Noto Sans JP"', 'sans-serif'],
        mono: ['"M PLUS 1 Code"', '"Noto Sans JP"', 'monospace'],
        sans: ['"Noto Sans JP"', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.4s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'glow': '0 0 20px -2px rgba(0, 212, 255, 0.3)',
      },
    },
  },
  plugins: [],
}
