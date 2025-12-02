import React from 'react';
import { Group, RoundedRect, Line, vec } from '@shopify/react-native-skia';
import { BOARD_WIDTH, BOARD_HEIGHT } from '../../constants/gameConfig';
import { SPLATOON_COLORS } from '../../constants/colors';
import { GameBoard as GameBoardType } from '../../types/game';

interface GameBoardProps {
  board: GameBoardType;
  cellSize: number;
  offsetX: number;
  offsetY: number;
}

export function GameBoard({ board, cellSize, offsetX, offsetY }: GameBoardProps) {
  const boardWidth = BOARD_WIDTH * cellSize;
  const boardHeight = BOARD_HEIGHT * cellSize;

  return (
    <Group transform={[{ translateX: offsetX }, { translateY: offsetY }]}>
      {/* Board background */}
      <RoundedRect
        x={-4}
        y={-4}
        width={boardWidth + 8}
        height={boardHeight + 8}
        r={8}
        color={SPLATOON_COLORS.boardBorder}
      />
      <RoundedRect
        x={0}
        y={0}
        width={boardWidth}
        height={boardHeight}
        r={4}
        color={SPLATOON_COLORS.boardBackground}
      />

      {/* Grid lines */}
      {Array.from({ length: BOARD_WIDTH + 1 }).map((_, i) => (
        <Line
          key={`v-${i}`}
          p1={vec(i * cellSize, 0)}
          p2={vec(i * cellSize, boardHeight)}
          color={SPLATOON_COLORS.gridLine}
          strokeWidth={1}
        />
      ))}
      {Array.from({ length: BOARD_HEIGHT + 1 }).map((_, i) => (
        <Line
          key={`h-${i}`}
          p1={vec(0, i * cellSize)}
          p2={vec(boardWidth, i * cellSize)}
          color={SPLATOON_COLORS.gridLine}
          strokeWidth={1}
        />
      ))}

      {/* Fixed blocks */}
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          if (cell.filled && cell.color) {
            return (
              <Block
                key={`${rowIndex}-${colIndex}`}
                x={colIndex}
                y={rowIndex}
                color={cell.color}
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

interface BlockProps {
  x: number;
  y: number;
  color: string;
  cellSize: number;
  opacity?: number;
}

export function Block({ x, y, color, cellSize, opacity = 1 }: BlockProps) {
  const padding = 2;
  const blockSize = cellSize - padding * 2;
  const posX = x * cellSize + padding;
  const posY = y * cellSize + padding;

  return (
    <Group opacity={opacity}>
      {/* Main block */}
      <RoundedRect
        x={posX}
        y={posY}
        width={blockSize}
        height={blockSize}
        r={4}
        color={color}
      />
      {/* Highlight (top-left) */}
      <RoundedRect
        x={posX + 2}
        y={posY + 2}
        width={blockSize - 4}
        height={4}
        r={2}
        color="rgba(255, 255, 255, 0.4)"
      />
      {/* Shadow (bottom) */}
      <RoundedRect
        x={posX + 2}
        y={posY + blockSize - 6}
        width={blockSize - 4}
        height={4}
        r={2}
        color="rgba(0, 0, 0, 0.3)"
      />
    </Group>
  );
}
