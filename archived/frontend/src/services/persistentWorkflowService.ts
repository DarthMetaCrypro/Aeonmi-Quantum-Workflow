// Persistent Workflow Service - Manages workflow storage, sharing, and templates
import api, { ApiResponse } from './api';
import userService from './userService';
import iotPolicyService from './iotPolicyService';

export interface SavedWorkflow {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  nodes: any[];
  connections: any[];
  config: any;
  isPublic: boolean;
  isTemplate: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastExecutedAt?: Date;
  executionCount: number;
  rating: number;
  ratingsCount: number;
  thumbnail?: string;
  version: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // minutes
  useCases: string[];
  nodes: any[];
  connections: any[];
  config: any;
  createdBy: string;
  downloads: number;
  rating: number;
  thumbnail: string;
}

export interface WorkflowFolder {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  color?: string;
  createdAt: Date;
  workflowIds: string[];
}

class PersistentWorkflowService {
  private localWorkflows: Map<string, SavedWorkflow> = new Map();
  private folders: Map<string, WorkflowFolder> = new Map();

  // Helper function to create default config for nodes
  private createDefaultConfig(type: string): any {
    switch (type) {
      case 'input':
        return { source: 'dataset', autoRefresh: false, microAgents: [], microAiBlueprint: undefined };
      case 'process':
        return { script: 'transform()', retries: 1, microAgents: [], microAiBlueprint: undefined };
      case 'output':
        return { destination: 'dashboard', notifyOnCompletion: true, microAgents: [], microAiBlueprint: undefined };
      case 'quantum':
        return { shots: 1024, useHardware: false, microAgents: [], microAiBlueprint: undefined };
      case 'ai':
        return { model: 'gpt', temperature: 0.2, microAgents: [], microAiBlueprint: undefined };
      case 'api':
        return {
          method: 'GET',
          url: 'https://api.example.com/endpoint',
          headers: {},
          authType: 'none',
          timeout: 30,
          microAgents: [],
          microAiBlueprint: undefined
        };
      case 'social':
        return {
          platform: 'facebook',
          action: 'post',
          content: '',
          mediaUrls: [],
          hashtags: [],
          viralOptimization: true,
          microAgents: [],
          microAiBlueprint: undefined
        };
      default:
        return { microAgents: [], microAiBlueprint: undefined };
    }
  }

