/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f7f7f2",
        ink: "#111111",
        slate: "#667078",
        mist: "#e7e9e5",
        cloud: "#eef0ec",
        hairline: "#d7dbd5",
      },
      fontFamily: {
        body: ["Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
        display: ["Georgia", "Times New Roman", "serif"],
      },
      letterSpacing: {
        tightest: "-0.04em",
        widest2: "0.18em",
      },
      lineHeight: {
        display: "0.86",
      },
      transitionDuration: {
        250: "250ms",
      },
    },
  },
  plugins: [],
};
