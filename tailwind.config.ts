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
        primary: "#2947A9"
      },
    },
    keyframes: {
      slideIn: {
        from: {
          opacity: "0",
          transform: "translateY(-30px)",
        },
        to: {
          opacity: "1",
          transform: "translateY(0)",
        },
      },

      fadeIn: {
        from: {
          opacity: "0",
        },
        to: {
          opacity: "1",
        },
      },
      fadeOut: {
        from: {
          opacity: "1",
        },
        to: {
          opacity: "0",
        },
      },
      notificationIn: {
        from: {
          position: "fixed",
          top: "-15rem", 
          left: "50%",
          transform: "translateX(-50%) translateY(-50%)",
        },
        to: {
          position: "fixed",
          top: "7.5rem", 
          left: "50%",
          transform: "translateX(-50%) translateY(-50%)",
        },
      },
    },
    notificationOut: {
      from: {
        position: "fixed",
        top: "7.5rem", 
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
      },
      to: {
        position: "fixed",
        top: "-15rem", 
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
      },
    },
    animation: {
      slideIn: "slideIn 1s ease-in-out 300ms",
      fadeIn: "fadeIn 1s ease-in-out 300ms forwards",
      fadeOut: "fadeOut 1s ease-in-out 300ms forwards",
      notificationIn: "notificationIn 1.5s ease-in-out 300ms forwards",
      notificationOut: "notificationOut 1.5s ease-in-out 300ms forwards",
    }
  },
  plugins: [require('@tailwindcss/forms')],
};
export default config;
