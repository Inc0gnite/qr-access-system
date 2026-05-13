/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Paleta principal del sistema
        bg: {
          primary: '#0f1117',
          secondary: '#181b24',
          card: '#1e2130',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.07)',
        },
        text: {
          primary: '#e8eaf0',
          secondary: '#8a8fa8',
        },
        accent: {
          DEFAULT: '#8b5cf6',
          hover: '#7c3aed',
          light: 'rgba(139,92,246,0.15)',
        },
        // Estados
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6',
      },
      fontFamily: {
        sans: ['Inter', 'DM Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        component: '8px',
        card: '12px',
      },
      borderWidth: {
        DEFAULT: '0.5px',
        '1': '1px',
      },
    },
  },
  plugins: [],
};
