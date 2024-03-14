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
        dark2: "#2D2D2D",
        light: "#EEEDFA",
        blue: "#3B9AE1",
        green: "#0AA723",
        success: "#08A081",
        error: "#EE3331",
      },
      boxShadow: {
        sidebar: "0px 2px 12px 0px #4338C91A",
        navbar: "0px 2px 20px 0px #4338C91A",
        card: "0px 2px 12px 0px rgba(241, 239, 246, 0.25)",
      },
    },
  },
  plugins: [],
};
