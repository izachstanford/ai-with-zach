/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cyber-blue': '#00f5ff',
        'cyber-purple': '#8b5cf6',
        'cyber-pink': '#f472b6',
        'cyber-green': '#10b981',
        'neon-blue': '#00e5ff',
        'neon-purple': '#a855f7',
        'dark-bg': '#0a0a0a',
        'card-bg': '#1a1a1a',
        'border-glow': '#2a2a2a'
      },
      fontFamily: {
        'cyber': ['Orbitron', 'monospace'],
        'modern': ['Inter', 'sans-serif']
      },
      animation: {
        'pulse-slow': 'pulse 3s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'slide-in': 'slideIn 0.5s ease-out'
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #00f5ff' },
          '100%': { boxShadow: '0 0 20px #00f5ff, 0 0 30px #00f5ff' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-5px)' }
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0px)' }
        }
      }
    },
  },
  plugins: [],
}
