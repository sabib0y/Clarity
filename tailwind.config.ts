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
        // Removed heading and sans definitions as they are handled in globals.css
        mono: ['var(--font-geist-mono)', 'monospace'], // Keep Geist Mono for mono
        // Removed lexend and quicksand specific keys
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
