// AI Assistant Service - Integration with Aeonmi AI Assistant Backend
// Provides access to quantum AI, optimization, and workflow processing

const AI_ASSISTANT_URL = process.env.REACT_APP_AI_ASSISTANT_URL || 'http://localhost:5000';
const AI_API_KEY = process.env.REACT_APP_AI_API_KEY || 'dev-key';

export interface AIAssistantResponse {
  status: 'success' | 'error';
  result?: any;
  message?: string;
  quantum_similarity?: number;
}

export interface WorkflowQuery {
  query: string;
  context?: any;
}

export interface QuantumJobRequest {
  shots?: number;
  useHardware?: boolean;
}

export interface MLTaskRequest {
  task_type: string;
  data: any;
}

export interface QuantumMLTrainingRequest {
  training_data: number[][];
  labels: number[];
  num_qubits?: number;
  num_layers?: number;
}

export interface OptimizationRequest {
  type: 'knapsack' | 'portfolio' | 'tsp';
  values?: number[];
  weights?: number[];
  capacity?: number;
  returns?: number[];
  risks?: number[];
  budget?: number;
  risk_tolerance?: number;
  cities?: number[][];
}

class AIAssistantService {
  private async makeRequest(endpoint: string, data: any): Promise<AIAssistantResponse> {
    try {
      const response = await fetch(`${AI_ASSISTANT_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': AI_API_KEY,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('AI Assistant API Error:', error);
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Workflow Processing - Main AI reasoning and automation
  async processWorkflow(query: WorkflowQuery): Promise<AIAssistantResponse> {
    return this.makeRequest('/api/workflow', query);
  }

  // Quantum Computing Operations
  async runQuantumJob(request: QuantumJobRequest = {}): Promise<AIAssistantResponse> {
    return this.makeRequest('/api/quantum', request);
  }

  // Machine Learning Tasks
  async runMLTask(request: MLTaskRequest): Promise<AIAssistantResponse> {
    return this.makeRequest('/api/ml', request);
  }

  // Quantum Random Generation
  async generateQuantumRandom(length: number = 32): Promise<AIAssistantResponse> {
    return this.makeRequest('/api/quantum-random', { length });
  }

  // Quantum Chemistry Calculations
  async runQuantumChemistry(molecule: string): Promise<AIAssistantResponse> {
    return this.makeRequest('/api/quantum-chemistry', { molecule });
  }

  // Quantum Fraud Detection
  async detectFraud(transactionData: any): Promise<AIAssistantResponse> {
    return this.makeRequest('/api/quantum-fraud', { transaction_data: transactionData });
  }

  // Quantum Logistics Optimization
  async optimizeLogistics(routes: any): Promise<AIAssistantResponse> {
    return this.makeRequest('/api/quantum-logistics', { routes });
  }

  // Quantum Portfolio Optimization
  async optimizePortfolio(request: OptimizationRequest): Promise<AIAssistantResponse> {
    return this.makeRequest('/api/optimize/portfolio', request);
  }

  // Quantum Knapsack Problem
  async solveKnapsack(request: OptimizationRequest): Promise<AIAssistantResponse> {
    return this.makeRequest('/api/optimize/knapsack', request);
  }

  // Quantum Machine Learning
  async trainQuantumML(request: QuantumMLTrainingRequest): Promise<AIAssistantResponse> {
    return this.makeRequest('/api/quantum-ml/train', request);
  }

  async predictQuantumML(pattern1: number[], pattern2: number[]): Promise<AIAssistantResponse> {
    return this.makeRequest('/api/quantum-ml/predict', { pattern1, pattern2 });
  }

  // Constructor AI - Advanced reasoning and workflow construction
  async constructorQuery(query: string, context: any = {}): Promise<AIAssistantResponse> {
    return this.makeRequest('/api/constructor', {
      query,
      context,
      escalation_level: 'medium'
    });
  }

  // Health Check
  async healthCheck(): Promise<AIAssistantResponse> {
    try {
      const response = await fetch(`${AI_ASSISTANT_URL}/api/health`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }
}

const aiAssistantService = new AIAssistantService();
export default aiAssistantService;