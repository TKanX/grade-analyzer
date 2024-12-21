/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ['./src/views/**/*.ejs', './public/**/*.html', './public/**/*.js'],
  plugins: [require('@tailwindcss/forms')],
};
