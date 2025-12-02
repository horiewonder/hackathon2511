import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, useWindowDimensions, Text, TouchableOpacity } from 'react-native';
import { Canvas, Group, RoundedRect, Text as SkiaText, matchFont } from '@shopify/react-native-skia';
import { GameState, ActiveTetromino, TetrominoType } from '../../types/game';
import { BOARD_WIDTH, BOARD_HEIGHT, PREVIEW_COUNT } from '../../constants/gameConfig';
import { SPLATOON_COLORS } from '../../constants/colors';
import { createEmptyBoard } from '../../utils/board';
import { Randomizer, createInitialQueue } from '../../utils/randomizer';
import { getSpawnPosition, getTetrominoShape } from '../../constants/tetrominos';
import { isValidPosition, lockPiece, clearLines, getHardDropDistance } from '../../utils/board';
import { getWallKickData } from '../../constants/wallKickData';
import { calculateLineClearScore, calculateHardDropScore, getLevelFromLines } from '../../utils/scoring';
import { getDropInterval } from '../../constants/gameConfig';

import { GameBoard } from './GameBoard';
import { Tetromino, TetrominoPreview } from './Tetromino';
import { GhostPiece } from './GhostPiece';
import { TouchControls } from './TouchControls';

export function TetrisGame() {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Calculate cell size based on screen dimensions
  const maxBoardHeight = screenHeight * 0.55;
  const maxBoardWidth = screenWidth * 0.7;
  const cellSize = Math.floor(Math.min(maxBoardHeight / BOARD_HEIGHT, maxBoardWidth / BOARD_WIDTH));

  const boardWidth = BOARD_WIDTH * cellSize;
  const boardHeight = BOARD_HEIGHT * cellSize;
  const boardOffsetX = (screenWidth - boardWidth) / 2;
  const boardOffsetY = 80;

  // Game state
  const [gameState, setGameState] = useState<GameState>({
    board: createEmptyBoard(),
    activePiece: null,
    heldPiece: null,
    canHold: true,
    nextPieces: [],
    score: 0,
    level: 1,
    linesCleared: 0,
    gameStatus: 'idle',
    comboCount: 0,
  });

  const [randomizer] = useState(() => new Randomizer());

  // Spawn new piece
  const spawnPiece = useCallback((type: TetrominoType): ActiveTetromino => {
    const position = getSpawnPosition(type);
    return {
      type,
      position,
      rotation: 0,
    };
  }, []);

  // Start game
  const startGame = useCallback(() => {
    randomizer.reset();
    const queue = createInitialQueue(randomizer, PREVIEW_COUNT + 1);
    const firstPiece = queue[0];
    const nextPieces = queue.slice(1);

    setGameState({
      board: createEmptyBoard(),
      activePiece: spawnPiece(firstPiece),
      heldPiece: null,
      canHold: true,
      nextPieces,
      score: 0,
      level: 1,
      linesCleared: 0,
      gameStatus: 'playing',
      comboCount: 0,
    });
  }, [randomizer, spawnPiece]);

  // Spawn next piece
  const spawnNextPiece = useCallback(() => {
    setGameState(prev => {
      if (prev.nextPieces.length === 0) return prev;

      const nextType = prev.nextPieces[0];
      const position = getSpawnPosition(nextType);
      const shape = getTetrominoShape(nextType, 0);

      // Check game over
      if (!isValidPosition(prev.board, shape, position.x, position.y)) {
        return { ...prev, gameStatus: 'gameOver' };
      }

      const newNextPiece = randomizer.next();

      return {
        ...prev,
        activePiece: spawnPiece(nextType),
        nextPieces: [...prev.nextPieces.slice(1), newNextPiece],
        canHold: true,
      };
    });
  }, [randomizer, spawnPiece]);

  // Lock piece and clear lines
  const lockCurrentPiece = useCallback(() => {
    setGameState(prev => {
      if (!prev.activePiece) return prev;

      // Lock piece to board
      let newBoard = lockPiece(prev.board, prev.activePiece);

      // Clear lines
      const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);

      // Calculate score
      const newCombo = linesCleared > 0 ? prev.comboCount + 1 : 0;
      const totalLines = prev.linesCleared + linesCleared;
      const newLevel = getLevelFromLines(totalLines);
      const lineScore = calculateLineClearScore(linesCleared, prev.level, prev.comboCount);

      return {
        ...prev,
        board: clearedBoard,
        activePiece: null,
        score: prev.score + lineScore,
        linesCleared: totalLines,
        level: newLevel,
        comboCount: newCombo,
      };
    });
  }, []);

  // Game loop
  useEffect(() => {
    if (gameState.gameStatus !== 'playing') return;

    const dropInterval = getDropInterval(gameState.level);

    const tick = () => {
      setGameState(prev => {
        if (prev.gameStatus !== 'playing' || !prev.activePiece) return prev;

        const shape = getTetrominoShape(prev.activePiece.type, prev.activePiece.rotation);
        const newY = prev.activePiece.position.y + 1;

        // Can move down
        if (isValidPosition(prev.board, shape, prev.activePiece.position.x, newY)) {
          return {
            ...prev,
            activePiece: {
              ...prev.activePiece,
              position: { ...prev.activePiece.position, y: newY },
            },
          };
        }

        // Cannot move down - need to lock
        return prev;
      });
    };

    const interval = setInterval(tick, dropInterval);
    return () => clearInterval(interval);
  }, [gameState.gameStatus, gameState.level]);

  // Check for piece locking
  useEffect(() => {
    if (gameState.gameStatus !== 'playing' || !gameState.activePiece) return;

    const shape = getTetrominoShape(gameState.activePiece.type, gameState.activePiece.rotation);
    const canMoveDown = isValidPosition(
      gameState.board,
      shape,
      gameState.activePiece.position.x,
      gameState.activePiece.position.y + 1
    );

    if (!canMoveDown) {
      const lockTimer = setTimeout(() => {
        lockCurrentPiece();
      }, 500);

      return () => clearTimeout(lockTimer);
    }
  }, [gameState.activePiece, gameState.board, gameState.gameStatus, lockCurrentPiece]);

  // Spawn new piece when activePiece is null
  useEffect(() => {
    if (gameState.gameStatus === 'playing' && !gameState.activePiece) {
      spawnNextPiece();
    }
  }, [gameState.activePiece, gameState.gameStatus, spawnNextPiece]);

  // Input handlers
  const handleMoveLeft = useCallback(() => {
    setGameState(prev => {
      if (prev.gameStatus !== 'playing' || !prev.activePiece) return prev;

      const shape = getTetrominoShape(prev.activePiece.type, prev.activePiece.rotation);
      const newX = prev.activePiece.position.x - 1;

      if (isValidPosition(prev.board, shape, newX, prev.activePiece.position.y)) {
        return {
          ...prev,
          activePiece: {
            ...prev.activePiece,
            position: { ...prev.activePiece.position, x: newX },
          },
        };
      }
      return prev;
    });
  }, []);

  const handleMoveRight = useCallback(() => {
    setGameState(prev => {
      if (prev.gameStatus !== 'playing' || !prev.activePiece) return prev;

      const shape = getTetrominoShape(prev.activePiece.type, prev.activePiece.rotation);
      const newX = prev.activePiece.position.x + 1;

      if (isValidPosition(prev.board, shape, newX, prev.activePiece.position.y)) {
        return {
          ...prev,
          activePiece: {
            ...prev.activePiece,
            position: { ...prev.activePiece.position, x: newX },
          },
        };
      }
      return prev;
    });
  }, []);

  const handleMoveDown = useCallback(() => {
    setGameState(prev => {
      if (prev.gameStatus !== 'playing' || !prev.activePiece) return prev;

      const shape = getTetrominoShape(prev.activePiece.type, prev.activePiece.rotation);
      const newY = prev.activePiece.position.y + 1;

      if (isValidPosition(prev.board, shape, prev.activePiece.position.x, newY)) {
        return {
          ...prev,
          activePiece: {
            ...prev.activePiece,
            position: { ...prev.activePiece.position, y: newY },
          },
          score: prev.score + 1,
        };
      }
      return prev;
    });
  }, []);

  const handleRotate = useCallback(() => {
    setGameState(prev => {
      if (prev.gameStatus !== 'playing' || !prev.activePiece) return prev;

      const fromRotation = prev.activePiece.rotation;
      const toRotation = ((fromRotation + 1) % 4) as 0 | 1 | 2 | 3;
      const newShape = getTetrominoShape(prev.activePiece.type, toRotation);

      // Try wall kicks
      const kicks = getWallKickData(prev.activePiece.type, fromRotation, toRotation);

      for (const kick of kicks) {
        const newX = prev.activePiece.position.x + kick.x;
        const newY = prev.activePiece.position.y - kick.y;

        if (isValidPosition(prev.board, newShape, newX, newY)) {
          return {
            ...prev,
            activePiece: {
              ...prev.activePiece,
              rotation: toRotation,
              position: { x: newX, y: newY },
            },
          };
        }
      }
      return prev;
    });
  }, []);

  const handleHardDrop = useCallback(() => {
    setGameState(prev => {
      if (prev.gameStatus !== 'playing' || !prev.activePiece) return prev;

      const distance = getHardDropDistance(prev.board, prev.activePiece);
      const newY = prev.activePiece.position.y + distance;

      // Lock immediately after hard drop
      const droppedPiece = {
        ...prev.activePiece,
        position: { ...prev.activePiece.position, y: newY },
      };

      // Lock piece to board
      let newBoard = lockPiece(prev.board, droppedPiece);

      // Clear lines
      const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);

      // Calculate score
      const newCombo = linesCleared > 0 ? prev.comboCount + 1 : 0;
      const totalLines = prev.linesCleared + linesCleared;
      const newLevel = getLevelFromLines(totalLines);
      const lineScore = calculateLineClearScore(linesCleared, prev.level, prev.comboCount);
      const dropScore = calculateHardDropScore(distance);

      return {
        ...prev,
        board: clearedBoard,
        activePiece: null,
        score: prev.score + lineScore + dropScore,
        linesCleared: totalLines,
        level: newLevel,
        comboCount: newCombo,
      };
    });
  }, []);

  const handleHold = useCallback(() => {
    setGameState(prev => {
      if (prev.gameStatus !== 'playing' || !prev.activePiece || !prev.canHold) {
        return prev;
      }

      const currentType = prev.activePiece.type;

      if (prev.heldPiece === null) {
        // First hold
        const nextType = prev.nextPieces[0];
        const newNextPiece = randomizer.next();

        return {
          ...prev,
          heldPiece: currentType,
          activePiece: spawnPiece(nextType),
          nextPieces: [...prev.nextPieces.slice(1), newNextPiece],
          canHold: false,
        };
      } else {
        // Swap
        return {
          ...prev,
          heldPiece: currentType,
          activePiece: spawnPiece(prev.heldPiece),
          canHold: false,
        };
      }
    });
  }, [randomizer, spawnPiece]);

  const previewCellSize = cellSize * 0.6;
  const previewBoxWidth = previewCellSize * 5;

  return (
    <View style={styles.container}>
      {/* Game Canvas */}
      <View style={styles.gameArea}>
        <Canvas style={{ width: screenWidth, height: boardHeight + boardOffsetY + 20 }}>
          {/* Score Display */}
          <Group transform={[{ translateX: 10 }, { translateY: 10 }]}>
            <RoundedRect
              x={0}
              y={0}
              width={screenWidth - 20}
              height={60}
              r={8}
              color={SPLATOON_COLORS.boardBackground}
            />
          </Group>

          {/* Hold Box */}
          <Group transform={[{ translateX: 10 }, { translateY: boardOffsetY }]}>
            <RoundedRect
              x={0}
              y={0}
              width={previewBoxWidth}
              height={previewCellSize * 4 + 10}
              r={8}
              color={gameState.canHold ? SPLATOON_COLORS.boardBorder : 'rgba(100,100,100,0.3)'}
            />
            <RoundedRect
              x={2}
              y={2}
              width={previewBoxWidth - 4}
              height={previewCellSize * 4 + 6}
              r={6}
              color={SPLATOON_COLORS.boardBackground}
            />
            {gameState.heldPiece && (
              <Group opacity={gameState.canHold ? 1 : 0.4}>
                <TetrominoPreview
                  type={gameState.heldPiece}
                  cellSize={previewCellSize * 0.8}
                  x={(previewBoxWidth - previewCellSize * 0.8 * 4) / 2}
                  y={previewCellSize * 0.5}
                />
              </Group>
            )}
          </Group>

          {/* Game Board */}
          <GameBoard
            board={gameState.board}
            cellSize={cellSize}
            offsetX={boardOffsetX}
            offsetY={boardOffsetY}
          />

          {/* Ghost Piece */}
          {gameState.activePiece && (
            <GhostPiece
              piece={gameState.activePiece}
              board={gameState.board}
              cellSize={cellSize}
              offsetX={boardOffsetX}
              offsetY={boardOffsetY}
            />
          )}

          {/* Active Piece */}
          {gameState.activePiece && (
            <Tetromino
              piece={gameState.activePiece}
              cellSize={cellSize}
              offsetX={boardOffsetX}
              offsetY={boardOffsetY}
            />
          )}

          {/* Next Pieces */}
          <Group transform={[{ translateX: screenWidth - previewBoxWidth - 10 }, { translateY: boardOffsetY }]}>
            <RoundedRect
              x={0}
              y={0}
              width={previewBoxWidth}
              height={previewCellSize * 10 + 10}
              r={8}
              color={SPLATOON_COLORS.boardBorder}
            />
            <RoundedRect
              x={2}
              y={2}
              width={previewBoxWidth - 4}
              height={previewCellSize * 10 + 6}
              r={6}
              color={SPLATOON_COLORS.boardBackground}
            />
            {gameState.nextPieces.slice(0, 3).map((type, index) => (
              <TetrominoPreview
                key={index}
                type={type}
                cellSize={previewCellSize * 0.8}
                x={(previewBoxWidth - previewCellSize * 0.8 * 4) / 2}
                y={10 + index * previewCellSize * 3.2}
              />
            ))}
          </Group>
        </Canvas>
      </View>

      {/* Score Display (React Native) */}
      <View style={styles.scoreContainer}>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>SCORE</Text>
          <Text style={styles.scoreValue}>{gameState.score.toString().padStart(8, '0')}</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={[styles.scoreLabel, { color: SPLATOON_COLORS.cyan }]}>LV</Text>
          <Text style={[styles.scoreValue, { color: SPLATOON_COLORS.cyan }]}>{gameState.level}</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={[styles.scoreLabel, { color: SPLATOON_COLORS.green }]}>LINES</Text>
          <Text style={[styles.scoreValue, { color: SPLATOON_COLORS.green }]}>{gameState.linesCleared}</Text>
        </View>
      </View>

      {/* Touch Controls */}
      <TouchControls
        onMoveLeft={handleMoveLeft}
        onMoveRight={handleMoveRight}
        onMoveDown={handleMoveDown}
        onRotate={handleRotate}
        onHardDrop={handleHardDrop}
        onHold={handleHold}
        disabled={gameState.gameStatus !== 'playing'}
      />

      {/* Start/Game Over Overlay */}
      {gameState.gameStatus !== 'playing' && (
        <View style={styles.overlay}>
          <View style={styles.overlayContent}>
            {gameState.gameStatus === 'gameOver' && (
              <>
                <Text style={styles.gameOverText}>GAME OVER</Text>
                <Text style={styles.finalScore}>SCORE: {gameState.score}</Text>
              </>
            )}
            <TouchableOpacity style={styles.startButton} onPress={startGame}>
              <Text style={styles.startButtonText}>
                {gameState.gameStatus === 'idle' ? 'START' : 'RETRY'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SPLATOON_COLORS.background,
  },
  gameArea: {
    flex: 1,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: SPLATOON_COLORS.boardBackground,
    marginHorizontal: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    color: SPLATOON_COLORS.textSecondary,
    fontWeight: 'bold',
  },
  scoreValue: {
    fontSize: 20,
    color: SPLATOON_COLORS.pink,
    fontWeight: 'bold',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContent: {
    alignItems: 'center',
  },
  gameOverText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: SPLATOON_COLORS.pink,
    marginBottom: 20,
  },
  finalScore: {
    fontSize: 24,
    color: SPLATOON_COLORS.textPrimary,
    marginBottom: 30,
  },
  startButton: {
    backgroundColor: SPLATOON_COLORS.pink,
    paddingHorizontal: 50,
    paddingVertical: 20,
    borderRadius: 30,
  },
  startButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: SPLATOON_COLORS.textPrimary,
    letterSpacing: 4,
  },
});
