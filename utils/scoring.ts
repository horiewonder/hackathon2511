import { SCORE_TABLE, LINES_PER_LEVEL } from '../constants/gameConfig';

// Calculate score for line clears
export function calculateLineClearScore(
  linesCleared: number,
  level: number,
  combo: number
): number {
  let baseScore = 0;

  switch (linesCleared) {
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
    default:
      baseScore = 0;
  }

  // Apply level multiplier
  const levelScore = baseScore * level;

  // Apply combo bonus
  const comboBonus = combo > 0 ? SCORE_TABLE.COMBO_MULTIPLIER * combo * level : 0;

  return levelScore + comboBonus;
}

// Calculate soft drop score
export function calculateSoftDropScore(cellsDropped: number): number {
  return cellsDropped * SCORE_TABLE.SOFT_DROP;
}

// Calculate hard drop score
export function calculateHardDropScore(cellsDropped: number): number {
  return cellsDropped * SCORE_TABLE.HARD_DROP;
}

// Calculate level from total lines cleared
export function getLevelFromLines(totalLines: number): number {
  return Math.floor(totalLines / LINES_PER_LEVEL) + 1;
}

// Get lines needed for next level
export function getLinesForNextLevel(currentLevel: number): number {
  return currentLevel * LINES_PER_LEVEL;
}
