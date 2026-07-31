import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'app-bg': '#e2e3d3',
        'app-text': '#120b0b',
        'input-border': '#4f4040',
      },
      fontFamily: {
        poppins: ['var(--font-poppins)', 'sans-serif'],
      },
      fontSize: {
        base: '14px',
      },
    },
  },
  plugins: [],
};

export default config;