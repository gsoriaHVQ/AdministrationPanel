

import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#8B1538",
          main: "#8B1538",
          light: "#A52A4A",
          dark: "#6B1028",
          contrast: "#FFFFFF",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          main: "#6B7280",
          light: "#9CA3AF",
          dark: "#374151",
          contrast: "#FFFFFF",
          foreground: "hsl(var(--secondary-foreground))",
        },
        success: {
          DEFAULT: "#10B981",
          main: "#10B981",
          light: "#34D399",
          dark: "#059669",
          contrast: "#FFFFFF",
        },
        error: {
          DEFAULT: "#EF4444",
          main: "#EF4444",
          light: "#F87171",
          dark: "#DC2626",
          contrast: "#FFFFFF",
        },
        warning: {
          DEFAULT: "#F59E0B",
          main: "#F59E0B",
          light: "#FBBF24",
          dark: "#D97706",
          contrast: "#FFFFFF",
        },
        info: {
          DEFAULT: "#3B82F6",
          main: "#3B82F6",
          light: "#60A5FA",
          dark: "#2563EB",
          contrast: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
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
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
