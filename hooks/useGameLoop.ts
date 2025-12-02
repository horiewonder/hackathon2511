import { useEffect, useRef, useCallback } from 'react';
import { GameState, GameAction, TetrominoType, ActiveTetromino } from '../types/game';
import { getDropInterval } from '../constants/gameConfig';
import { isValidPosition, getHardDropDistance } from '../utils/board';
import { getTetrominoShape, getSpawnPosition } from '../constants/tetrominos';

interface UseGameLoopProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  onSpawnPiece: () => { piece: TetrominoType; nextPieces: TetrominoType[] };
  onUpdatePieces: (activePiece: ActiveTetromino, nextPieces: TetrominoType[]) => void;
}

export function useGameLoop({
  state,
  dispatch,
  onSpawnPiece,
  onUpdatePieces,
}: UseGameLoopProps) {
  const lastTickRef = useRef<number>(0);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lockDelayRef = useRef<number | null>(null);

  // Check if piece should lock
  const shouldLock = useCallback((): boolean => {
    if (!state.activePiece) return false;

    const shape = getTetrominoShape(state.activePiece.type, state.activePiece.rotation);
    const canMoveDown = isValidPosition(
      state.board,
      shape,
      state.activePiece.position.x,
      state.activePiece.position.y + 1
    );

    return !canMoveDown;
  }, [state.activePiece, state.board]);

  // Spawn new piece after lock
  const spawnNewPiece = useCallback(() => {
    const { piece, nextPieces } = onSpawnPiece();
    const position = getSpawnPosition(piece);
    const shape = getTetrominoShape(piece, 0);

    // Check for game over
    if (!isValidPosition(state.board, shape, position.x, position.y)) {
      dispatch({ type: 'GAME_OVER' });
      return;
    }

    const newPiece: ActiveTetromino = {
      type: piece,
      position,
      rotation: 0,
    };

    onUpdatePieces(newPiece, nextPieces);
  }, [state.board, dispatch, onSpawnPiece, onUpdatePieces]);

  // Main game loop
  useEffect(() => {
    if (state.gameStatus !== 'playing') {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const dropInterval = getDropInterval(state.level);

    const gameLoop = (timestamp: number) => {
      if (state.gameStatus !== 'playing') return;

      // Check if we need to spawn a new piece
      if (!state.activePiece) {
        spawnNewPiece();
        lastTickRef.current = timestamp;
        animationFrameRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      // Check if piece has landed
      if (shouldLock()) {
        // Start or check lock delay
        if (lockDelayRef.current === null) {
          lockDelayRef.current = timestamp;
        } else if (timestamp - lockDelayRef.current >= 500) {
          // Lock delay expired - lock the piece
          dispatch({ type: 'LOCK_PIECE' });
          lockDelayRef.current = null;
          lastTickRef.current = timestamp;
        }
      } else {
        // Reset lock delay if piece can still move
        lockDelayRef.current = null;

        // Normal gravity tick
        if (timestamp - lastTickRef.current >= dropInterval) {
          dispatch({ type: 'TICK' });
          lastTickRef.current = timestamp;
        }
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [state.gameStatus, state.level, state.activePiece, shouldLock, spawnNewPiece, dispatch]);

  // Reset lock delay when piece moves
  const resetLockDelay = useCallback(() => {
    lockDelayRef.current = null;
  }, []);

  return { resetLockDelay };
}
