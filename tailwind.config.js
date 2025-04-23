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
      animation: {
        'blob': 'blob 20s infinite alternate',
        'float': 'float 6s infinite ease-in-out',
        'pulse-glow': 'pulse-glow 2s infinite',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'scale-in': 'scale-in 0.4s ease-out forwards',
        'wiggle': 'wiggle 1s ease-in-out',
        'sound-wave': 'sound-wave 1s ease-in-out infinite',
      },
      keyframes: {
        blob: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-20px)',
          },
        },
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 0 0 0 rgba(75, 107, 251, 0)',
          },
          '50%': {
            boxShadow: '0 0 15px 5px rgba(75, 107, 251, 0.3)',
          },
        },
        'fade-in': {
          'from': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'scale-in': {
          'from': {
            opacity: '0',
            transform: 'scale(0.9)',
          },
          'to': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
        wiggle: {
          '0%, 100%': {
            transform: 'rotate(-2deg)'
          },
          '50%': {
            transform: 'rotate(2deg)'
          }
        },
        'sound-wave': {
          '0%': {
            height: '3px',
            transform: 'scaleY(1)',
          },
          '50%': {
            height: '10px',
            transform: 'scaleY(1.5)',
          },
          '100%': {
            height: '3px',
            transform: 'scaleY(1)',
          },
        },
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: ["light", "dark"],
  },
} 