// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        seben: {
          // Primary - Deep masculine tones
          black: '#0A0A0A',
          charcoal: '#1A1A1A',
          graphite: '#2D2D2D',
          slate: '#3D3D3D',
          
          // Accent - Rich gold
          gold: '#C9A962',
          'gold-light': '#D4BC7E',
          'gold-dark': '#A68B4B',
          
          // Neutral
          cream: '#F5F3EF',
          'cream-dark': '#E8E4DC',
          stone: '#9A9A9A',
          
          // Status colors
          success: '#2D5A27',
          error: '#8B2635',
          warning: '#8B6914',
        }
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'serif'],
        sans: ['Inter', 'sans-serif'],
        display: ['Bebas Neue', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gold-shimmer': 'linear-gradient(110deg, #C9A962 0%, #E8D5A3 25%, #C9A962 50%, #E8D5A3 75%, #C9A962 100%)',
      },
    },
  },
  plugins: [],
}