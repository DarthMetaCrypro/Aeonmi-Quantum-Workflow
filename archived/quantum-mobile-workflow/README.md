# Quantum Mobile Workflow Engine

A React Native mobile application for self-evolving quantum workflows powered by Aeonmi.ai and QUBE.

## Features

- **Evolution-Aware Workflows**: Versioned workflows with automatic optimization via Titan
- **Quantum Security**: BB84 key distribution and QUBE-secured operations
- **Mobile Canvas Editor**: Touch-based workflow design with quantum node types
- **Metrics & Analytics**: Real-time KPI tracking and A/B testing
- **Aeonmi Integration**: Compile workflows to Aeonmi.ai programs

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. For iOS (macOS only):
   ```bash
   cd ios && pod install && cd ..
   npm run ios
   ```

3. For Android:
   ```bash
   npm run android
   ```

## Architecture

- **Types**: Evolution-aware data models in `src/types.ts`
- **Services**: Aeonmi compiler, QUBE operations, Titan optimizer, metrics collection
- **Screens**: Dashboard, canvas editor, run history
- **Components**: Evolution policy configuration panel

## Quantum Integration

- **BB84 Protocol**: Quantum key generation for secure workflows
- **QUBE Engine**: Quantum-classical hybrid computation
- **MetaFabric**: Self-evolving workflow optimization
- **Aeonmi.ai**: Symbolic layer for quantum-secured automation

## Development

- Use TypeScript for type safety
- Dark metallic theme (#00d4ff accents)
- Mobile-first design with touch interactions
- Quantum constraints enforced in evolution policies