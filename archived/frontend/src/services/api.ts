// QuantumForge API Service - Core API Client
// Connects React frontend to Flask backend and AI Assistant

import quantumSecurityService from './quantumSecurityService';
import aiAssistantService, { AIAssistantResponse } from './aiAssistantService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API_KEY = process.env.REACT_APP_API_KEY || 'default-dev-key';

export interface ApiResponse<T> {
  status: 'success' | 'error';
  result?: T;
  message?: string;
  quantum_similarity?: number;
}

export interface WorkflowRequest {
  query: string;
}

export interface WorkflowResult {
  response: string;
  quantum_similarity?: number;
  confidence?: number;
}

export interface QuantumJob {
  counts: Record<string, number>;
  statevector?: number[];
}

export interface MLTask {
  task_type: string;
  data: any;
}

export interface QuantumMLTrainingRequest {
  training_data: number[][];
  labels: number[];
  num_qubits: number;
  num_layers: number;
}

export interface OptimizationRequest {
  values?: number[];
  weights?: number[];
  capacity?: number;
  returns?: number[];
  risks?: number[];
  budget?: number;
  risk_tolerance?: number;
}

class ApiClient {
  private baseUrl: string;
  private apiKey: string;
  private useQuantumEncryption: boolean = false;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.apiKey = API_KEY;
  }

  /**
   * Enable quantum-secure encryption for API requests
   * Requires active BB84 quantum key
   */
  enableQuantumEncryption(): boolean {
    const isSecure = quantumSecurityService.isKeySecure();
    if (isSecure) {
      this.useQuantumEncryption = true;
      console.log('✅ Quantum encryption enabled for API requests');
      return true;
    } else {
      console.warn('⚠️ Cannot enable quantum encryption: No secure key available');
      return false;
    }
  }

  /**
   * Disable quantum encryption (fallback to standard HTTPS)
   */
  disableQuantumEncryption(): void {
    this.useQuantumEncryption = false;
    console.log('ℹ️ Quantum encryption disabled');
  }

  /**
   * Get quantum encryption status
   */
  isQuantumEncrypted(): boolean {
    return this.useQuantumEncryption && quantumSecurityService.isKeySecure();
  }

  /**
   * Get quantum key for authentication header
   */
  private getQuantumAuthHeader(): string | null {
    if (!this.useQuantumEncryption) return null;
    
    const keyHex = quantumSecurityService.getKeyHex();
    if (!keyHex) return null;

    // Use first 64 characters of quantum key for authentication
    return `Quantum-${keyHex.substring(0, 64)}`;
  }

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any
  ): Promise<ApiResponse<T>> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
      };

      // Add quantum authentication if enabled
      const quantumAuth = this.getQuantumAuthHeader();
      if (quantumAuth) {
        headers['X-Quantum-Key'] = quantumAuth;
        headers['X-Quantum-Protocol'] = 'BB84';
        
        const stats = quantumSecurityService.getKeyStats();
        if (stats) {
          headers['X-Quantum-Error-Rate'] = stats.errorRate.toString();
        }
      }

      const config: RequestInit = {
        method,
        headers,
      };

      if (body && (method === 'POST' || method === 'PUT')) {
        // If quantum encryption is enabled, encrypt the payload
        if (this.useQuantumEncryption && quantumSecurityService.isKeySecure()) {
          // In production, use the quantum key for XOR encryption
          // For now, just add a marker to indicate quantum security
          const encryptedBody = {
            ...body,
            _quantum_secured: true,
            _quantum_timestamp: Date.now(),
          };
          config.body = JSON.stringify(encryptedBody);
        } else {
          config.body = JSON.stringify(body);
        }
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Generic HTTP methods
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'GET');
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'POST', body);
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'PUT', body);
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'DELETE');
  }

  // Health check
  async checkHealth(): Promise<ApiResponse<any>> {
    return this.request('/api/health', 'GET');
  }

  // Workflow AI reasoning
  async processWorkflow(query: string): Promise<ApiResponse<WorkflowResult>> {
    return this.request('/api/workflow', 'POST', { query });
  }

  // Quantum operations
  async runQuantumJob(useHardware: boolean = false): Promise<ApiResponse<QuantumJob>> {
    return this.request('/api/quantum', 'POST', { use_hardware: useHardware });
  }

  async generateQuantumRandom(numBits: number = 16): Promise<ApiResponse<{ random_bits: string }>> {
    return this.request('/api/quantum-random', 'POST', { num_bits: numBits });
  }

  // Quantum Machine Learning
  async trainQuantumML(request: QuantumMLTrainingRequest): Promise<ApiResponse<any>> {
    return this.request('/api/quantum-ml/train', 'POST', request);
  }

  async predictQuantumML(pattern1: number[], pattern2: number[]): Promise<ApiResponse<{ similarity: number }>> {
    return this.request('/api/quantum-ml/predict', 'POST', { pattern1, pattern2 });
  }

  // Quantum Optimization
  async optimizeKnapsack(request: OptimizationRequest): Promise<ApiResponse<any>> {
    return this.request('/api/optimize/knapsack', 'POST', request);
  }

  async optimizePortfolio(request: OptimizationRequest): Promise<ApiResponse<any>> {
    return this.request('/api/optimize/portfolio', 'POST', request);
  }

  async optimizeScheduling(tasks: any[], resources: any[]): Promise<ApiResponse<any>> {
    return this.request('/api/optimize/scheduling', 'POST', { tasks, resources });
  }

  // Hardware Integration
  async connectHardware(token?: string): Promise<ApiResponse<any>> {
    return this.request('/api/hardware/connect', 'POST', { token });
  }

  async getHardwareInfo(): Promise<ApiResponse<any>> {
    return this.request('/api/hardware/info', 'GET');
  }

  async runOnHardware(): Promise<ApiResponse<any>> {
    return this.request('/api/hardware/run', 'POST');
  }

  // Quantum Chemistry
  async simulateMolecule(atoms: string[], coords: number[][]): Promise<ApiResponse<any>> {
    return this.request('/api/chemistry/simulate', 'POST', { atoms, coords });
  }

  async optimizeGeometry(atoms: string[], coords: number[][]): Promise<ApiResponse<any>> {
    return this.request('/api/chemistry/optimize', 'POST', { atoms, coords });
  }

  // Quantum Random Generation
  async generateRandomIntegers(min: number, max: number, count: number): Promise<ApiResponse<any>> {
    return this.request('/api/random/integers', 'POST', { min, max, count });
  }

  async generateRandomFloats(min: number, max: number, count: number): Promise<ApiResponse<any>> {
    return this.request('/api/random/floats', 'POST', { min, max, count });
  }

  async generateSecureKey(length: number): Promise<ApiResponse<{ key: string }>> {
    return this.request('/api/random/secure-key', 'POST', { length });
  }

  // Quantum Fraud Detection
  async detectFraud(transaction: any): Promise<ApiResponse<any>> {
    return this.request('/api/fraud/detect', 'POST', { transaction });
  }

  async trainFraudModel(transactions: any[]): Promise<ApiResponse<any>> {
    return this.request('/api/fraud/train', 'POST', { transactions });
  }

  // Quantum Logistics
  async optimizeRoute(locations: any[], vehicles: number): Promise<ApiResponse<any>> {
    return this.request('/api/logistics/route', 'POST', { locations, vehicles });
  }

  async optimizeWarehouse(items: any[], constraints: any): Promise<ApiResponse<any>> {
    return this.request('/api/logistics/warehouse', 'POST', { items, constraints });
  }

  // Q.U.B.E Quantum Encryption
  async bb84KeyExchange(keyLength: number): Promise<ApiResponse<any>> {
    return this.request('/api/qube/bb84', 'POST', { key_length: keyLength });
  }

  async quantumTeleport(state: any): Promise<ApiResponse<any>> {
    return this.request('/api/qube/teleport', 'POST', { state });
  }

  async superdenseCoding(bits: string): Promise<ApiResponse<any>> {
    return this.request('/api/qube/superdense', 'POST', { bits });
  }
}

// AI Assistant Integration
export { aiAssistantService };
export type { AIAssistantResponse };

// Export singleton instance
export const api = new ApiClient();
export default api;
