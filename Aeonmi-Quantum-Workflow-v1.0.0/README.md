# Aeonmi Quantum Workflow

A metallic steel, cyan pulses, glyph-locked quantum-classical hybrid programming platform with infinite on-device storage.

## Features

- **Quantum-Classical Hybrid**: Combines quantum computing with classical programming paradigms
- **Zero Cloud**: All data stored locally with QuantumVault compression
- **Glyph Security**: 8-character glyph-based authentication system
- **Infinite Storage**: On-device storage with holographic compression
- **Dark Steel Theme**: Metallic UI with cyan accent colors
- **Reanimated Animations**: Smooth 60fps animations with Reanimated 3
- **Skia Graphics**: High-performance 2D graphics rendering
- **Zustand State**: Lightweight, scalable state management

## Tech Stack

- **React Native Expo** - Cross-platform mobile development
- **TypeScript** - Type-safe JavaScript
- **Tailwind-rn** - Utility-first styling
- **Zustand** - State management
- **Reanimated 3** - High-performance animations
- **Skia** - 2D graphics rendering
- **qiskit-lite-forge** - On-device quantum computing
- **Electron** - Desktop wrapper

## Phase 4: Constructor Sentience & Desktop Deployment ✅
- [x] AI workflow assistant in Constructor screen
- [x] Intelligent node suggestions and auto-completion
- [x] Workflow validation and optimization
- [x] Electron configuration for desktop builds
- [x] Build scripts for Windows/macOS/Linux
- [x] Desktop-specific optimizations and features

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on device/emulator:
```bash
npm run android  # or npm run ios
```

## Desktop Deployment

Build and run the desktop application using Electron:

1. Install dependencies (if not already done):
```bash
npm install
```

2. Start development mode (opens both web server and Electron):
```bash
npm run electron:dev
```

3. Build for production:
```bash
npm run build:electron
```

4. Run Electron directly (requires web build):
```bash
npm run build:web && npm run electron
```

### Desktop Features
- Native application menus
- Keyboard shortcuts (Cmd/Ctrl+N, Cmd/Ctrl+S, etc.)
- System tray support
- File associations
- Auto-updates capability
- Cross-platform builds (Windows, macOS, Linux)

### Build Outputs
- **Windows**: `.exe` installer and portable versions
- **macOS**: `.dmg` disk image and `.app` bundle
- **Linux**: `.deb` packages and AppImage

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── FirstLaunchScreen.tsx
│   ├── QuantumCanvas.tsx
│   ├── NodeInspector.tsx
│   └── TitanEvolutionPanel.tsx
├── navigation/          # Navigation configuration
├── nodes/              # Node components and types
│   ├── BaseNode.tsx
│   ├── WebhookNode.tsx
│   ├── LoopNode.tsx
│   ├── TitanNode.tsx
│   ├── QUBENode.tsx
│   ├── EntropyWalletNode.tsx
│   ├── VoiceToGlyphNode.tsx
│   ├── EmotionalBalancerNode.tsx
│   ├── types.ts
│   └── index.ts
├── screens/            # Main screen components
├── stores/             # Zustand state stores
└── utils/              # Utility functions
    ├── GlyphSystem.ts
    └── QuantumVault.ts
```

## Security

- **Glyph Authentication**: 8-character secure glyph for access
- **QuantumVault**: Encrypted local storage with compression
- **Zero Cloud**: No external data transmission

## License

One-time $67 unlock for full access.