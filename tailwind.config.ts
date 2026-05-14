import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        purple: {
          50: '#EEEDFE',
          100: '#CECBF6',
          200: '#AFA9EC',
          400: '#7F77DD',
          600: '#534AB7',
          800: '#3C3489',
          900: '#26215C',
        },
        coral: {
          50: '#FAECE7',
          400: '#D85A30',
          600: '#993C1D',
        },
        success: {
          DEFAULT: '#1D9E75',
          bg: '#E1F5EE',
        },
        warning: {
          DEFAULT: '#BA7517',
          bg: '#FAEEDA',
        },
        danger: {
          DEFAULT: '#E24B4A',
          bg: '#FCEBEB',
        },
        gray: {
          50: '#FAFAF8',
          100: '#F1EFE8',
          200: '#D3D1C7',
          400: '#888780',
          600: '#5F5E5A',
          800: '#444441',
          900: '#2C2C2A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '10px',
        lg: '16px',
      },
    },
  },
  plugins: [],
};

export default config;
