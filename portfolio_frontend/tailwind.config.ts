import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}'
  ],
  darkMode: 'media',
  theme: {
    extend: {}
  },
  plugins: []
}

export default config
