import { useCallback } from 'react';
import { GameBoard, ActiveTetromino, RotationState, TetrominoType, Position } from '../types/game';
import { getTetrominoShape } from '../constants/tetrominos';
import { getWallKickData } from '../constants/wallKickData';
import { isValidPosition } from '../utils/board';

export function useCollision() {
  // Check if a move is valid
  const canMove = useCallback(
    (board: GameBoard, piece: ActiveTetromino, deltaX: number, deltaY: number): boolean => {
      const shape = getTetrominoShape(piece.type, piece.rotation);
      return isValidPosition(
        board,
        shape,
        piece.position.x + deltaX,
        piece.position.y + deltaY
      );
    },
    []
  );

  // Check if piece can move left
  const canMoveLeft = useCallback(
    (board: GameBoard, piece: ActiveTetromino): boolean => {
      return canMove(board, piece, -1, 0);
    },
    [canMove]
  );

  // Check if piece can move right
  const canMoveRight = useCallback(
    (board: GameBoard, piece: ActiveTetromino): boolean => {
      return canMove(board, piece, 1, 0);
    },
    [canMove]
  );

  // Check if piece can move down
  const canMoveDown = useCallback(
    (board: GameBoard, piece: ActiveTetromino): boolean => {
      return canMove(board, piece, 0, 1);
    },
    [canMove]
  );

  // Try to rotate with wall kicks
  const tryRotate = useCallback(
    (
      board: GameBoard,
      piece: ActiveTetromino,
      direction: 1 | -1 = 1 // 1 = clockwise, -1 = counter-clockwise
    ): { success: boolean; newRotation: RotationState; newPosition: Position } => {
      const fromRotation = piece.rotation;
      const toRotation = ((fromRotation + direction + 4) % 4) as RotationState;
      const newShape = getTetrominoShape(piece.type, toRotation);

      // Get wall kick data
      const kicks = getWallKickData(piece.type, fromRotation, toRotation);

      // Try each kick offset
      for (const kick of kicks) {
        const newX = piece.position.x + kick.x;
        const newY = piece.position.y - kick.y; // Y is inverted in SRS data

        if (isValidPosition(board, newShape, newX, newY)) {
          return {
            success: true,
            newRotation: toRotation,
            newPosition: { x: newX, y: newY },
          };
        }
      }

      // No valid rotation found
      return {
        success: false,
        newRotation: fromRotation,
        newPosition: piece.position,
      };
    },
    []
  );

  // Check if piece has landed (cannot move down)
  const hasLanded = useCallback(
    (board: GameBoard, piece: ActiveTetromino): boolean => {
      return !canMoveDown(board, piece);
    },
    [canMoveDown]
  );

  return {
    canMove,
    canMoveLeft,
    canMoveRight,
    canMoveDown,
    tryRotate,
    hasLanded,
  };
}
