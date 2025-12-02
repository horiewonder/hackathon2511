import React, { useCallback, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { SPLATOON_COLORS } from '../../constants/colors';

interface TouchControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onMoveDown: () => void;
  onRotate: () => void;
  onHardDrop: () => void;
  onHold: () => void;
  disabled?: boolean;
}

export function TouchControls({
  onMoveLeft,
  onMoveRight,
  onMoveDown,
  onRotate,
  onHardDrop,
  onHold,
  disabled = false,
}: TouchControlsProps) {
  const repeatRef = useRef<NodeJS.Timeout | null>(null);

  // Start repeating action
  const startRepeat = useCallback((action: () => void) => {
    action();
    repeatRef.current = setInterval(action, 80);
  }, []);

  // Stop repeating action
  const stopRepeat = useCallback(() => {
    if (repeatRef.current) {
      clearInterval(repeatRef.current);
      repeatRef.current = null;
    }
  }, []);

  return (
    <View style={styles.container}>
      {/* Top row: Hold, Score area, Rotate */}
      <View style={styles.topRow}>
        <ControlButton
          label="HOLD"
          onPress={onHold}
          style={styles.holdButton}
          textStyle={styles.holdText}
          disabled={disabled}
          color={SPLATOON_COLORS.cyan}
        />
        <View style={styles.spacer} />
        <ControlButton
          label="↻"
          onPress={onRotate}
          style={styles.rotateButton}
          textStyle={styles.rotateText}
          disabled={disabled}
          color={SPLATOON_COLORS.purple}
        />
      </View>

      {/* Middle row: Left, Down, Right */}
      <View style={styles.middleRow}>
        <ControlButton
          label="◀"
          onPressIn={() => startRepeat(onMoveLeft)}
          onPressOut={stopRepeat}
          style={styles.arrowButton}
          textStyle={styles.arrowText}
          disabled={disabled}
          color={SPLATOON_COLORS.pink}
        />
        <ControlButton
          label="▼"
          onPressIn={() => startRepeat(onMoveDown)}
          onPressOut={stopRepeat}
          style={styles.arrowButton}
          textStyle={styles.arrowText}
          disabled={disabled}
          color={SPLATOON_COLORS.green}
        />
        <ControlButton
          label="▶"
          onPressIn={() => startRepeat(onMoveRight)}
          onPressOut={stopRepeat}
          style={styles.arrowButton}
          textStyle={styles.arrowText}
          disabled={disabled}
          color={SPLATOON_COLORS.pink}
        />
      </View>

      {/* Bottom row: Hard Drop */}
      <View style={styles.bottomRow}>
        <ControlButton
          label="DROP"
          onPress={onHardDrop}
          style={styles.dropButton}
          textStyle={styles.dropText}
          disabled={disabled}
          color={SPLATOON_COLORS.orange}
        />
      </View>
    </View>
  );
}

interface ControlButtonProps {
  label: string;
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  style?: any;
  textStyle?: any;
  disabled?: boolean;
  color?: string;
}

function ControlButton({
  label,
  onPress,
  onPressIn,
  onPressOut,
  style,
  textStyle,
  disabled,
  color = SPLATOON_COLORS.buttonDefault,
}: ControlButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
      activeOpacity={0.7}
      style={[
        styles.button,
        { borderColor: color, backgroundColor: `${color}33` },
        disabled && styles.buttonDisabled,
        style,
      ]}
    >
      <Text style={[styles.buttonText, { color }, textStyle]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  middleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginBottom: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spacer: {
    flex: 1,
  },
  button: {
    borderWidth: 3,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  holdButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  holdText: {
    fontSize: 14,
  },
  rotateButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    paddingHorizontal: 0,
  },
  rotateText: {
    fontSize: 28,
  },
  arrowButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    paddingHorizontal: 0,
  },
  arrowText: {
    fontSize: 28,
  },
  dropButton: {
    paddingHorizontal: 50,
    paddingVertical: 16,
  },
  dropText: {
    fontSize: 20,
    letterSpacing: 2,
  },
});
