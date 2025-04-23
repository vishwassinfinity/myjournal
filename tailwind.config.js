/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'journal-primary': '#4B6BFB',
        'journal-secondary': '#7B92FF',
        'journal-accent': '#F97316',
        'journal-background': {
          light: '#F8F9FA',
          dark: '#121927'
        },
        'journal-card': {
          light: '#FFFFFF',
          dark: '#1E293B'
        },
        'journal-text': {
          light: '#333333',
          dark: '#E1E7EF'
        },
        'journal-muted': {
          light: '#6B7280',
          dark: '#94A3B8'
        }
      },
      maxWidth: {
        '4xl': '56rem',
        '3xl': '48rem',
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: ["light", "dark"],
  },
} 