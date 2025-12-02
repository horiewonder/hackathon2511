import React from 'react';
import { Group, RoundedRect } from '@shopify/react-native-skia';
import { TetrominoType } from '../../types/game';
import { SPLATOON_COLORS } from '../../constants/colors';
import { TetrominoPreview } from './Tetromino';

interface HoldDisplayProps {
  heldPiece: TetrominoType | null;
  canHold: boolean;
  cellSize: number;
  x: number;
  y: number;
}

export function HoldDisplay({ heldPiece, canHold, cellSize, x, y }: HoldDisplayProps) {
  const boxWidth = cellSize * 5;
  const boxHeight = cellSize * 4 + 40;

  return (
    <Group transform={[{ translateX: x }, { translateY: y }]}>
      {/* Background box */}
      <RoundedRect
        x={0}
        y={0}
        width={boxWidth}
        height={boxHeight}
        r={8}
        color={canHold ? SPLATOON_COLORS.boardBorder : 'rgba(100, 100, 100, 0.5)'}
      />
      <RoundedRect
        x={2}
        y={2}
        width={boxWidth - 4}
        height={boxHeight - 4}
        r={6}
        color={SPLATOON_COLORS.boardBackground}
      />

      {/* Label */}
      <RoundedRect
        x={boxWidth / 2 - 30}
        y={8}
        width={60}
        height={20}
        r={4}
        color={canHold ? SPLATOON_COLORS.cyan : 'rgba(100, 100, 100, 0.5)'}
      />

      {/* Held piece */}
      {heldPiece && (
        <Group opacity={canHold ? 1 : 0.5}>
          <TetrominoPreview
            type={heldPiece}
            cellSize={cellSize * 0.7}
            x={(boxWidth - cellSize * 0.7 * 4) / 2}
            y={36}
          />
        </Group>
      )}
    </Group>
  );
}
