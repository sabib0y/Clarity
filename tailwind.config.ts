import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Use font name directly now that <link> tag is used
        heading: ['Quicksand', 'sans-serif'],
        sans: ['var(--font-geist-sans)', 'sans-serif'], // Keep Geist Sans as default sans
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      // Removed duplicate backgroundImage key
    },
  },
  plugins: [],
  darkMode: false, // Explicitly disable dark mode
}
export default config
