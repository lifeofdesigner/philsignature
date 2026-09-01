export const luxuryTokens = {
  colors: {
    black: '#0D0D0D',
    charcoal: '#161616',
    graphite: '#222222',
    card: '#181818',
    border: '#2A2A2A',
    gold: {
      default: '#C5A880',
      light: '#DEC5A2',
      dark: '#A6885E',
      muted: '#8E734F',
    },
    cream: {
      default: '#FAF8F5',
      soft: '#F4F0EA',
      dim: '#E8E2D7',
    },
    sand: '#D5CCBF',
    muted: '#88847D',
  },
  typography: {
    serif: 'Cormorant Garamond, Cinzel, Playfair Display, serif',
    sans: 'Plus Jakarta Sans, Inter, sans-serif',
    mono: 'JetBrains Mono, monospace',
  },
  transition: {
    smooth: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
    fast: 'all 0.2s ease-out',
  },
  shadows: {
    luxurySubtle: '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
    goldGlow: '0 0 25px rgba(197, 168, 128, 0.12)',
  },
} as const;

