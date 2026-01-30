import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Existing custom colors
        bg: {
          primary: '#0a0e1a',
          secondary: '#1a1f35',
          tertiary: '#252b45',
        },
        text: {
          primary: '#f0f4f8',
          secondary: '#a0aec0',
          tertiary: '#718096',
        },
        accent: {
          cyan: '#00d4ff',
          violet: '#a855f7',
          pink: '#ec4899',
          blue: '#3b82f6',
          green: '#10b981',
          red: '#ef4444',
          yellow: '#f59e0b',
        },
        // Shadcn-style tokens for React Aria components
        background: '#0a0e1a',
        foreground: '#f0f4f8',
        popover: {
          DEFAULT: '#1a1f35',
          foreground: '#f0f4f8',
        },
        muted: {
          DEFAULT: '#252b45',
          foreground: '#a0aec0',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#f0f4f8',
        },
        border: 'rgba(255, 255, 255, 0.1)',
        input: 'rgba(255, 255, 255, 0.1)',
        ring: '#00d4ff',
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 212, 255, 0.3)',
        'glow-cyan-lg': '0 0 40px rgba(0, 212, 255, 0.5)',
        'glow-violet': '0 0 20px rgba(168, 85, 247, 0.3)',
        'glow-violet-lg': '0 0 40px rgba(168, 85, 247, 0.5)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #00d4ff 0%, #a855f7 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
