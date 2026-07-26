import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./store/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "hsl(var(--primary))",
        "primary-container": "hsl(var(--primary-container))",
        "sage-deep": "hsl(var(--primary))",
        secondary: "hsl(var(--secondary))",
        surface: "hsl(var(--background))",
        "surface-card": "hsl(var(--card))",
        "on-surface": "hsl(var(--foreground))",
        "on-surface-variant": "hsl(var(--muted-foreground))",
        ink: "hsl(var(--foreground))",
        "surface-container": "hsl(var(--muted))",
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        info: "hsl(var(--info))",
        rose: "hsl(var(--rose))",
        honey: "hsl(var(--honey))",
        lavender: "hsl(var(--lavender))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        }
      },
      boxShadow: {
        soft:
          "0 1px 2px rgba(43, 58, 53, 0.04), 0 10px 30px rgba(96, 70, 79, 0.08)",
        hover:
          "0 2px 6px rgba(43, 58, 53, 0.06), 0 20px 44px rgba(96, 70, 79, 0.14)",
        floating:
          "0 24px 70px rgba(67, 45, 54, 0.18)",
      },
      fontFamily: {
        sans: ["Be Vietnam Pro", "system-ui", "sans-serif"],
        body: ["Be Vietnam Pro", "sans-serif"],
        headline: ["Nunito", "Quicksand", "sans-serif"]
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-container)) 100%)",
        "warm-gradient":
          "linear-gradient(135deg, hsl(var(--secondary)) 0%, hsl(var(--accent)) 100%)",
        "soft-gradient":
          "linear-gradient(135deg, hsl(var(--rose) / .58) 0%, hsl(var(--honey) / .54) 48%, hsl(var(--lavender) / .55) 100%)",
      }
    }
  },
  plugins: []
};

export default config;
