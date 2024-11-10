import type { Config } from "tailwindcss";

const config: Config = {
   content: [
      "./pages/**/*.{js,ts,jsx,tsx,mdx}",
      "./components/**/*.{js,ts,jsx,tsx,mdx}",
      "./app/**/*.{js,ts,jsx,tsx,mdx}"
   ],
   theme: {
      extend: {
         gridTemplateColumns: {
            "13": "repeat(13, minmax(0, 1fr))"
         },
         colors: {
            primary: "#2563EB"
         },
         keyframes: {
            slideIn: {
               from: {
                  opacity: "0",
                  transform: "translateY(-30px)"
               },
               to: {
                  opacity: "1",
                  transform: "translateY(0)"
               }
            },
            fadeIn: {
               from: {
                  opacity: "0"
               },
               to: {
                  opacity: "1"
               }
            },
            fadeOut: {
               from: {
                  opacity: "1"
               },
               to: {
                  opacity: "0"
               }
            }
         },
         animation: {
            slideIn: "slideIn 1s ease-in-out",
            fadeIn: "fadeIn 700ms ease-in-out forwards",
            fadeOut: "fadeOut 700ms ease-in-out forwards"
         }
      }
   },
   plugins: [require("@tailwindcss/forms")]
};
export default config;
