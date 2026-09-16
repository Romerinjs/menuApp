import { ColorPalette } from '../types/restaurant';

export const PRESET_PALETTES: ColorPalette[] = [
  {
    id: 'citrus-flame',
    name: 'Cítrico & Fuego',
    primary: '#ff5722',
    secondary: '#ff9800',
    accent: '#f59e0b',
    gradient: 'linear-gradient(135deg, #ff5722, #f59e0b)'
  },
  {
    id: 'crimson-luxe',
    name: 'Cereza & Pasión',
    primary: '#ef4444',
    secondary: '#f43f5e',
    accent: '#fb7185',
    gradient: 'linear-gradient(135deg, #ef4444, #be123c)'
  },
  {
    id: 'amber-sunset',
    name: 'Ámbar Cálido & Parrilla',
    primary: '#f59e0b',
    secondary: '#d97706',
    accent: '#fbbf24',
    gradient: 'linear-gradient(135deg, #f59e0b, #b45309)'
  },
  {
    id: 'emerald-gourmet',
    name: 'Esmeralda & Orgánico',
    primary: '#10b981',
    secondary: '#059669',
    accent: '#34d399',
    gradient: 'linear-gradient(135deg, #10b981, #047857)'
  },
  {
    id: 'electric-blue',
    name: 'Azul Moderno & Mar',
    primary: '#3b82f6',
    secondary: '#2563eb',
    accent: '#60a5fa',
    gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
  },
  {
    id: 'royal-violet',
    name: 'Violeta Imperial & Coctelería',
    primary: '#8b5cf6',
    secondary: '#7c3aed',
    accent: '#a78bfa',
    gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)'
  },
  {
    id: 'neon-rose',
    name: 'Rosa Contemporáneo',
    primary: '#ec4899',
    secondary: '#db2777',
    accent: '#f472b6',
    gradient: 'linear-gradient(135deg, #ec4899, #be185d)'
  }
];

/**
 * Genera una paleta armónica a partir de un solo color hexadecimal
 */
export function generateHarmoniousPalette(primaryHex: string, name = 'Personalizada'): ColorPalette {
  const clean = primaryHex.startsWith('#') ? primaryHex : `#${primaryHex}`;
  return {
    id: `custom-${Date.now()}`,
    name,
    primary: clean,
    secondary: adjustColorBrightness(clean, -25),
    accent: adjustColorBrightness(clean, 35),
    gradient: `linear-gradient(135deg, ${clean}, ${adjustColorBrightness(clean, -20)})`
  };
}

/**
 * Ajusta el brillo de un color HEX
 */
function adjustColorBrightness(hex: string, percent: number): string {
  let num = parseInt(hex.replace('#', ''), 16);
  if (isNaN(num)) return hex;

  let r = (num >> 16) + Math.round(2.55 * percent);
  let g = ((num >> 8) & 0x00ff) + Math.round(2.55 * percent);
  let b = (num & 0x0000ff) + Math.round(2.55 * percent);

  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
