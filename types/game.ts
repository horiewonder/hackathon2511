// Tetromino types
export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

// Rotation state (0=0°, 1=90°, 2=180°, 3=270°)
export type RotationState = 0 | 1 | 2 | 3;

// Position on the board
export interface Position {
  x: number;
  y: number;
}

// Tetromino shape matrix (4x4)
export type TetrominoShape = number[][];

// Active tetromino state
export interface ActiveTetromino {
  type: TetrominoType;
  position: Position;
  rotation: RotationState;
}

// Cell in the game board
export interface Cell {
  filled: boolean;
  color: string | null;
}

// Game board (20 rows x 10 columns)
export type GameBoard = Cell[][];

// Game status
export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameOver';

// Game state
export interface GameState {
  board: GameBoard;
  activePiece: ActiveTetromino | null;
  heldPiece: TetrominoType | null;
  canHold: boolean;
  nextPieces: TetrominoType[];
  score: number;
  level: number;
  linesCleared: number;
  gameStatus: GameStatus;
  comboCount: number;
}

// Game actions
export type GameAction =
  | { type: 'START_GAME' }
  | { type: 'PAUSE_GAME' }
  | { type: 'RESUME_GAME' }
  | { type: 'MOVE_LEFT' }
  | { type: 'MOVE_RIGHT' }
  | { type: 'MOVE_DOWN' }
  | { type: 'HARD_DROP' }
  | { type: 'ROTATE' }
  | { type: 'HOLD' }
  | { type: 'TICK' }
  | { type: 'LOCK_PIECE' }
  | { type: 'GAME_OVER' };

// Effect state for animations
export interface InkSplatter {
  id: string;
  x: number;
  y: number;
  color: string;
  scale: number;
  opacity: number;
}

export interface EffectState {
  lineClearRows: number[];
  inkSplatters: InkSplatter[];
  isLevelingUp: boolean;
}
