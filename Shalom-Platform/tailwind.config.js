// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'golden-brown': '#BF9000',
        'form-border': '##BF9000',
        'link-blue': '#BF9000',
        'light-beige': '#FFF2CC',
        'gray-text': '#5A5A5A',
        'dark-gray-text': '#333333',
        // --- הוסף את הצבעים החסרים כאן ---
        'golden-brown-dark': '#BF9000', // צבע זה לדוגמה
        'golden-brown-light': '#b8b6b6ff', // צבע זה לדוגמה
      },
      fontFamily: {
        // agencyfb: ['Agency FB', 'sans-serif'],
        // custom: ['Bahnschrift Light SemiCondensed', 'sans-serif'], // Added custom font
      },
      borderRadius: {
        'none': '0',
      },
      spacing: {
        '100': '25rem', // You might need this if you define custom heights/widths
        '120': '30rem',
        '140': '35rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    // כאן ניתן להוסיף פלאגינים נוספים אם יש לך
  ],
}
