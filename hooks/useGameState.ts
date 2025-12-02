import { useReducer, useCallback, useRef } from 'react';
import { GameState, GameAction, ActiveTetromino, TetrominoType } from '../types/game';
import { createEmptyBoard, lockPiece, clearLines, isValidPosition, getHardDropDistance } from '../utils/board';
import { Randomizer, createInitialQueue } from '../utils/randomizer';
import { getTetrominoShape, getSpawnPosition } from '../constants/tetrominos';
import { getWallKickData } from '../constants/wallKickData';
import { PREVIEW_COUNT, getLevelFromLines } from '../constants/gameConfig';
import { calculateLineClearScore, calculateHardDropScore } from '../utils/scoring';

// Initial game state
function createInitialState(): GameState {
  return {
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
  };
}

// Spawn a new piece
function spawnPiece(type: TetrominoType): ActiveTetromino {
  const position = getSpawnPosition(type);
  return {
    type,
    position,
    rotation: 0,
  };
}

// Game reducer
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      // This will be handled externally with randomizer
      return {
        ...createInitialState(),
        gameStatus: 'playing',
      };
    }

    case 'PAUSE_GAME': {
      if (state.gameStatus !== 'playing') return state;
      return { ...state, gameStatus: 'paused' };
    }

    case 'RESUME_GAME': {
      if (state.gameStatus !== 'paused') return state;
      return { ...state, gameStatus: 'playing' };
    }

    case 'MOVE_LEFT': {
      if (state.gameStatus !== 'playing' || !state.activePiece) return state;

      const shape = getTetrominoShape(state.activePiece.type, state.activePiece.rotation);
      const newX = state.activePiece.position.x - 1;

      if (isValidPosition(state.board, shape, newX, state.activePiece.position.y)) {
        return {
          ...state,
          activePiece: {
            ...state.activePiece,
            position: { ...state.activePiece.position, x: newX },
          },
        };
      }
      return state;
    }

    case 'MOVE_RIGHT': {
      if (state.gameStatus !== 'playing' || !state.activePiece) return state;

      const shape = getTetrominoShape(state.activePiece.type, state.activePiece.rotation);
      const newX = state.activePiece.position.x + 1;

      if (isValidPosition(state.board, shape, newX, state.activePiece.position.y)) {
        return {
          ...state,
          activePiece: {
            ...state.activePiece,
            position: { ...state.activePiece.position, x: newX },
          },
        };
      }
      return state;
    }

    case 'MOVE_DOWN': {
      if (state.gameStatus !== 'playing' || !state.activePiece) return state;

      const shape = getTetrominoShape(state.activePiece.type, state.activePiece.rotation);
      const newY = state.activePiece.position.y + 1;

      if (isValidPosition(state.board, shape, state.activePiece.position.x, newY)) {
        return {
          ...state,
          activePiece: {
            ...state.activePiece,
            position: { ...state.activePiece.position, y: newY },
          },
          score: state.score + 1, // Soft drop bonus
        };
      }
      return state;
    }

    case 'HARD_DROP': {
      if (state.gameStatus !== 'playing' || !state.activePiece) return state;

      const distance = getHardDropDistance(state.board, state.activePiece);
      const newY = state.activePiece.position.y + distance;

      return {
        ...state,
        activePiece: {
          ...state.activePiece,
          position: { ...state.activePiece.position, y: newY },
        },
        score: state.score + calculateHardDropScore(distance),
      };
    }

    case 'ROTATE': {
      if (state.gameStatus !== 'playing' || !state.activePiece) return state;

      const fromRotation = state.activePiece.rotation;
      const toRotation = ((fromRotation + 1) % 4) as 0 | 1 | 2 | 3;
      const newShape = getTetrominoShape(state.activePiece.type, toRotation);

      // Try wall kicks
      const kicks = getWallKickData(state.activePiece.type, fromRotation, toRotation);

      for (const kick of kicks) {
        const newX = state.activePiece.position.x + kick.x;
        const newY = state.activePiece.position.y - kick.y;

        if (isValidPosition(state.board, newShape, newX, newY)) {
          return {
            ...state,
            activePiece: {
              ...state.activePiece,
              rotation: toRotation,
              position: { x: newX, y: newY },
            },
          };
        }
      }
      return state;
    }

    case 'HOLD': {
      if (state.gameStatus !== 'playing' || !state.activePiece || !state.canHold) {
        return state;
      }

      const currentType = state.activePiece.type;

      if (state.heldPiece === null) {
        // First hold - take from next queue
        const nextPiece = state.nextPieces[0];
        return {
          ...state,
          heldPiece: currentType,
          activePiece: spawnPiece(nextPiece),
          nextPieces: state.nextPieces.slice(1),
          canHold: false,
        };
      } else {
        // Swap with held piece
        return {
          ...state,
          heldPiece: currentType,
          activePiece: spawnPiece(state.heldPiece),
          canHold: false,
        };
      }
    }

    case 'TICK': {
      if (state.gameStatus !== 'playing' || !state.activePiece) return state;

      const shape = getTetrominoShape(state.activePiece.type, state.activePiece.rotation);
      const newY = state.activePiece.position.y + 1;

      // Can move down
      if (isValidPosition(state.board, shape, state.activePiece.position.x, newY)) {
        return {
          ...state,
          activePiece: {
            ...state.activePiece,
            position: { ...state.activePiece.position, y: newY },
          },
        };
      }

      // Cannot move down - lock the piece
      return state; // Lock will be handled by LOCK_PIECE action
    }

    case 'LOCK_PIECE': {
      if (!state.activePiece) return state;

      // Lock piece to board
      let newBoard = lockPiece(state.board, state.activePiece);

      // Clear lines
      const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);

      // Calculate score
      const newCombo = linesCleared > 0 ? state.comboCount + 1 : 0;
      const totalLines = state.linesCleared + linesCleared;
      const newLevel = getLevelFromLines(totalLines);
      const lineScore = calculateLineClearScore(linesCleared, state.level, state.comboCount);

      return {
        ...state,
        board: clearedBoard,
        activePiece: null,
        canHold: true,
        score: state.score + lineScore,
        linesCleared: totalLines,
        level: newLevel,
        comboCount: newCombo,
      };
    }

    case 'GAME_OVER': {
      return {
        ...state,
        gameStatus: 'gameOver',
      };
    }

    default:
      return state;
  }
}

