/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        takaro: {
          primary: '#8B5CF6', // Purple
          'primary-hover': '#7c3aed', // Purple hover
          secondary: '#6B7280', // Gray
          'secondary-hover': '#9ca3af', // Gray hover
          success: '#10B981', // Green
          error: '#EF4444', // Red
          warning: '#fbbd23', // Warning
          info: '#3abff8', // Info
          background: '#000000', // Pure black
          card: '#1a1a1a', // Dark gray for cards
          'card-hover': '#2a2a2a', // Card hover
          border: '#374151', // Border color
          'text-primary': '#ffffff', // Primary text
          'text-secondary': '#d1d5db', // Secondary text
          'text-muted': '#9ca3af', // Muted text
        },
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        takaro: {
          primary: '#8B5CF6',
          secondary: '#6B7280',
          accent: '#8B5CF6',
          neutral: '#1a1a1a',
          'base-100': '#000000',
          info: '#3ABFF8',
          success: '#10B981',
          warning: '#FBBD23',
          error: '#EF4444',
        },
      },
    ],
  },
};
