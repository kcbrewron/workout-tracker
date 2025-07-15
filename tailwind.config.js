/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        primary: '#FB8500',
        secondary: '#219EBC',
        accent: '#8ECAE6',
        dark: '#023047',
        highlight: '#FFB703'
      }
    },
  },
  plugins: [],
}
