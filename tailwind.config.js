/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '3rem',
        xl: '4rem',
        '2xl': '5rem',
      },
      screens: {
        '2xl': '1440px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Luxury Philz Signature palette tokens with dynamic theme switching
        luxury: {
          black: 'rgb(var(--luxury-black) / <alpha-value>)',
          charcoal: 'rgb(var(--luxury-charcoal) / <alpha-value>)',
          graphite: 'rgb(var(--luxury-graphite) / <alpha-value>)',
          card: 'rgb(var(--luxury-card) / <alpha-value>)',
          border: 'rgb(var(--luxury-border) / <alpha-value>)',
          gold: {
            DEFAULT: 'rgb(var(--luxury-gold) / <alpha-value>)',
            light: 'rgb(var(--luxury-gold-light) / <alpha-value>)',
            dark: 'rgb(var(--luxury-gold-dark) / <alpha-value>)',
            muted: '#8E734F',
          },
          cream: {
            DEFAULT: 'rgb(var(--luxury-cream) / <alpha-value>)',
            soft: 'rgb(var(--luxury-cream-soft) / <alpha-value>)',
            dim: 'rgb(var(--luxury-cream-dim) / <alpha-value>)',
          },
          sand: 'rgb(var(--luxury-sand) / <alpha-value>)',
          muted: 'rgb(var(--luxury-muted) / <alpha-value>)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Cinzel', 'Playfair Display', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      letterSpacing: {
        luxury: '0.2em',
        'luxury-wide': '0.3em',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-out': {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(8px)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-out': 'fade-out 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};

