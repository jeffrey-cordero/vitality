import type { Config } from "tailwindcss";

const config: Config = {
   content: [
      "./components/**/*.{js,ts,jsx,tsx,mdx}",
      "./app/**/*.{js,ts,jsx,tsx,mdx}"
   ],
   theme: {
      extend: {
         colors: {
            primary: "#2563EB"
         },
         keyframes: {
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
            fadeIn: "fadeIn 700ms ease-in-out forwards",
            fadeOut: "fadeOut 700ms ease-in-out forwards"
         }
      }
   },
   plugins: [require("@tailwindcss/forms")]
};
export default config;