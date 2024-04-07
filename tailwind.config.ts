import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        '13': 'repeat(13, minmax(0, 1fr))',
      },
      colors: {
        blue: {
          400: '#2589FE',
          500: '#0070F3',
          600: '#2F6FEB',
          700: '#2947A9'
        }
      },
    },
    keyframes: {
      slidein: {
        from: {
          opacity: "0",
          transform: "translateY(-30px)",
        },
        to: {
          opacity: "1",
          transform: "translateY(0)",
        },
      },

      fadein: {
        from: {
          opacity: "0",
        },
        to: {
          opacity: "1",
        },
      },
    },
    animation: {
      slidein: "slidein 1s ease-in-out 300ms",
      fadein: "fadein 1s ease-in-out 300ms forwards",
    }
  },
  plugins: [require('@tailwindcss/forms')],
};
export default config;
