export type MetricCardVariant =
  | 'filled'       // filled background card (default)
  | 'left-border'  // white card + thick colored left stripe
  | 'top-accent'   // white card + thin colored top edge
  | 'outline'      // transparent bg, border only (ultra-minimal)

export type SectionLabelStyle =
  | 'badge'        // colored bg pill
  | 'underline'    // text with colored bottom border
  | 'dot'          // colored bullet dot + uppercase text
  | 'rule'         // text left + full-width horizontal rule

export interface SlideTheme {
  id: string
  name: string
  description: string
  emoji: string
  previewGradient: string   // for gallery cards

  // Cover
  coverBg: string
  coverAccentColor: string
  coverBarGradient: string
  coverTitleColor: string
  coverSubColor: string
  coverBadgeBg: string
  coverBadgeText: string

  // Light slides
  slideBg: string
  slideText: string
  slideMuted: string
  slideHint: string
  slideBorder: string
  slideCardBg: string
  slideCardBorderAccent: string

  // Dark slides (FranqueadoraSlide, etc.)
  darkSlideBg: string
  darkSlideText: string
  darkSlideMuted: string
  darkSlideBorder: string
  darkSlideCardBg: string

  // Accent
  accent: string
  accentDim: string
  accentBorder: string
  accentText: string

  // Secondary accent (leads/conversas)
  accentGreen: string
  accentGreenDim: string

  // Tag/badge label color
  labelColor: string

  // Design pattern tokens
  cardRadius: number
  metricCardVariant: MetricCardVariant
  sectionLabelStyle: SectionLabelStyle
  slidePaddingX: number   // horizontal padding of slides
  metricValueSize: number // font-size for the big number in metric cards
}

// ── 1. Dark Premium (purple neon + dark) ──────────────────────────
export const darkPremium: SlideTheme = {
  id: 'dark-premium',
  name: 'Dark Premium',
  description: 'Elegante e moderno. Cards preenchidos com roxo neon.',
  emoji: '🌑',
  previewGradient: 'linear-gradient(135deg, #0f0f1a 0%, #1a1040 60%, #8B35E8 100%)',

  coverBg: 'linear-gradient(135deg, #0a0a18 0%, #1a0845 60%, #250b5e 100%)',
  coverAccentColor: '#8833ff',
  coverBarGradient: 'linear-gradient(90deg, #8833ff, #5B18A8, transparent)',
  coverTitleColor: '#ffffff',
  coverSubColor: '#888',
  coverBadgeBg: 'rgba(136,51,255,0.15)',
  coverBadgeText: '#8833ff',

  slideBg: '#ffffff',
  slideText: '#1a1a2e',
  slideMuted: '#6b7280',
  slideHint: '#9ca3af',
  slideBorder: '#e5e7eb',
  slideCardBg: '#f9fafb',
  slideCardBorderAccent: '#8833ff',

  darkSlideBg: '#0f0f1a',
  darkSlideText: '#e8e8e8',
  darkSlideMuted: '#888',
  darkSlideBorder: '#2e2e50',
  darkSlideCardBg: '#1a1a2e',

  accent: '#8833ff',
  accentDim: 'rgba(136,51,255,0.10)',
  accentBorder: '#c084fc',
  accentText: '#8833ff',

  accentGreen: '#10b981',
  accentGreenDim: 'rgba(16,185,129,0.12)',

  labelColor: '#8833ff',
  cardRadius: 8,
  metricCardVariant: 'filled',
  sectionLabelStyle: 'badge',
  slidePaddingX: 40,
  metricValueSize: 46,
}

// ── 2. Sunrise (editorial warm — left-border cards) ────────────
export const sunrise: SlideTheme = {
  id: 'sunrise',
  name: 'Sunrise',
  description: 'Editorial e quente. Cards com borda lateral âmbar.',
  emoji: '🌅',
  previewGradient: 'linear-gradient(135deg, #1c0900 0%, #7c2d12 60%, #f59e0b 100%)',

  coverBg: 'linear-gradient(135deg, #1c0900 0%, #451a03 55%, #7c2d12 100%)',
  coverAccentColor: '#f59e0b',
  coverBarGradient: 'linear-gradient(90deg, #f59e0b, #d97706, transparent)',
  coverTitleColor: '#ffffff',
  coverSubColor: '#a16207',
  coverBadgeBg: 'rgba(245,158,11,0.18)',
  coverBadgeText: '#fcd34d',

  slideBg: '#fffcf7',
  slideText: '#1c0900',
  slideMuted: '#78350f',
  slideHint: '#92400e',
  slideBorder: '#fde68a',
  slideCardBg: '#ffffff',
  slideCardBorderAccent: '#f59e0b',

  darkSlideBg: '#1c0900',
  darkSlideText: '#fef3c7',
  darkSlideMuted: '#92400e',
  darkSlideBorder: '#451a03',
  darkSlideCardBg: '#2d0f00',

  accent: '#f59e0b',
  accentDim: 'rgba(245,158,11,0.10)',
  accentBorder: '#fcd34d',
  accentText: '#d97706',

  accentGreen: '#16a34a',
  accentGreenDim: 'rgba(22,163,74,0.12)',

  labelColor: '#d97706',
  cardRadius: 6,
  metricCardVariant: 'left-border',
  sectionLabelStyle: 'underline',
  slidePaddingX: 40,
  metricValueSize: 48,
}

