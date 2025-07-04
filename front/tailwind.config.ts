import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out forwards',
        'blob': 'blob 7s infinite',
        'shake': 'shake 0.5s ease-in-out',
        'bounce': 'bounce 3s infinite',
        // 'fade-in': 'fadeIn 0.8s ease-in-out forwards',
      },
      keyframes: {
        bounce: {
          '0%, 100%': { transform: 'translateY(-20%)' },
          '50%': { transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        blob: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        // fadeIn: {
        //   '0%': { opacity: 0, transform: 'translate(-50%, -50%)' }, // Starts above, centered
        //   '100%': { opacity: 1, transform: 'translate(-50%, 0)' },
        // },
      },
    },
  },
  plugins: [],
};

export default config;
