/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      // colors: {
      //   ksorange: "#E8722C",
      //   ksgold: "#F5B342",
      //   ksdark: "#0F172A",
      //   ksink: "#020617",
      // },
      // fontFamily: {
      //   sans: ["Inter", "system-ui", "sans-serif"],
      // },
      // boxShadow: {
      //   premium:
      //     "0 1px 2px rgba(15,23,42,0.04), 0 12px 32px -8px rgba(15,23,42,0.10)",
      //   glow: "0 10px 30px -8px rgba(232,114,44,0.55)",
      // },
      colors: {
  ksdark: "#0B1220",
  ksink: "#060A14",
  ksorange: "#A8832F",   // now premium gold
  ksgold: "#D4B26A",
  ksivory: "#F6F4EF",
  ksmist: "#F1EADB",
},
boxShadow: {
  premium: "0 1px 2px rgba(11,18,32,.04), 0 14px 34px -14px rgba(11,18,32,.18)",
  glow: "0 8px 22px -8px rgba(168,131,47,.55)",
},
fontFamily: {
  serif: ["'Playfair Display'", "Georgia", "serif"],
},
    },
  },
  plugins: [],
};
