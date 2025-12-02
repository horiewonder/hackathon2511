# Splatoon-Style Tetris

React Native + Skia で作られた、スプラトゥーン風のテトリスゲーム。

![Splatoon Tetris](https://img.shields.io/badge/React%20Native-Skia-00F5FF?style=for-the-badge)
![Expo](https://img.shields.io/badge/Expo-54-FF6090?style=for-the-badge)

## Features

- Classic Tetris gameplay with 7 tetromino types (I, O, T, S, Z, J, L)
- **Hold piece** - Save a piece for later use
- **Ghost piece** - Preview where the piece will land
- **Next preview** - See the next 3 pieces
- **Level system** - Speed increases every 10 lines
- **SRS rotation** - Super Rotation System with wall kicks
- **7-bag randomizer** - Fair piece distribution
- **Splatoon-style visuals** - Vibrant neon colors and ink-like effects

## Controls

| Button | Action |
|--------|--------|
| HOLD | Save current piece |
| ← → | Move left/right (hold for repeat) |
| ▼ | Soft drop (hold for repeat) |
| ↻ | Rotate clockwise |
| DROP | Hard drop (instant) |

## How to Run

```sh
# Install dependencies
npm install

# Start development server
npm start

# Run on web
npm run web

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Tech Stack

- **React Native** 0.81.4
- **Expo** 54 with Expo Router
- **@shopify/react-native-skia** 2.2.12 - GPU-accelerated graphics
- **react-native-reanimated** 4.x - Smooth animations

## Project Structure

```text
├── app/
│   └── index.tsx              # Game entry point
├── components/
│   ├── game/
│   │   ├── TetrisGame.tsx     # Main game component
│   │   ├── GameBoard.tsx      # Board rendering
│   │   ├── Tetromino.tsx      # Piece rendering
│   │   ├── GhostPiece.tsx     # Drop preview
│   │   └── TouchControls.tsx  # Touch input UI
│   └── effects/
│       └── SplatBackground.tsx # Animated ink background
├── hooks/
│   ├── useGameState.ts        # Game state management
│   ├── useCollision.ts        # Collision detection
│   └── useGameLoop.ts         # Game loop logic
├── constants/
│   ├── tetrominos.ts          # Tetromino shapes & colors
│   ├── colors.ts              # Splatoon color palette
│   ├── gameConfig.ts          # Game settings
│   └── wallKickData.ts        # SRS wall kick data
├── utils/
│   ├── board.ts               # Board operations
│   ├── randomizer.ts          # 7-bag randomizer
│   └── scoring.ts             # Score calculation
└── types/
    └── game.ts                # TypeScript definitions
```

## Scoring

| Action | Points |
|--------|--------|
| Single (1 line) | 100 × level |
| Double (2 lines) | 300 × level |
| Triple (3 lines) | 500 × level |
| Tetris (4 lines) | 800 × level |
| Soft drop | 1 per cell |
| Hard drop | 2 per cell |
| Combo | 50 × combo × level |

## Deploy

```sh
# Deploy to web (EAS Hosting)
npm run deploy

# Build for iOS/Android
npx eas-cli build
```

## License

MIT
