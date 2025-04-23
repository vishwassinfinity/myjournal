import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'journal-primary': '#4B6BFB',
        'journal-secondary': '#7B92FF',
        'journal-accent': '#F97316',
        'journal-background': '#F8F9FA',
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