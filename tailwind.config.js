/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ksorange: "#E8722C",
        ksdark: "#1a1a1a",
      },
    },
  },
  plugins: [],
}
