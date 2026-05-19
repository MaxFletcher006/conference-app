/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        indigo: {
          DEFAULT: '#4f46e5',
          dark:    '#4338ca',
          light:   '#eef2ff',
          mid:     '#c7d2fe',
        },
        navy: {
          900: '#080d1a',
          800: '#0f172a',
          700: '#1e293b',
        },
      },
      letterSpacing: {
        widest2: '0.1em',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
