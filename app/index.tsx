import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { AsyncSkia } from '../components/async-skia';

const TetrisGame = React.lazy(() =>
  import('../components/game/TetrisGame').then(module => ({
    default: module.TetrisGame,
  }))
);

const SplatBackground = React.lazy(() =>
  import('../components/effects/SplatBackground').then(module => ({
    default: module.SplatBackground,
  }))
);

export default function Page() {
  return (
    <View style={styles.container}>
      <React.Suspense
        fallback={
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#FF6090" />
          </View>
        }
      >
        <AsyncSkia />
        {/* Background */}
        <View style={styles.background}>
          <SplatBackground />
        </View>
        {/* Game */}
        <TetrisGame />
      </React.Suspense>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
