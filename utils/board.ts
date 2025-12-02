import { GameBoard, Cell, ActiveTetromino } from '../types/game';
import { BOARD_WIDTH, BOARD_HEIGHT } from '../constants/gameConfig';
import { getTetrominoShape, getTetrominoColor } from '../constants/tetrominos';

// Create an empty game board
export function createEmptyBoard(): GameBoard {
  return Array.from({ length: BOARD_HEIGHT }, () =>
    Array.from({ length: BOARD_WIDTH }, (): Cell => ({
      filled: false,
      color: null,
    }))
  );
}

// Check if position is valid (within bounds and not colliding)
export function isValidPosition(
  board: GameBoard,
  shape: number[][],
  posX: number,
  posY: number
): boolean {
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col] === 1) {
        const boardX = posX + col;
        const boardY = posY + row;

        // Check horizontal bounds
        if (boardX < 0 || boardX >= BOARD_WIDTH) {
          return false;
        }

        // Check bottom bound
        if (boardY >= BOARD_HEIGHT) {
          return false;
        }

        // Check collision with placed blocks (only if within board)
        if (boardY >= 0 && board[boardY][boardX].filled) {
          return false;
        }
      }
    }
  }
  return true;
}

// Lock a piece onto the board
export function lockPiece(board: GameBoard, piece: ActiveTetromino): GameBoard {
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));
  const shape = getTetrominoShape(piece.type, piece.rotation);
  const color = getTetrominoColor(piece.type);

  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col] === 1) {
        const boardX = piece.position.x + col;
        const boardY = piece.position.y + row;

        if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
          newBoard[boardY][boardX] = {
            filled: true,
            color: color,
          };
        }
      }
    }
  }

  return newBoard;
}

// Clear completed lines and return new board + number of lines cleared
export function clearLines(board: GameBoard): { newBoard: GameBoard; linesCleared: number } {
  // Find completed lines
  const completedLines: number[] = [];
  for (let row = 0; row < BOARD_HEIGHT; row++) {
    if (board[row].every(cell => cell.filled)) {
      completedLines.push(row);
    }
  }

  if (completedLines.length === 0) {
    return { newBoard: board, linesCleared: 0 };
  }

  // Remove completed lines
  const remainingRows = board.filter((_, index) => !completedLines.includes(index));

  // Add empty rows at the top
  const emptyRows: Cell[][] = Array.from({ length: completedLines.length }, () =>
    Array.from({ length: BOARD_WIDTH }, (): Cell => ({
      filled: false,
      color: null,
    }))
  );

  return {
    newBoard: [...emptyRows, ...remainingRows],
    linesCleared: completedLines.length,
  };
}

// Check if game is over (piece spawns in collision)
export function isGameOver(board: GameBoard, shape: number[][], spawnX: number, spawnY: number): boolean {
  return !isValidPosition(board, shape, spawnX, spawnY);
}

// Calculate hard drop distance
export function getHardDropDistance(
  board: GameBoard,
  piece: ActiveTetromino
): number {
  const shape = getTetrominoShape(piece.type, piece.rotation);
  let distance = 0;

  while (isValidPosition(board, shape, piece.position.x, piece.position.y + distance + 1)) {
    distance++;
  }

  return distance;
}