// Custom hook for game state management
export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, createInitialState());
  const randomizerRef = useRef<Randomizer>(new Randomizer());

  // Start new game
  const startGame = useCallback(() => {
    randomizerRef.current.reset();
    const initialQueue = createInitialQueue(randomizerRef.current, PREVIEW_COUNT + 1);
    const firstPiece = initialQueue[0];
    const nextPieces = initialQueue.slice(1);

    dispatch({ type: 'START_GAME' });

    // We need to set the initial state with pieces
    // Since reducer doesn't have access to randomizer, we'll handle this differently
    return {
      activePiece: spawnPiece(firstPiece),
      nextPieces,
    };
  }, []);

  // Get next piece from queue
  const getNextPiece = useCallback((): { piece: TetrominoType; nextPieces: TetrominoType[] } => {
    const nextPiece = randomizerRef.current.next();
    return {
      piece: nextPiece,
      nextPieces: [...state.nextPieces.slice(1), nextPiece],
    };
  }, [state.nextPieces]);

  // Check if spawn position is valid (for game over detection)
  const canSpawn = useCallback((type: TetrominoType): boolean => {
    const position = getSpawnPosition(type);
    const shape = getTetrominoShape(type, 0);
    return isValidPosition(state.board, shape, position.x, position.y);
  }, [state.board]);

  return {
    state,
    dispatch,
    startGame,
    getNextPiece,
    canSpawn,
    randomizer: randomizerRef.current,
  };
}
