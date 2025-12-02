import React from 'react';
import { Group } from '@shopify/react-native-skia';
import { ActiveTetromino, GameBoard } from '../../types/game';
import { getTetrominoShape } from '../../constants/tetrominos';
import { SPLATOON_COLORS } from '../../constants/colors';
import { Block } from './GameBoard';
import { BOARD_WIDTH, BOARD_HEIGHT } from '../../constants/gameConfig';

interface GhostPieceProps {
  piece: ActiveTetromino;
  board: GameBoard;
  cellSize: number;
  offsetX?: number;
  offsetY?: number;
}

// Check if piece collides at position
function checkCollision(
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

        // Check boundaries
        if (boardX < 0 || boardX >= BOARD_WIDTH) return true;
        if (boardY >= BOARD_HEIGHT) return true;

        // Check collision with placed blocks
        if (boardY >= 0 && board[boardY][boardX].filled) return true;
      }
    }
  }
  return false;
}

// Calculate ghost piece position (where piece would land)
function getGhostPosition(piece: ActiveTetromino, board: GameBoard): number {
  const shape = getTetrominoShape(piece.type, piece.rotation);
  let ghostY = piece.position.y;

  while (!checkCollision(board, shape, piece.position.x, ghostY + 1)) {
    ghostY++;
  }

  return ghostY;
}

export function GhostPiece({
  piece,
  board,
  cellSize,
  offsetX = 0,
  offsetY = 0,
}: GhostPieceProps) {
  const ghostY = getGhostPosition(piece, board);
  const shape = getTetrominoShape(piece.type, piece.rotation);

  // Don't show ghost if it's at the same position as the active piece
  if (ghostY === piece.position.y) {
    return null;
  }

  return (
    <Group transform={[{ translateX: offsetX }, { translateY: offsetY }]}>
      {shape.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          if (cell === 1) {
            const x = piece.position.x + colIndex;
            const y = ghostY + rowIndex;
            if (y >= 0) {
              return (
                <Block
                  key={`ghost-${rowIndex}-${colIndex}`}
                  x={x}
                  y={y}
                  color={SPLATOON_COLORS.ghost}
                  cellSize={cellSize}
                  opacity={0.4}
                />
              );
            }
          }
          return null;
        })
      )}
    </Group>
  );
}
