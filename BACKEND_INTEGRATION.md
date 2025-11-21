# QuantumForge Backend Integration Guide

## Quick Start

### 1. Start Backend Server

```powershell
cd "c:\Users\wlwil\AI Assistant\backend"
python app.py
```

The server will start on `http://localhost:5000`

### 2. Test Backend Connection

Open browser and visit: `http://localhost:5000/api/health`

You should see:
```json
{
  "status": "online",
  "message": "Quantum AI Assistant API is running",
  "endpoints": 40,
  "training_samples": 531
}
```

### 3. Start Frontend (Tauri Dev Mode)

```powershell
cd "c:\Users\wlwil\Desktop\Aeonmi QW\AQW\New folder\quantumforge\frontend"
npm run tauri dev
```

## API Integration Status

### ✅ Completed
- **API Client** (`services/api.ts`) - Complete HTTP client with all endpoints
- **Workflow Service** (`services/workflowService.ts`) - Workflow management with AI reasoning
- **Quantum Service** (`services/quantumService.ts`) - Quantum operations wrapper
- **Dashboard Integration** - Real-time backend health monitoring
- **WorkflowEditor Integration** - Save and execute workflows with AI

### 🔄 In Progress
- BB84 Quantum Security integration with Tauri commands
- Real-time workflow execution monitoring
- Quantum algorithm visualizations

## Environment Setup

Create `.env.local` file (already created):
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_API_KEY=dev-quantum-key-2025
REACT_APP_ENV=development
```

## API Endpoints Available

### Core
- `GET /api/health` - System health check

### Workflow & AI
- `POST /api/workflow` - AI workflow reasoning

### Quantum
- `POST /api/quantum` - Run quantum circuits
- `POST /api/quantum-random` - Generate quantum random numbers

### Quantum ML
- `POST /api/quantum-ml/train` - Train quantum neural networks
- `POST /api/quantum-ml/predict` - Quantum pattern matching

### Optimization
- `POST /api/optimize/knapsack` - Quantum knapsack optimization
- `POST /api/optimize/portfolio` - Portfolio optimization
- `POST /api/optimize/scheduling` - Task scheduling

### Hardware
- `POST /api/hardware/connect` - Connect to IBM Quantum
- `GET /api/hardware/info` - Get hardware information
- `POST /api/hardware/run` - Execute on real quantum hardware

### Quantum Services
- `POST /api/chemistry/simulate` - Molecular simulation
- `POST /api/random/secure-key` - Cryptographic key generation
- `POST /api/fraud/detect` - Quantum fraud detection
- `POST /api/logistics/route` - Route optimization
- `POST /api/qube/bb84` - BB84 key exchange
- `POST /api/qube/teleport` - Quantum teleportation
- `POST /api/qube/superdense` - Superdense coding

## Testing API Integration

### From Frontend Console:

```javascript
// Test health
fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(console.log);

// Test workflow AI (requires API key)
fetch('http://localhost:5000/api/workflow', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'dev-quantum-key-2025'
  },
  body: JSON.stringify({ query: 'Optimize my data pipeline' })
}).then(r => r.json()).then(console.log);
```

### Using Services:

```typescript
import api from './services/api';
import workflowService from './services/workflowService';

// Check backend
const health = await api.checkHealth();
console.log(health);

// Execute workflow with AI
const execution = await workflowService.executeWorkflow('workflow-id');
console.log(execution.result);
```

## Next Steps

1. **BB84 Integration**: Add Tauri commands for quantum key distribution
2. **Real-time Updates**: WebSocket integration for live workflow monitoring
3. **Quantum Visualizations**: Circuit and state visualization components
4. **AI Constructor**: Integrate AI assistant for workflow suggestions

## Troubleshooting

### Backend Not Starting
- Ensure Python dependencies installed: `pip install -r requirements.txt`
- Check port 5000 is not in use
- Verify API key in backend configuration

### CORS Errors
- Backend already has CORS enabled via `flask-cors`
- Check API_URL in `.env.local` matches backend

### API Key Issues
- Frontend uses: `dev-quantum-key-2025`
- Backend validates via `X-API-Key` header
- Update both if needed

## Architecture

```
Frontend (React + Tauri)
  ↓ HTTP/REST
Backend (Flask + Python)
  ↓ Quantum Operations
IBM Quantum / Qiskit
  ↓ BB84 Security
Rust Security Module
```
