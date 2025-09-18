// Design tokens exported for runtime use in components
// Tokens reference CSS custom properties defined in `src/app/globals.css`.

const tokens = {
  colors: {
    primary: 'var(--color-primary)',
    primaryForeground: 'var(--color-primary-foreground)',
    secondary: 'var(--color-secondary)',
    secondaryForeground: 'var(--color-secondary-foreground)',
    accent: 'var(--color-accent)',
    accentForeground: 'var(--color-accent-foreground)',
    background: 'var(--color-background)',
    surface: 'var(--color-surface)',
    foreground: 'var(--foreground)',
    muted: 'var(--color-muted)',
    info: 'var(--color-info)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    error: 'var(--color-error)'
  },
  typography: {
    fontFamilySans: 'var(--font-family-sans)',
    fontFamilyMono: 'var(--font-family-mono)',
    fontSizeBase: 'var(--font-size-base)',
    lineHeightBase: 'var(--line-height-base)'
  },
  radius: {
    sm: 'var(--radius-sm)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
    full: 'var(--radius-full)'
  },
  shadow: {
    soft: 'var(--shadow-soft)',
    medium: 'var(--shadow-medium)',
    strong: 'var(--shadow-strong)'
  }
} as const;

export default tokens;
