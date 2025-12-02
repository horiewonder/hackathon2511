// Board dimensions
export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

// Cell size (will be calculated based on screen size)
export const DEFAULT_CELL_SIZE = 28;

// Game speed (milliseconds between drops)
export const BASE_DROP_INTERVAL = 1000;

// Speed multiplier per level
export function getDropInterval(level: number): number {
  // Level 1: 1000ms, increases speed by 50ms per level, min 50ms
  return Math.max(50, BASE_DROP_INTERVAL - (level - 1) * 50);
}

// Lines required per level
export const LINES_PER_LEVEL = 10;

// Calculate level from total lines cleared
export function getLevelFromLines(totalLines: number): number {
  return Math.floor(totalLines / LINES_PER_LEVEL) + 1;
}

// Scoring
export const SCORE_TABLE = {
  SINGLE: 100,
  DOUBLE: 300,
  TRIPLE: 500,
  TETRIS: 800,
  SOFT_DROP: 1,
  HARD_DROP: 2,
  COMBO_MULTIPLIER: 50,
};

// Calculate score for line clears
export function calculateLineClearScore(lines: number, level: number, combo: number): number {
  let baseScore = 0;
  switch (lines) {
    case 1:
      baseScore = SCORE_TABLE.SINGLE;
      break;
    case 2:
      baseScore = SCORE_TABLE.DOUBLE;
      break;
    case 3:
      baseScore = SCORE_TABLE.TRIPLE;
      break;
    case 4:
      baseScore = SCORE_TABLE.TETRIS;
      break;
  }

  // Level multiplier
  const levelMultiplier = level;

  // Combo bonus
  const comboBonus = combo > 0 ? SCORE_TABLE.COMBO_MULTIPLIER * combo * level : 0;

  return baseScore * levelMultiplier + comboBonus;
}

// Preview pieces count
export const PREVIEW_COUNT = 3;

// Lock delay (ms) - time before piece locks after landing
export const LOCK_DELAY = 500;

// Auto-repeat delay for movement (ms)
export const AUTO_REPEAT_DELAY = 150;
export const AUTO_REPEAT_RATE = 50;
