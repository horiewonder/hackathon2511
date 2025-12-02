import React from 'react';
import { Group, RoundedRect, Text, useFont } from '@shopify/react-native-skia';
import { TetrominoType } from '../../types/game';
import { SPLATOON_COLORS } from '../../constants/colors';
import { TetrominoPreview } from './Tetromino';

interface NextPreviewProps {
  nextPieces: TetrominoType[];
  cellSize: number;
  x: number;
  y: number;
}

export function NextPreview({ nextPieces, cellSize, x, y }: NextPreviewProps) {
  const boxWidth = cellSize * 5;
  const boxHeight = cellSize * 4 * Math.min(nextPieces.length, 3) + 40;

  return (
    <Group transform={[{ translateX: x }, { translateY: y }]}>
      {/* Background box */}
      <RoundedRect
        x={0}
        y={0}
        width={boxWidth}
        height={boxHeight}
        r={8}
        color={SPLATOON_COLORS.boardBorder}
      />
      <RoundedRect
        x={2}
        y={2}
        width={boxWidth - 4}
        height={boxHeight - 4}
        r={6}
        color={SPLATOON_COLORS.boardBackground}
      />

      {/* Label - using simple rectangle since Text needs font */}
      <RoundedRect
        x={boxWidth / 2 - 30}
        y={8}
        width={60}
        height={20}
        r={4}
        color={SPLATOON_COLORS.pink}
      />

      {/* Preview pieces */}
      {nextPieces.slice(0, 3).map((type, index) => (
        <TetrominoPreview
          key={index}
          type={type}
          cellSize={cellSize * 0.7}
          x={(boxWidth - cellSize * 0.7 * 4) / 2}
          y={36 + index * cellSize * 3}
        />
      ))}
    </Group>
  );
}
