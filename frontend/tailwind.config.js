export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        seacap: {
          green: "#195455",
          mist: "#648F89",
          shell: "#C7D8CD",
          slate: "#0D2223",
          gray: "#B0BBBA"
        }
      },
      fontFamily: {
        heading: ["Playfair Display", "serif"],
        body: ["Open Sans", "sans-serif"]
      }
    },
  },
  plugins: [],
}