  // Workflow CRUD Operations
  async saveWorkflow(workflowData: {
    name: string;
    description?: string;
    category?: string;
    tags?: string[];
    nodes: any[];
    connections: any[];
    config?: any;
    isPublic?: boolean;
    folderId?: string;
  }): Promise<ApiResponse<SavedWorkflow>> {
    const user = userService.getCurrentUser();
    if (!user) {
      throw new Error('User must be logged in to save workflows');
    }

    // Check usage limits
    if (!userService.checkLimits('workflow')) {
      throw new Error('Workflow limit reached. Upgrade your plan to save more workflows.');
    }

    const workflow = {
      ...workflowData,
      createdBy: user.user.id,
      version: '1.0.0',
      executionCount: 0,
      rating: 0,
      ratingsCount: 0,
      isTemplate: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const response = await api.post<SavedWorkflow>('/workflows', this.applyIotPolicy(workflow));
    if (response.status === 'success' && response.result) {
      const sanitizedWorkflow = this.applyIotPolicy(response.result) as SavedWorkflow;
      this.localWorkflows.set(sanitizedWorkflow.id, sanitizedWorkflow);
      return {
        status: 'success',
        result: sanitizedWorkflow
      };
    }
    return response;
  }

  async updateWorkflow(workflowId: string, updates: Partial<SavedWorkflow>): Promise<ApiResponse<SavedWorkflow>> {
    const response = await api.put<SavedWorkflow>(`/workflows/${workflowId}`, this.applyIotPolicy({
      ...updates,
      updatedAt: new Date()
    }));

    if (response.status === 'success' && response.result) {
      const sanitized = this.applyIotPolicy(response.result) as SavedWorkflow;
      this.localWorkflows.set(workflowId, sanitized);
      return {
        status: 'success',
        result: sanitized
      };
    }
    return response;
  }

  async getWorkflow(workflowId: string): Promise<ApiResponse<SavedWorkflow>> {
    // Check local cache first
    const cached = this.localWorkflows.get(workflowId);
    if (cached) {
      return { status: 'success', result: cached };
    }

    const response = await api.get<SavedWorkflow>(`/workflows/${workflowId}`);
    if (response.status === 'success' && response.result) {
      const sanitizedWorkflow = this.applyIotPolicy(response.result) as SavedWorkflow;
      this.localWorkflows.set(sanitizedWorkflow.id, sanitizedWorkflow);
      return {
        status: 'success',
        result: sanitizedWorkflow
      };
    }
    return response;
  }

  async getUserWorkflows(folderId?: string): Promise<ApiResponse<SavedWorkflow[]>> {
    const params = folderId ? `?folder=${folderId}` : '';
    const response = await api.get<SavedWorkflow[]>(`/workflows/user${params}`);

    if (response.status === 'success' && response.result) {
      // Update local cache
      const sanitizedWorkflows = response.result.map(workflow => this.applyIotPolicy(workflow) as SavedWorkflow);
      sanitizedWorkflows.forEach(workflow => {
        this.localWorkflows.set(workflow.id, workflow);
      });
      return {
        status: 'success',
        result: sanitizedWorkflows
      };
    }
    return response;
  }

  async deleteWorkflow(workflowId: string): Promise<ApiResponse<void>> {
    const response = await api.delete<void>(`/workflows/${workflowId}`);
    if (response.status === 'success') {
      this.localWorkflows.delete(workflowId);
    }
    return response;
  }

  async duplicateWorkflow(workflowId: string, newName?: string): Promise<ApiResponse<SavedWorkflow>> {
    const original = await this.getWorkflow(workflowId);
    if (original.status !== 'success' || !original.result) {
      throw new Error('Workflow not found');
    }

    const duplicate = {
      ...original.result,
      name: newName || `${original.result.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      executionCount: 0
    };
    delete (duplicate as any).id;

    return this.saveWorkflow(duplicate);
  }

  // Workflow Templates
  async getTemplates(category?: string): Promise<ApiResponse<WorkflowTemplate[]>> {
    try {
      const params = category ? `?category=${category}` : '';
      const response = await api.get<WorkflowTemplate[]>(`/workflows/templates${params}`);

      // If API call succeeds, return the result
      if (response.status === 'success') {
        return response;
      }

      // Fallback to mock templates for demo mode
      console.log('API not available, using mock templates');
      return {
        status: 'success',
        result: this.getMockTemplates(category)
      };
    } catch (error) {
      console.log('API error, using mock templates:', error);
      return {
        status: 'success',
        result: this.getMockTemplates(category)
      };
    }
  }

  private getMockTemplates(category?: string): WorkflowTemplate[] {
    const allTemplates: WorkflowTemplate[] = [
      {
        id: 'quantum-teleportation',
        name: 'Quantum Teleportation',
        description: 'Transfer quantum information between qubits using entanglement',
        category: 'quantum',
        tags: ['quantum', 'teleportation', 'entanglement'],
        difficulty: 'advanced',
        estimatedTime: 30,
        useCases: ['Quantum communication', 'Secure data transfer'],
        nodes: [
          { id: 'input-1', type: 'input', x: 100, y: 100, label: 'Input Qubit' },
          { id: 'entangle-1', type: 'quantum', x: 300, y: 100, label: 'Create Entanglement' },
          { id: 'measure-1', type: 'quantum', x: 500, y: 100, label: 'Bell Measurement' },
          { id: 'apply-1', type: 'quantum', x: 700, y: 100, label: 'Apply Gates' }
        ],
        connections: [
          { from: 'input-1', to: 'entangle-1', fromPort: 0, toPort: 0 },
          { from: 'entangle-1', to: 'measure-1', fromPort: 0, toPort: 0 },
          { from: 'measure-1', to: 'apply-1', fromPort: 0, toPort: 0 }
        ],
        config: { qubits: 3, shots: 1024 },
        createdBy: 'QuantumForge',
        downloads: 1250,
        rating: 4.8,
        thumbnail: '🌀'
      },
      {
        id: 'ai-sentiment-analysis',
        name: 'AI Sentiment Analysis',
        description: 'Analyze text sentiment using machine learning models',
        category: 'ai',
        tags: ['ai', 'nlp', 'sentiment', 'analysis'],
        difficulty: 'intermediate',
        estimatedTime: 15,
        useCases: ['Social media monitoring', 'Customer feedback analysis'],
        nodes: [
          { id: 'input-1', type: 'input', x: 100, y: 100, label: 'Text Input' },
          { id: 'preprocess-1', type: 'process', x: 300, y: 100, label: 'Preprocess Text' },
          { id: 'ai-model-1', type: 'ai', x: 500, y: 100, label: 'Sentiment Model' },
          { id: 'output-1', type: 'output', x: 700, y: 100, label: 'Results' }
        ],
        connections: [
          { from: 'input-1', to: 'preprocess-1', fromPort: 0, toPort: 0 },
          { from: 'preprocess-1', to: 'ai-model-1', fromPort: 0, toPort: 0 },
          { from: 'ai-model-1', to: 'output-1', fromPort: 0, toPort: 0 }
        ],
        config: { model: 'bert-sentiment', threshold: 0.5 },
        createdBy: 'QuantumForge',
        downloads: 890,
        rating: 4.6,
        thumbnail: '🧠'
      },
      {
        id: 'automation-email-workflow',
        name: 'Email Automation',
        description: 'Automatically process and respond to emails',
        category: 'automation',
        tags: ['automation', 'email', 'productivity'],
        difficulty: 'beginner',
        estimatedTime: 10,
        useCases: ['Email management', 'Automated responses'],
        nodes: [
          { id: 'email-input', type: 'input', x: 100, y: 100, label: 'Email Input' },
          { id: 'classify-1', type: 'ai', x: 300, y: 100, label: 'Classify Email' },
          { id: 'response-1', type: 'process', x: 500, y: 100, label: 'Generate Response' },
          { id: 'send-email', type: 'output', x: 700, y: 100, label: 'Send Email' }
        ],
        connections: [
          { from: 'email-input', to: 'classify-1', fromPort: 0, toPort: 0 },
          { from: 'classify-1', to: 'response-1', fromPort: 0, toPort: 0 },
          { from: 'response-1', to: 'send-email', fromPort: 0, toPort: 0 }
        ],
        config: { autoRespond: true, priorityThreshold: 'high' },
        createdBy: 'QuantumForge',
        downloads: 654,
        rating: 4.4,
        thumbnail: '📧'
      },
      {
        id: 'quantum-key-distribution',
        name: 'BB84 Key Distribution',
        description: 'Implement quantum key distribution protocol',
        category: 'security',
        tags: ['quantum', 'security', 'cryptography', 'bb84'],
        difficulty: 'advanced',
        estimatedTime: 45,
        useCases: ['Secure communication', 'Quantum cryptography'],
        nodes: [
          { id: 'key-gen', type: 'quantum', x: 100, y: 100, label: 'Generate Raw Key' },
          { id: 'basis-choice', type: 'quantum', x: 300, y: 100, label: 'Choose Bases' },
          { id: 'measure-1', type: 'quantum', x: 500, y: 100, label: 'Measure Qubits' },
          { id: 'error-check', type: 'process', x: 700, y: 100, label: 'Error Correction' },
          { id: 'amplify-1', type: 'process', x: 900, y: 100, label: 'Privacy Amplification' }
        ],
        connections: [
          { from: 'key-gen', to: 'basis-choice', fromPort: 0, toPort: 0 },
          { from: 'basis-choice', to: 'measure-1', fromPort: 0, toPort: 0 },
          { from: 'measure-1', to: 'error-check', fromPort: 0, toPort: 0 },
          { from: 'error-check', to: 'amplify-1', fromPort: 0, toPort: 0 }
        ],
        config: { keyLength: 256, errorThreshold: 0.11 },
        createdBy: 'QuantumForge',
        downloads: 432,
        rating: 4.9,
        thumbnail: '🔐'
      },
      {
        id: 'data-processing-pipeline',
        name: 'Data Processing Pipeline',
        description: 'ETL pipeline for data processing and analysis',
        category: 'data',
        tags: ['data', 'etl', 'processing', 'analytics'],
        difficulty: 'intermediate',
        estimatedTime: 25,
        useCases: ['Data analysis', 'ETL processes'],
        nodes: [
          { id: 'data-source', type: 'input', x: 100, y: 100, label: 'Data Source' },
          { id: 'extract-1', type: 'process', x: 300, y: 100, label: 'Extract' },
          { id: 'transform-1', type: 'process', x: 500, y: 100, label: 'Transform' },
          { id: 'load-1', type: 'output', x: 700, y: 100, label: 'Load' }
        ],
        connections: [
          { from: 'data-source', to: 'extract-1', fromPort: 0, toPort: 0 },
          { from: 'extract-1', to: 'transform-1', fromPort: 0, toPort: 0 },
          { from: 'transform-1', to: 'load-1', fromPort: 0, toPort: 0 }
        ],
        config: { batchSize: 1000, retryCount: 3 },
        createdBy: 'QuantumForge',
        downloads: 567,
        rating: 4.3,
        thumbnail: '📊'
      }
    ];

    if (category && category !== 'all') {
      return allTemplates.filter(template => template.category === category);
    }

    return allTemplates;
  }

  async createFromTemplate(templateId: string, customizations?: any): Promise<ApiResponse<SavedWorkflow>> {
    try {
      const response = await api.post<SavedWorkflow>(`/workflows/from-template/${templateId}`, {
        customizations: customizations || {}
      });

      if (response.status === 'success' && response.result) {
        const sanitized = this.applyIotPolicy(response.result) as SavedWorkflow;
        this.localWorkflows.set(sanitized.id, sanitized);
        return {
          status: 'success',
          result: sanitized
        };
      }

      // Fallback to mock template creation
      console.log('API not available, creating mock workflow from template');
      const mockWorkflow = this.createMockWorkflowFromTemplate(templateId, customizations);
      if (mockWorkflow) {
        this.localWorkflows.set(mockWorkflow.id, mockWorkflow);
        return {
          status: 'success',
          result: mockWorkflow
        };
      }

      return {
        status: 'error',
        message: 'Template not found'
      };
    } catch (error) {
      console.log('API error, creating mock workflow from template:', error);
      const mockWorkflow = this.createMockWorkflowFromTemplate(templateId, customizations);
      if (mockWorkflow) {
        this.localWorkflows.set(mockWorkflow.id, mockWorkflow);
        return {
          status: 'success',
          result: mockWorkflow
        };
      }

      return {
        status: 'error',
        message: 'Failed to create workflow from template'
      };
    }
  }

  private createMockWorkflowFromTemplate(templateId: string, customizations?: any): SavedWorkflow | null {
    const templates = this.getMockTemplates();
    const template = templates.find(t => t.id === templateId);

    if (!template) return null;

    const workflowId = `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const workflow = {
      id: workflowId,
      name: `${template.name} (Copy)`,
      description: template.description,
      category: template.category,
      tags: [...template.tags],
      nodes: template.nodes.map(node => {
        // Add inputs and outputs properties expected by WorkflowEditor
        let inputs = 1;
        let outputs = 1;

        switch (node.type) {
          case 'input':
            inputs = 0;
            outputs = 1;
            break;
          case 'output':
            inputs = 1;
            outputs = 0;
            break;
          case 'api':
          case 'social':
            inputs = 1;
            outputs = 0; // Terminal nodes
            break;
          default:
            inputs = 1;
            outputs = 1;
        }

        return {
          ...node,
          id: `${node.id}-${workflowId}`,
          inputs,
          outputs,
          config: this.createDefaultConfig(node.type)
        };
      }),
      connections: template.connections.map(conn => ({
        ...conn,
        from: `${conn.from}-${workflowId}`,
        to: `${conn.to}-${workflowId}`
      })),
      config: { ...template.config, ...customizations },
      isPublic: false,
      isTemplate: false,
      createdBy: 'demo-user',
      createdAt: new Date(),
      updatedAt: new Date(),
      executionCount: 0,
      rating: 0,
      ratingsCount: 0,
      version: '1.0.0'
    };

    return this.applyIotPolicy(workflow) as SavedWorkflow;
  }

  async rateWorkflow(workflowId: string, rating: number): Promise<ApiResponse<void>> {
    return api.post<void>(`/workflows/${workflowId}/rate`, { rating });
  }

  // Public Workflows
  async getPublicWorkflows(search?: string, category?: string): Promise<ApiResponse<SavedWorkflow[]>> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);

    return api.get<SavedWorkflow[]>(`/workflows/public?${params.toString()}`);
  }

