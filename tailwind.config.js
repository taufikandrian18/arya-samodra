/** @type {import('tailwindcss').Config} */
// Palette sampled from the company profile PDF.
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#231f20',          // rich black — primary dark surface + body text
        'ink-2': '#2b2526',      // raised dark surface (preview frame)
        navy: '#0a1f3f',         // deep navy — project section
        terracotta: {
          DEFAULT: '#9c5338',    // brand accent on light surfaces
          light: '#c97b5c',      // accent text on dark surfaces (≥4.5:1 on ink)
          tint: '#d67456',
          blush: '#f0d3bf',      // hero italic emphasis
        },
        mist: '#f1efee',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Archivo', 'Helvetica', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      letterSpacing: {
        eyebrow: '0.16em',
        wide2: '0.22em',
        wide3: '0.3em',
      },
      transitionTimingFunction: {
        studio: 'cubic-bezier(.2,.7,.2,1)',
      },
    },
  },
  plugins: [],
};
