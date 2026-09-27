/** @type {import('tailwindcss').Config} */
// Brand tokens sampled from the company profile PDF (see docs/superpowers/specs).
const sans = ['"Space Grotesk Variable"', 'Helvetica Neue', 'Arial', 'sans-serif'];

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#0A1E3F', deep: '#06152C' },
        paper: '#FFFFFF',
        concrete: '#DAD9D7',
        slate: '#4A5160',
        haze: '#9AA3B2',
        terracotta: { DEFAULT: '#9D5338', light: '#C97B5C' },
        blush: '#F3E3D8',
      },
      fontFamily: { sans, display: sans },
      fontSize: {
        label: ['11px', { lineHeight: '1.5', letterSpacing: '0.14em', fontWeight: '500' }],
        display: ['clamp(28px,3.6vw,56px)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-xl': ['clamp(44px,min(9vw,12vh),144px)', { lineHeight: '0.9', letterSpacing: '-0.02em' }],
      },
      transitionTimingFunction: {
        studio: 'cubic-bezier(0.16,1,0.3,1)',
        lift: 'cubic-bezier(0.22,1,0.36,1)',
      },
    },
  },
  plugins: [],
};
