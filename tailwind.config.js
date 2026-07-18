/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        ibm: ['IBM Plex Mono', 'monospace'],
        playfair: ['"Playfair Display"', 'serif'],
        greatvibes: ['"Great Vibes"', 'cursive'],
      },
      colors: {
        sgreen: '#006B0B',
        bgreen: '#003B06',
        gold: '#FFD700',
      },
      boxShadow: {
        'inner-green': 'inset 0 -1px 8px rgba(195, 255, 142, 0.7)',
        'inner-hgreen': 'inset 0 -4px 16px rgba(195, 255, 142, 0.7)',
        'inner-wsgreen': 'inset 0 -1px 8px rgba(0, 128, 0, 0.6)',
      },
    },
  },
  plugins: [],
};