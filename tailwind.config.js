/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{vue,js}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#EE3A31",
        dark: "#474747",
        light: "#EEEDFA",
      },
      boxShadow: {
        sidebar: "0px 2px 12px 0px #4338C91A",
        navbar: "0px 2px 20px 0px #4338C91A",
      },
    },
  },
  plugins: [],
};
