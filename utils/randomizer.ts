import { TetrominoType } from '../types/game';
import { ALL_TETROMINO_TYPES } from '../constants/tetrominos';

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// 7-bag randomizer class
export class Randomizer {
  private bag: TetrominoType[] = [];

  constructor() {
    this.refillBag();
  }

  private refillBag(): void {
    this.bag = shuffleArray([...ALL_TETROMINO_TYPES]);
  }

  // Get next piece
  next(): TetrominoType {
    if (this.bag.length === 0) {
      this.refillBag();
    }
    return this.bag.pop()!;
  }

  // Peek at upcoming pieces without removing them
  peek(count: number): TetrominoType[] {
    // Make sure we have enough pieces to peek
    while (this.bag.length < count) {
      const newBag = shuffleArray([...ALL_TETROMINO_TYPES]);
      this.bag = [...newBag, ...this.bag];
    }
    // Return last 'count' items (they will be popped first)
    return this.bag.slice(-count).reverse();
  }

  // Reset the randomizer
  reset(): void {
    this.bag = [];
    this.refillBag();
  }
}

// Create initial next pieces queue
export function createInitialQueue(randomizer: Randomizer, count: number): TetrominoType[] {
  const queue: TetrominoType[] = [];
  for (let i = 0; i < count; i++) {
    queue.push(randomizer.next());
  }
  return queue;
}
