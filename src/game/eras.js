// Colouring cards by era turns the timeline into something you can read at a
// glance: a run of warm ochre is antiquity, cool blues are the modern world.
// It also teaches era grouping for free, which a single accent colour cannot.

export const ERAS = [
  { key: 'ancient',  label: 'Ancient',       until: 500,  hue: 32,  short: 'ANC' },
  { key: 'medieval', label: 'Medieval',      until: 1450, hue: 268, short: 'MED' },
  { key: 'earlymod', label: 'Early Modern',  until: 1800, hue: 158, short: 'EMO' },
  { key: 'indust',   label: 'Industrial',    until: 1900, hue: 12,  short: 'IND' },
  { key: 'modern',   label: 'Modern',        until: 2000, hue: 205, short: 'MOD' },
  { key: 'today',    label: 'Contemporary',  until: Infinity, hue: 322, short: 'NOW' },
]

export function eraOf(year) {
  return ERAS.find((era) => year < era.until) ?? ERAS[ERAS.length - 1]
}

/** CSS custom properties a card sets so its whole treatment follows its era. */
export function eraStyle(year) {
  const { hue } = eraOf(year)
  return {
    '--era-h': hue,
    '--era-edge': `hsl(${hue} 70% 62%)`,
    '--era-glow': `hsl(${hue} 80% 60% / 0.28)`,
    '--era-wash': `hsl(${hue} 45% 22% / 0.55)`,
  }
}
