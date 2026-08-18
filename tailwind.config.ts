// /* eslint-disable unicorn/prefer-module */
import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          500: "rgb(113, 65, 248)",
          400: "rgb(141, 103, 250)",
          300: "rgb(170, 141, 251)",
          200: "rgb(198, 179, 252)",
          100: "rgb(227, 217, 254)",
          50: "rgb(243, 241, 255)",
        },
        blue: {
          500: "#303073",
          400: "#393988",
          300: "#3E3E93",
          200: "#5F5FE1",
          100: "#4A4AAF",
          50: "#BABAFB",
        },
        secondary: {
          500: "rgb(33, 160, 160)",
          400: "rgb(77, 179, 179)",
          300: "rgb(122, 198, 198)",
          200: "rgb(166, 217, 217)",
          100: "rgb(211, 236, 236)",
        },
        tertiary: {
          500: "rgb(0, 200, 194)",
          400: "rgb(51, 211, 206)",
          300: "rgb(102, 222, 219)",
          200: "rgb(153, 233, 231)",
          100: "rgb(204, 244, 243)",
        },
        alert: {
          500: "rgb(229, 61, 0)",
          400: "rgb(234, 100, 51)",
          300: "rgb(239, 139, 102)",
          200: "rgb(245, 177, 153)",
          100: "rgb(250, 216, 204)",
        },
        accent: {
          500: "rgb(255, 233, 0)",
          400: "rgb(255, 237, 51)",
          300: "rgb(255, 242, 102)",
          200: "rgb(255, 246, 153)",
          100: "rgb(255, 251, 204)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      backgroundImage: {
        "main-gradient": "linear-gradient(180deg, #8860F8 0%, #7141F8 100%)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
        slideInRight: {
          from: {
            transform: "translateX(100%)",
            opacity: "0",
          },
          to: {
            transform: "translateX(0)",
            opacity: "1",
          },
        },
        pulseCard: {
          "0%, 100%": {
            opacity: "1",
            boxShadow: "0 0 0 0 rgba(251, 146, 60, 0.7)",
            transform: "scale(1)",
          },
          "50%": {
            opacity: "0.92",
            boxShadow: "0 0 16px 8px rgba(251, 146, 60, 0.25)",
            transform: "scale(1.03)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        blob: "blob 7s infinite",
        blink: "blink 1s step-start 0s infinite",
        pulseCard: "pulseCard 1.2s cubic-bezier(0.4,0,0.6,1) infinite",
      },
      screens: {
        "max-sm-custom": { max: "500px" },
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;

export default config;
