export interface NodeData {
  id: string;
  type: NodeType;
  title: string;
  position: { x: number; y: number };
  connections: string[];
  config: NodeConfig;
  microAI: MicroAIState;
  createdAt: number;
}

export type NodeType =
  | 'webhook'
  | 'loop'
  | 'titan'
  | 'qube'
  | 'entropy-wallet'
  | 'voice-to-glyph'
  | 'emotional-balancer';

export interface NodeConfig {
  [key: string]: any;
}

export interface MicroAIState {
  isActive: boolean;
  prompt: string;
  response: string;
  isProcessing: boolean;
  lastUpdated: number;
}

export interface NodeProps {
  node: NodeData;
  onUpdate: (updates: Partial<NodeData>) => void;
  onDelete: () => void;
  isSelected: boolean;
  onSelect: () => void;
}