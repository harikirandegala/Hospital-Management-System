/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#EDF5FF',
          100: '#C2DBFF',
          200: '#94BFFF',
          300: '#4D8FFF',
          400: '#1A64E8',
          500: '#0F4AC7',
          600: '#0A35A0',
          700: '#062478',
          800: '#031651',
          900: '#010C30',
        },
        teal: {
          400: '#1D9E75',
          500: '#0F6E56',
          600: '#085041',
        },
        coral: {
          400: '#D85A30',
          500: '#993C1D',
        },
        amber: {
          400: '#BA7517',
          500: '#854F0B',
        }
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['"Sora"', 'sans-serif'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      }
    }
  },
  plugins: []
};
