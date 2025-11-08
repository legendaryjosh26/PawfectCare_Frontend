/** @type {import('tailwindcss').Config} */
import aspectRatio from "@tailwindcss/aspect-ratio";
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        roboto: ["Roboto", "sans-serif"],
        libre: ["LibreBaskerville", "serif"],
      },
      backgroundColor: {
        "login-bg": "#658147",
        "login-frame-bg": "#E7F0DC",
        "sidebar-bg": "#597445",
        "dashboard-bg": "#eef0ea",
        "gray-orange": "#a16f4a",
        maroon: "#560705",
      },
      colors: {
        "gray-orange": "#a16f4a",
        "light-blue": "#cad0e8",
        "light-orange": "#e9e3d8",
        "pastel gray-blue": "#a9b2d6",
        "pastel gray-orance": "#dbcdb4",
      },
      width: {
        "360px": "360px",
        "400px": "400px",
        "300px": "300px",
        "110px": "110px",
        "55px": "55px",
        "20%": "20%",
        "40%": "40%",
        "60%": "60%",
        "50%": "50%",
        "80%": "80%",
        "100%": "100%",
      },
      height: {
        "420px": "420px",
        "270px": "270px",
      },
      margin: {
        "105px": "105px",
        "50px": "50px",
      },
      keyframes: {
        scaleUp: {
          "0%": { transform: "scale(0)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      checkmark: {
        "0%": { transform: "scale(0)", opacity: "0" },
        "50%": { transform: "scale(1.2)", opacity: "1" },
        "100%": { transform: "scale(1)", opacity: "1" },
      },
      animation: {
        scaleUp: "scaleUp 0.3s ease-out forwards",
      },
    },
  },
  plugins: [aspectRatio],
};
