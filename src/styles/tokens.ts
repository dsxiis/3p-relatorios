/* Design tokens — match CSS custom properties in index.html */

export const T = {
  /* Backgrounds */
  bg: 'var(--bg)',
  surface: 'var(--surface)',
  surface2: 'var(--surface2)',

  /* Borders */
  border: 'var(--border)',
  borderHover: 'var(--border-hover)',

  /* Text */
  text: 'var(--text)',
  muted: 'var(--muted)',
  hint: 'var(--hint)',

  /* Brand */
  brand: 'var(--brand)',
  brandDim: 'var(--brand-dim)',
  brandBorder: 'var(--brand-border)',

  /* Status */
  danger: 'var(--danger)',
  dangerDim: 'var(--danger-dim)',
  green: 'var(--green)',
  greenDim: 'var(--green-dim)',
  greenBorder: 'var(--green-border)',
  amber: 'var(--amber)',
  amberDim: 'var(--amber-dim)',
} as const

/* Report slide colors (light background slides) */
export const SLIDE = {
  bg: '#fff',
  text: '#111',
  muted: '#555',
  hint: '#999',
  brand: '#8B35E8',
  brandDim: '#F0E8FF',
  borderBrand: '#EDD5FF',
  borderBrandFolks: '#D4B0FF',
  cardBg: '#FAFAFA',
  coverBg: 'linear-gradient(155deg,#06060E 0%,#1B0845 55%,#06060E 100%)',
  coverBorder: 'rgba(255,255,255,0.08)',
  coverOverlay: 'rgba(255,255,255,0.05)',
  coverBorderOverlay: 'rgba(255,255,255,0.07)',
} as const

/* Border radius scale */
export const R = {
  xs: 6,
  sm: 9,
  md: 12,
  lg: 14,
  xl: 20,
  pill: 9999,
} as const
