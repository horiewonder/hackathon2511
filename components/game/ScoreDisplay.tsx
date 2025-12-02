import React from 'react';
import { Group, RoundedRect, Text, useFont, matchFont } from '@shopify/react-native-skia';
import { SPLATOON_COLORS } from '../../constants/colors';
import { Platform } from 'react-native';

interface ScoreDisplayProps {
  score: number;
  level: number;
  lines: number;
  x: number;
  y: number;
  width: number;
}

export function ScoreDisplay({ score, level, lines, x, y, width }: ScoreDisplayProps) {
  // Use system font
  const fontFamily = Platform.select({ ios: 'Helvetica', default: 'serif' });
  const fontStyle = {
    fontFamily,
    fontSize: 16,
    fontWeight: 'bold' as const,
  };
  const font = matchFont(fontStyle);

  const largeFontStyle = {
    fontFamily,
    fontSize: 24,
    fontWeight: 'bold' as const,
  };
  const largeFont = matchFont(largeFontStyle);

  const boxHeight = 120;
  const padding = 12;

  return (
    <Group transform={[{ translateX: x }, { translateY: y }]}>
      {/* Background */}
      <RoundedRect
        x={0}
        y={0}
        width={width}
        height={boxHeight}
        r={8}
        color={SPLATOON_COLORS.boardBorder}
      />
      <RoundedRect
        x={2}
        y={2}
        width={width - 4}
        height={boxHeight - 4}
        r={6}
        color={SPLATOON_COLORS.boardBackground}
      />

      {/* Score */}
      <Text
        x={padding}
        y={28}
        text="SCORE"
        font={font}
        color={SPLATOON_COLORS.textSecondary}
      />
      <Text
        x={padding}
        y={54}
        text={score.toString().padStart(8, '0')}
        font={largeFont}
        color={SPLATOON_COLORS.pink}
      />

      {/* Level & Lines */}
      <Text
        x={padding}
        y={80}
        text={`LV ${level}`}
        font={font}
        color={SPLATOON_COLORS.cyan}
      />
      <Text
        x={padding + 70}
        y={80}
        text={`LINES ${lines}`}
        font={font}
        color={SPLATOON_COLORS.green}
      />
    </Group>
  );
}
