import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'journal-primary': '#6366f1',
        'journal-secondary': '#8b5cf6',
        'journal-accent': '#f472b6',
        'journal-background': '#faf5ff',
        'journal-background-light': '#faf5ff',
        'journal-background-dark': '#0f0a1a',
        'journal-text-light': '#1e1b4b',
        'journal-text-dark': '#e0e7ff',
        'journal-muted-light': '#6b7280',
        'journal-muted-dark': '#9ca3af',
      },
      fontFamily: {
        'serif': ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        'display': ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(99, 102, 241, 0.3)',
        'glow-lg': '0 0 40px rgba(99, 102, 241, 0.4)',
        'inner-glow': 'inset 0 2px 20px rgba(139, 92, 246, 0.1)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'mesh-light': 'radial-gradient(at 40% 20%, hsla(270,90%,95%,1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(280,90%,90%,1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(300,90%,95%,1) 0px, transparent 50%)',
        'mesh-dark': 'radial-gradient(at 40% 20%, hsla(270,50%,15%,1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(280,50%,10%,1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(300,50%,12%,1) 0px, transparent 50%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'fade-up': 'fade-up 0.5s ease-out forwards',
        'slide-in': 'slide-in 0.3s ease-out forwards',
      },
      keyframes: {
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [require('daisyui')],
  // @ts-ignore - daisyui types are not included in the tailwind types
  daisyui: {
    themes: ["light", "dark"],
  },
}

export default config 