  async publishWorkflow(workflowId: string): Promise<ApiResponse<SavedWorkflow>> {
    return this.updateWorkflow(workflowId, { isPublic: true });
  }

  async unpublishWorkflow(workflowId: string): Promise<ApiResponse<SavedWorkflow>> {
    return this.updateWorkflow(workflowId, { isPublic: false });
  }

  // Workflow Folders
  async createFolder(folderData: {
    name: string;
    description?: string;
    parentId?: string;
    color?: string;
  }): Promise<ApiResponse<WorkflowFolder>> {
    const folder = {
      ...folderData,
      id: Date.now().toString(),
      createdAt: new Date(),
      workflowIds: []
    };

    const response = await api.post<WorkflowFolder>('/workflows/folders', folder);
    if (response.status === 'success' && response.result) {
      this.folders.set(response.result.id, response.result);
    }
    return response;
  }

  async getFolders(): Promise<ApiResponse<WorkflowFolder[]>> {
    const response = await api.get<WorkflowFolder[]>('/workflows/folders');
    if (response.status === 'success' && response.result) {
      response.result.forEach((folder: WorkflowFolder) => {
        this.folders.set(folder.id, folder);
      });
    }
    return response;
  }

  async updateFolder(folderId: string, updates: Partial<WorkflowFolder>): Promise<ApiResponse<WorkflowFolder>> {
    const response = await api.put<WorkflowFolder>(`/workflows/folders/${folderId}`, updates);
    if (response.status === 'success' && response.result) {
      this.folders.set(folderId, response.result);
    }
    return response;
  }

