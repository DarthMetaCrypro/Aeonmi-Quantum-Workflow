# QuantumForge Enterprise API Documentation

## Overview

The QuantumForge Enterprise API provides comprehensive access to quantum workflow automation capabilities, including workflow management, AI assistance, quantum computing integration, and enterprise security features.

**Base URL:** `https://api.quantumforge.com`
**Version:** v1.0.0
**Authentication:** JWT Bearer Token

## Authentication

All API requests require authentication using JWT tokens obtained through the login process.

### Headers
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

### Token Refresh
```http
POST /api/auth/refresh
Authorization: Bearer <refresh-token>
```

## Core Endpoints

### Authentication

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@company.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "organization": "Acme Corp"
}
```

**Response:**
```json
{
  "user_id": "user-123",
  "email": "user@company.com",
  "organization_id": "org-456",
  "token": "jwt-token-here",
  "refresh_token": "refresh-token-here"
}
```

#### POST /api/auth/login
Authenticate user credentials.

**Request Body:**
```json
{
  "email": "user@company.com",
  "password": "SecurePass123!"
}
```

**Response:** Same as registration

### Workflows

#### GET /api/workflows
List user workflows with pagination.

**Query Parameters:**
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 20)
- `status` (string): Filter by status (active, draft, archived)
- `search` (string): Search in workflow names

**Response:**
```json
{
  "workflows": [
    {
      "id": "wf-123",
      "name": "Data Processing Pipeline",
      "description": "Automated data processing with quantum optimization",
      "status": "active",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-20T14:45:00Z",
      "nodes_count": 12,
      "executions_count": 45
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

#### POST /api/workflows
Create a new workflow.

**Request Body:**
```json
{
  "name": "Quantum Data Pipeline",
  "description": "Advanced data processing with quantum algorithms",
  "nodes": [
    {
      "id": "input-1",
      "type": "DATA_INPUT",
      "position": {"x": 100, "y": 100},
      "config": {
        "source": "api",
        "endpoint": "/api/data",
        "format": "json"
      }
    },
    {
      "id": "quantum-1",
      "type": "QUANTUM_OPTIMIZER",
      "position": {"x": 300, "y": 100},
      "config": {
        "algorithm": "QAOA",
        "backend": "ibm_quantum",
        "shots": 1024
      }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "input-1",
      "target": "quantum-1",
      "sourceHandle": "output",
      "targetHandle": "input"
    }
  ]
}
```

#### GET /api/workflows/{id}
Get detailed workflow information.

**Response:**
```json
{
  "id": "wf-123",
  "name": "Quantum Data Pipeline",
  "description": "Advanced data processing with quantum algorithms",
  "status": "active",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-20T14:45:00Z",
  "created_by": "user-123",
  "organization_id": "org-456",
  "nodes": [...],
  "edges": [...],
  "settings": {
    "auto_save": true,
    "version_control": true,
    "quantum_optimization": true
  },
  "permissions": {
    "owner": "user-123",
    "editors": ["user-456"],
    "viewers": ["user-789"]
  }
}
```

#### PUT /api/workflows/{id}
Update workflow configuration.

**Request Body:** Same as creation, plus version control.

#### DELETE /api/workflows/{id}
Archive workflow (soft delete).

#### POST /api/workflows/{id}/execute
Execute workflow with optional parameters.

**Request Body:**
```json
{
  "parameters": {
    "input_data": {"key": "value"},
    "quantum_shots": 2048,
    "optimization_level": "high"
  },
  "async": true,
  "priority": "normal"
}
```

**Response:**
```json
{
  "execution_id": "exec-123",
  "status": "queued",
  "estimated_duration": "5m 30s",
  "queue_position": 3
}
```

### AI Assistant (MotherAI)

#### POST /api/ai/chat
Interact with MotherAI assistant.

**Request Body:**
```json
{
  "message": "Create a workflow for quantum portfolio optimization",
  "context": {
    "workflow_id": "wf-123",
    "quantum_backend": "ibm_quantum",
    "optimization_goal": "risk_return"
  },
  "conversation_id": "conv-456"
}
```

**Response:**
```json
{
  "response": "I'll help you create a quantum portfolio optimization workflow...",
  "suggestions": [
    {
      "type": "workflow_template",
      "title": "Quantum Portfolio Optimizer",
      "description": "Uses QAOA algorithm for portfolio optimization",
      "confidence": 0.95
    }
  ],
  "actions": [
    {
      "type": "create_workflow",
      "workflow_data": {...}
    }
  ],
  "conversation_id": "conv-456",
  "quantum_insights": {
    "algorithm_recommendation": "QAOA",
    "estimated_runtime": "45 seconds",
    "quantum_advantage": "2.3x speedup"
  }
}
```

#### GET /api/ai/conversations
Get conversation history.

#### POST /api/ai/optimize
Request AI optimization for existing workflow.

### Quantum Computing

#### GET /api/quantum/backends
List available quantum computing backends.

**Response:**
```json
{
  "backends": [
    {
      "id": "ibm_quantum_ibmq_manhattan",
      "provider": "IBM Quantum",
      "name": "ibmq_manhattan",
      "qubits": 65,
      "status": "online",
      "queue_depth": 12,
      "estimated_wait": "3m 20s",
      "capabilities": ["gate_based", "pulse_control"],
      "supported_gates": ["cx", "rz", "sx", "x"],
      "calibration_date": "2024-01-20T08:00:00Z"
    }
  ]
}
```

#### POST /api/quantum/circuits/validate
Validate quantum circuit before execution.

**Request Body:**
```json
{
  "circuit": {
    "qubits": 3,
    "gates": [
      {"gate": "h", "qubits": [0]},
      {"gate": "cx", "qubits": [0, 1]},
      {"gate": "measure", "qubits": [0, 1, 2]}
    ]
  },
  "backend": "ibm_quantum"
}
```

**Response:**
```json
{
  "valid": true,
  "warnings": [],
  "estimated_cost": 5,
  "estimated_runtime": "2m 15s",
  "optimization_suggestions": [
    "Consider using parametric gates for better calibration"
  ]
}
```

#### POST /api/quantum/jobs
Submit quantum computing job.

**Request Body:**
```json
{
  "circuit": {...},
  "backend": "ibm_quantum_ibmq_manhattan",
  "shots": 1024,
  "optimization_level": 2,
  "tags": ["portfolio-optimization", "qaoa"]
}
```

### Security & BB84

#### POST /api/security/bb84/generate-key
Generate quantum-secure key pair.

**Request Body:**
```json
{
  "key_length": 256,
  "purpose": "encryption",
  "expiration_hours": 24
}
```

**Response:**
```json
{
  "key_id": "bb84-key-123",
  "public_key": "base64-encoded-public-key",
  "key_fingerprint": "sha256-hash",
  "expires_at": "2024-01-21T10:30:00Z",
  "security_level": "unconditional"
}
```

#### POST /api/security/encrypt
Encrypt data using quantum-secure methods.

#### POST /api/security/decrypt
Decrypt data using quantum-secure methods.

### Monitoring & Analytics

#### GET /api/monitoring/health
System health check.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-20T10:30:00Z",
  "services": {
    "backend": "healthy",
    "database": "healthy",
    "quantum_backends": "healthy",
    "cache": "healthy"
  },
  "metrics": {
    "uptime": "99.98%",
    "response_time_p95": "245ms",
    "error_rate": "0.02%"
  }
}
```

#### GET /api/analytics/workflows
Workflow execution analytics.

**Query Parameters:**
- `period` (string): day, week, month, year
- `workflow_id` (string): Specific workflow
- `organization_id` (string): Organization filter

**Response:**
```json
{
  "period": "month",
  "total_executions": 15420,
  "successful_executions": 15234,
  "failed_executions": 186,
  "average_runtime": "4m 32s",
  "quantum_jobs": 8920,
  "ai_optimizations": 6540,
  "cost_breakdown": {
    "quantum_compute": 1250.50,
    "ai_processing": 340.75,
    "storage": 89.25
  },
  "performance_trends": [...]
}
```

### Enterprise Features

#### GET /api/enterprise/organizations/{id}
Get organization details (admin only).

#### POST /api/enterprise/users/invite
Invite users to organization.

#### GET /api/enterprise/audit-logs
Access audit logs for compliance.

#### POST /api/enterprise/backups
Trigger backup operations.

## Error Handling

All API errors follow this format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid workflow configuration",
    "details": {
      "field": "nodes[0].config.endpoint",
      "issue": "URL format invalid"
    },
    "request_id": "req-123-456-789",
    "timestamp": "2024-01-20T10:30:00Z"
  }
}
```

### Common Error Codes
- `AUTHENTICATION_ERROR`: Invalid or expired token
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `VALIDATION_ERROR`: Invalid request data
- `RESOURCE_NOT_FOUND`: Requested resource doesn't exist
- `QUOTA_EXCEEDED`: Rate limit or quota exceeded
- `QUANTUM_BACKEND_ERROR`: Quantum hardware unavailable
- `INTERNAL_ERROR`: Server-side error

## Rate Limiting

API requests are subject to rate limiting:

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Authentication | 10/minute | Per IP |
| Workflow CRUD | 100/hour | Per user |
| Workflow Execution | 50/hour | Per user |
| AI Chat | 200/hour | Per user |
| Quantum Jobs | Based on subscription | Per organization |

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642680000
```

## Webhooks

Configure webhooks for real-time notifications:

```json
{
  "url": "https://your-app.com/webhooks/quantumforge",
  "events": ["workflow.completed", "quantum.job.finished", "ai.optimization.ready"],
  "secret": "your-webhook-secret"
}
```

### Supported Events
- `workflow.created`
- `workflow.updated`
- `workflow.executed`
- `workflow.failed`
- `quantum.job.queued`
- `quantum.job.completed`
- `ai.optimization.suggested`
- `security.alert`

## SDKs & Libraries

### Python SDK
```python
from quantumforge import QuantumForge

client = QuantumForge(api_key="your-api-key")

# Create workflow
workflow = client.workflows.create({
    "name": "Quantum Algorithm",
    "nodes": [...]
})

# Execute workflow
result = client.workflows.execute(workflow.id, parameters={...})
```

### JavaScript SDK
```javascript
import { QuantumForge } from '@quantumforge/sdk';

const client = new QuantumForge({ apiKey: 'your-api-key' });

// Create and execute workflow
const workflow = await client.workflows.create({
  name: 'Data Pipeline',
  nodes: [...]
});

const result = await client.workflows.execute(workflow.id);
```

## Support

- **Documentation:** https://docs.quantumforge.com
- **API Status:** https://status.quantumforge.com
- **Enterprise Support:** enterprise@quantumforge.com
- **Community Forum:** https://community.quantumforge.com

---

*Last updated: January 20, 2024*