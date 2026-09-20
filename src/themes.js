// Catalog of selectable app-wide color themes. Each preset's `swatches` are fixed
// reference hex values (for rendering the picker's preview dots) — they mirror, but are
// independent of, the live CSS variables defined for that theme in index.css.
export const THEME_PRESETS = [
  {
    id: 'classic',
    nameKey: 'theme.classic.name',
    descKey: 'theme.classic.desc',
    swatches: { background: '#f9f9ff', primary: '#003441', accent: '#9acee1' },
  },
  {
    id: 'blush',
    nameKey: 'theme.blush.name',
    descKey: 'theme.blush.desc',
    swatches: { background: '#fff8fa', primary: '#a6446b', accent: '#8a6d3e' },
  },
  {
    id: 'onyx',
    nameKey: 'theme.onyx.name',
    descKey: 'theme.onyx.desc',
    swatches: { background: '#17181a', primary: '#4fa8a0', accent: '#8b95a3' },
  },
  {
    id: 'sand',
    nameKey: 'theme.sand.name',
    descKey: 'theme.sand.desc',
    swatches: { background: '#fbf6ef', primary: '#b5673a', accent: '#6e7048' },
  },
  {
    id: 'americana',
    nameKey: 'theme.americana.name',
    descKey: 'theme.americana.desc',
    swatches: { background: '#fafbff', primary: '#1e3a8a', accent: '#b91c1c' },
  },
  {
    id: 'noir-gold',
    nameKey: 'theme.noirGold.name',
    descKey: 'theme.noirGold.desc',
    swatches: { background: '#0e0d0a', primary: '#c9a227', accent: '#a08f6e' },
  },
]
