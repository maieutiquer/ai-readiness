import { type Config } from "tailwindcss";
// import "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
import animate from "tailwindcss-animate";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...defaultTheme.fontFamily.sans],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      animation: {
        "gradient-pulse": "gradient-rainbow 6s linear infinite",
        "button-glow": "button-glow 6s linear infinite",
      },
      keyframes: {
        "gradient-rainbow": {
          "0%": {
            "background-size": "200% 200%",
            "background-position": "0% 50%",
            "text-shadow": "0 0 30px rgba(37, 99, 235, 0.7)",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "100% 50%",
            "text-shadow": "0 0 30px rgba(239, 68, 68, 0.7)",
          },
          "100%": {
            "background-size": "200% 200%",
            "background-position": "0% 50%",
            "text-shadow": "0 0 30px rgba(37, 99, 235, 0.7)",
          },
        },
        "button-glow": {
          "0%": {
            "background-size": "200% 200%",
            "background-position": "0% 50%",
            "box-shadow": "0 0 30px rgba(37, 99, 235, 0.9)",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "100% 50%",
            "box-shadow": "0 0 30px rgba(239, 68, 68, 0.9)",
          },
          "100%": {
            "background-size": "200% 200%",
            "background-position": "0% 50%",
            "box-shadow": "0 0 30px rgba(37, 99, 235, 0.9)",
          },
        },
      },
    },
  },
  plugins: [animate],
  darkMode: "class",
} satisfies Config;
