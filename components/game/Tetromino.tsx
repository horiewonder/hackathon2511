import React from 'react';
import { Group } from '@shopify/react-native-skia';
import { ActiveTetromino } from '../../types/game';
import { getTetrominoShape, getTetrominoColor } from '../../constants/tetrominos';
import { Block } from './GameBoard';

interface TetrominoProps {
  piece: ActiveTetromino;
  cellSize: number;
  offsetX?: number;
  offsetY?: number;
  opacity?: number;
}

export function Tetromino({
  piece,
  cellSize,
  offsetX = 0,
  offsetY = 0,
  opacity = 1,
}: TetrominoProps) {
  const shape = getTetrominoShape(piece.type, piece.rotation);
  const color = getTetrominoColor(piece.type);

  return (
    <Group transform={[{ translateX: offsetX }, { translateY: offsetY }]}>
      {shape.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          if (cell === 1) {
            const x = piece.position.x + colIndex;
            const y = piece.position.y + rowIndex;
            // Only render if within visible board area
            if (y >= 0) {
              return (
                <Block
                  key={`${rowIndex}-${colIndex}`}
                  x={x}
                  y={y}
                  color={color}
                  cellSize={cellSize}
                  opacity={opacity}
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

// Preview tetromino for Next/Hold displays (centered in a small box)
interface TetrominoPreviewProps {
  type: string;
  cellSize: number;
  x: number;
  y: number;
}

export function TetrominoPreview({ type, cellSize, x, y }: TetrominoPreviewProps) {
  const shape = getTetrominoShape(type as any, 0);
  const color = getTetrominoColor(type as any);

  // Calculate bounding box to center the piece
  let minX = 4,
    maxX = 0,
    minY = 4,
    maxY = 0;
  shape.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell === 1) {
        minX = Math.min(minX, colIndex);
        maxX = Math.max(maxX, colIndex);
        minY = Math.min(minY, rowIndex);
        maxY = Math.max(maxY, rowIndex);
      }
    });
  });

  const pieceWidth = (maxX - minX + 1) * cellSize;
  const pieceHeight = (maxY - minY + 1) * cellSize;

  // Center offset
  const centerOffsetX = (cellSize * 4 - pieceWidth) / 2 - minX * cellSize;
  const centerOffsetY = (cellSize * 4 - pieceHeight) / 2 - minY * cellSize;

  return (
    <Group transform={[{ translateX: x + centerOffsetX }, { translateY: y + centerOffsetY }]}>
      {shape.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          if (cell === 1) {
            return (
              <Block
                key={`${rowIndex}-${colIndex}`}
                x={colIndex}
                y={rowIndex}
                color={color}
                cellSize={cellSize}
              />
            );
          }
          return null;
        })
      )}
    </Group>
  );
}
