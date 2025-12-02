// Splatoon-inspired color palette
export const SPLATOON_COLORS = {
  // Main vibrant colors
  pink: '#FF6090',
  green: '#7CFC00',
  cyan: '#00F5FF',
  orange: '#FF9800',
  purple: '#B388FF',
  yellow: '#FFEB3B',
  blue: '#2196F3',

  // Tetromino colors (Splatoon style)
  tetromino: {
    I: '#00F5FF', // Cyan
    O: '#FFEB3B', // Yellow
    T: '#B388FF', // Purple
    S: '#7CFC00', // Green
    Z: '#FF6090', // Pink
    J: '#2196F3', // Blue
    L: '#FF9800', // Orange
  } as const,

  // UI colors
  background: '#1A1A2E',
  boardBackground: '#16213E',
  boardBorder: '#0F3460',
  gridLine: 'rgba(255, 255, 255, 0.1)',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#E8E8E8',
  textAccent: '#00F5FF',

  // Ghost piece
  ghost: 'rgba(255, 255, 255, 0.3)',

  // Button colors
  buttonActive: '#FF6090',
  buttonDefault: '#2A2A4E',
  buttonBorder: '#FF6090',
};

// Get tetromino color by type
export function getTetrominoColor(type: keyof typeof SPLATOON_COLORS.tetromino): string {
  return SPLATOON_COLORS.tetromino[type];
}

// Lighten a color
export function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent * 100);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00ff) + amt);
  const B = Math.min(255, (num & 0x0000ff) + amt);
  return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
}

// Darken a color
export function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent * 100);
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, ((num >> 8) & 0x00ff) - amt);
  const B = Math.max(0, (num & 0x0000ff) - amt);
  return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
}