  async deleteFolder(folderId: string): Promise<ApiResponse<void>> {
    const response = await api.delete<void>(`/workflows/folders/${folderId}`);
    if (response.status === 'success') {
      this.folders.delete(folderId);
    }
    return response;
  }

  async moveWorkflowToFolder(workflowId: string, folderId: string): Promise<ApiResponse<void>> {
    return api.post<void>(`/workflows/${workflowId}/move`, { folderId });
  }

  // Workflow Execution with Persistence
  async executeWorkflow(workflowId: string, inputs?: any): Promise<ApiResponse<any>> {
    // Update execution count
    const workflow = this.localWorkflows.get(workflowId);
    if (workflow) {
      workflow.executionCount++;
      workflow.lastExecutedAt = new Date();
    }

    const response = await api.post<any>(`/workflows/${workflowId}/execute`, {
      inputs: inputs || {}
    });

    // Update local cache if execution was successful
    if (response.status === 'success' && workflow) {
      this.localWorkflows.set(workflowId, workflow);
    }

    return response;
  }

  // Search and Filter
  async searchWorkflows(query: {
    search?: string;
    category?: string;
    tags?: string[];
    isPublic?: boolean;
    createdBy?: string;
    sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'rating' | 'executionCount';
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<SavedWorkflow[]>> {
    const params = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    return api.get<SavedWorkflow[]>(`/workflows/search?${params.toString()}`);
  }

  // Import/Export
  async exportWorkflow(workflowId: string): Promise<ApiResponse<string>> {
    return api.get<string>(`/workflows/${workflowId}/export`);
  }

  async importWorkflow(workflowData: string): Promise<ApiResponse<SavedWorkflow>> {
    const response = await api.post<SavedWorkflow>('/workflows/import', {
      workflowData: JSON.parse(workflowData)
    });

    if (response.status === 'success' && response.result) {
      const sanitizedWorkflow = this.applyIotPolicy(response.result) as SavedWorkflow;
      this.localWorkflows.set(sanitizedWorkflow.id, sanitizedWorkflow);
      return {
        status: 'success',
        result: sanitizedWorkflow
      };
    }
    return response;
  }

  private applyIotPolicy<T extends { nodes?: any[] }>(workflow: T): T {
    if (!workflow || !Array.isArray(workflow.nodes) || iotPolicyService.isMicroAiEnabled()) {
      return workflow;
    }

    const sanitizedNodes = workflow.nodes.map(node => {
      if (!node || typeof node !== 'object') {
        return node;
      }

      const config = (node as any).config;
      if (config && Array.isArray(config.microAgents) && (config.microAgents.length > 0 || config.microAiBlueprint)) {
        return {
          ...node,
          config: {
            ...config,
            microAgents: [],
            microAiBlueprint: undefined
          }
        };
      }

      return node;
    });

    return {
      ...workflow,
      nodes: sanitizedNodes
    };
  }

  // Analytics
  async getWorkflowAnalytics(workflowId: string): Promise<ApiResponse<{
    executionHistory: any[];
    performanceMetrics: any;
    errorRates: any;
    usageStats: any;
  }>> {
    return api.get<any>(`/workflows/${workflowId}/analytics`);
  }

  // Collaboration (Future feature)
  async shareWorkflow(workflowId: string, userIds: string[], permissions: string[]): Promise<ApiResponse<void>> {
    return api.post<void>(`/workflows/${workflowId}/share`, {
      userIds,
      permissions
    });
  }

  // Utility methods
  getLocalWorkflow(workflowId: string): SavedWorkflow | undefined {
    return this.localWorkflows.get(workflowId);
  }

  getAllLocalWorkflows(): SavedWorkflow[] {
    return Array.from(this.localWorkflows.values());
  }

  clearCache(): void {
    this.localWorkflows.clear();
    this.folders.clear();
  }
}

const persistentWorkflowService = new PersistentWorkflowService();
export default persistentWorkflowService;