/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    fontSize: {
      tiny: '1rem',
      small: '1.2rem',
      medium: '1.325rem',
      'medium-large': '1.45rem',
      large: '2.425rem',
      huge: '4rem',
    },
    borderRadius: {
      small: '0.25rem',
      medium: '0.5rem',
      large: '0.8rem',
    },
    extend: {
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' }
        }
      },
      colors: {
        // Light theme colors
        'primary': '#664de5',
        'primary-shade': '#332775', // Using the shade(0.5) equivalent
        'secondary': '#030917',
        'placeholder': '#f5f5f5',
        'placeholder-highlight': '#ffffff',
        'shade': '#eaf8f0',
        'background': '#f9f9f9',
        'background-alt': '#e9e9e9',
        'background-accent': '#353535',
        'disabled': '#151515',
        'text': '#030303',
        'text-alt': '#636363',
        'info': '#664de5',
        'success': '#3ccd6A',
        'warning': '#f57c00',
        'error': '#ff4252',

        // Dark theme colors
        'dark': {
          'primary': '#664DE5',
          'primary-shade': '#332775',
          'secondary': '#353535',
          'placeholder': '#202020',
          'placeholder-highlight': '#303030',
          'shade': '#eaf8f0',
          'text': '#c2c2c2',
          'text-alt': '#818181',
          'background': '#080808',
          'background-alt': '#121212',
          'background-accent': '#353535',
          'disabled': '#151515',
          'info': '#664de5',
          'success': '#3ccd6A',
          'warning': '#f57c00',
          'error': '#ff4252',
        },
      },
    },
  },
  plugins: [],
}