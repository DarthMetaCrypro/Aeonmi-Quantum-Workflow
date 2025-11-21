# QuantumForge Mobile Frontend

Dark-metallic React Native experience for designing and evolving revenue-optimized workflows. All state, metrics, and evolution flows are fully mocked and persisted locally; no backend calls are performed.

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- Yarn
- Xcode (for iOS) / Android Studio + SDK (for Android)
- Ruby + CocoaPods (for iOS builds)

### Installation

```bash
yarn install
```

### Development

```bash
yarn start          # Metro bundler
yarn ios            # iOS simulator (requires Mac + Xcode)
yarn android        # Android emulator/device
```

### Testing & Linting

```bash
yarn test
yarn lint
```

### Troubleshooting

- **iOS pods**: `cd ios && pod install`
- **Android SDK**: ensure ANDROID_HOME and emulator images are configured
- Clear caches: `yarn start --reset-cache`

## Project Structure

```
app/
  App.tsx
  src/
    components/
    screens/
    graph/
    mocks/
    state/
    theme/
    utils/
```

## Key Features

- Offline-first workflow modeling with AsyncStorage persistence
- High-performance node/edge canvas with gesture controls and SVG rendering
- Evolution panel to mock Titan-driven variants and A/B evaluations
- Run history analytics with KPI sparklines and QBER trends
- Accessibility-focused UI with large targets and dynamic type support

## License

Internal use only.