// ── 3. Ocean (corporate blue — top-accent cards) ──────────────
export const ocean: SlideTheme = {
  id: 'ocean',
  name: 'Ocean',
  description: 'Corporativo e data-driven. Borda superior + marcador.',
  emoji: '🌊',
  previewGradient: 'linear-gradient(135deg, #000d1f 0%, #0c1a3d 60%, #0ea5e9 100%)',

  coverBg: 'linear-gradient(135deg, #000d1f 0%, #0c1a3d 55%, #0a2550 100%)',
  coverAccentColor: '#38bdf8',
  coverBarGradient: 'linear-gradient(90deg, #0ea5e9, #0284c7, transparent)',
  coverTitleColor: '#ffffff',
  coverSubColor: '#64748b',
  coverBadgeBg: 'rgba(14,165,233,0.15)',
  coverBadgeText: '#38bdf8',

  slideBg: '#f8fbff',
  slideText: '#0c1a3d',
  slideMuted: '#475569',
  slideHint: '#64748b',
  slideBorder: '#bae6fd',
  slideCardBg: '#ffffff',
  slideCardBorderAccent: '#0ea5e9',

  darkSlideBg: '#000d1f',
  darkSlideText: '#e0f2fe',
  darkSlideMuted: '#475569',
  darkSlideBorder: '#0c2550',
  darkSlideCardBg: '#0c1a3d',

  accent: '#0ea5e9',
  accentDim: 'rgba(14,165,233,0.08)',
  accentBorder: '#7dd3fc',
  accentText: '#0284c7',

  accentGreen: '#059669',
  accentGreenDim: 'rgba(5,150,105,0.10)',

  labelColor: '#0284c7',
  cardRadius: 4,
  metricCardVariant: 'top-accent',
  sectionLabelStyle: 'dot',
  slidePaddingX: 36,
  metricValueSize: 46,
}

// ── 4. Emerald (growth green — filled rounded) ─────────────────
export const emerald: SlideTheme = {
  id: 'emerald',
  name: 'Emerald',
  description: 'Crescimento e resultado. Cards arredondados, verde vibrante.',
  emoji: '💎',
  previewGradient: 'linear-gradient(135deg, #020c07 0%, #064e3b 60%, #10b981 100%)',

  coverBg: 'linear-gradient(135deg, #020c07 0%, #022c1e 55%, #064e3b 100%)',
  coverAccentColor: '#34d399',
  coverBarGradient: 'linear-gradient(90deg, #10b981, #059669, transparent)',
  coverTitleColor: '#ffffff',
  coverSubColor: '#065f46',
  coverBadgeBg: 'rgba(52,211,153,0.15)',
  coverBadgeText: '#34d399',

  slideBg: '#f7fffe',
  slideText: '#022c1e',
  slideMuted: '#065f46',
  slideHint: '#047857',
  slideBorder: '#a7f3d0',
  slideCardBg: '#ecfdf5',
  slideCardBorderAccent: '#10b981',

  darkSlideBg: '#020c07',
  darkSlideText: '#d1fae5',
  darkSlideMuted: '#065f46',
  darkSlideBorder: '#064e3b',
  darkSlideCardBg: '#022c1e',

  accent: '#10b981',
  accentDim: 'rgba(16,185,129,0.12)',
  accentBorder: '#6ee7b7',
  accentText: '#059669',

  accentGreen: '#10b981',
  accentGreenDim: 'rgba(16,185,129,0.12)',

  labelColor: '#059669',
  cardRadius: 12,
  metricCardVariant: 'filled',
  sectionLabelStyle: 'badge',
  slidePaddingX: 40,
  metricValueSize: 48,
}

// ── 5. Mono Pro (ultra-minimal B&W — outline cards) ────────────
export const monoPro: SlideTheme = {
  id: 'mono-pro',
  name: 'Mono Pro',
  description: 'Ultra-minimal. Cards em outline, tipografia limpa.',
  emoji: '⬛',
  previewGradient: 'linear-gradient(135deg, #0a0a0a 0%, #1f1f1f 60%, #555 100%)',

  coverBg: 'linear-gradient(135deg, #060606 0%, #111 55%, #1c1c1c 100%)',
  coverAccentColor: '#e5e5e5',
  coverBarGradient: 'linear-gradient(90deg, #ffffff, #888, transparent)',
  coverTitleColor: '#ffffff',
  coverSubColor: '#666',
  coverBadgeBg: 'rgba(255,255,255,0.08)',
  coverBadgeText: '#ccc',

  slideBg: '#ffffff',
  slideText: '#111',
  slideMuted: '#555',
  slideHint: '#999',
  slideBorder: '#e5e5e5',
  slideCardBg: '#ffffff',
  slideCardBorderAccent: '#111',

  darkSlideBg: '#0a0a0a',
  darkSlideText: '#e5e5e5',
  darkSlideMuted: '#888',
  darkSlideBorder: '#222',
  darkSlideCardBg: '#111',

  accent: '#111111',
  accentDim: 'rgba(0,0,0,0.04)',
  accentBorder: '#555',
  accentText: '#111',

  accentGreen: '#2d7a4f',
  accentGreenDim: 'rgba(45,122,79,0.08)',

  labelColor: '#111',
  cardRadius: 2,
  metricCardVariant: 'outline',
  sectionLabelStyle: 'rule',
  slidePaddingX: 44,
  metricValueSize: 50,
}

export const ALL_THEMES: SlideTheme[] = [darkPremium, sunrise, ocean, emerald, monoPro]

export function getThemeById(id: string): SlideTheme {
  return ALL_THEMES.find(t => t.id === id) ?? darkPremium
}
