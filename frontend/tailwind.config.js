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
        outfit: ['Outfit', 'sans-serif'],
      },
      colors: {
        upf: {
          primary: '#1a3b8c',     // Navy Blue from logo
          primaryLight: '#2c52b0', // Lighter shade for hover
          accent: '#a41c64',      // Magenta from logo
          accentLight: '#c2277a', // Lighter magenta
        },
        semantic: {
          success: '#10b981', // Emerald 500
          warning: '#f59e0b', // Amber 500
          danger: '#ef4444',  // Red 500
          info: '#3b82f6',    // Blue 500
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-hover': '0 8px 32px 0 rgba(31, 38, 135, 0.12)',
      }
    },
  },
  plugins: [],
}
