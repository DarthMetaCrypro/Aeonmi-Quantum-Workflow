import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QuantumCanvas from '../components/QuantumCanvas';
import { AIWorkflowAssistant } from '../components/AIWorkflowAssistant';
import { NodeInspector } from '../components/NodeInspector';
import { TitanEvolutionPanel } from '../components/TitanEvolutionPanel';
import { NodeData, NodeType } from '../nodes/types';

export default function ConstructorScreen() {
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);

  const handleAddNode = (type: NodeType, position: { x: number; y: number }) => {
    const newNode: NodeData = {
      id: `node-${Date.now()}`,
      type,
      title: type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' '),
      position,
      connections: [],
      config: {},
      microAI: {
        isActive: false,
        prompt: '',
        response: '',
        isProcessing: false,
        lastUpdated: Date.now(),
      },
      createdAt: Date.now(),
    };
    setNodes(prev => [...prev, newNode]);
  };

  const handleUpdateNode = (nodeId: string, updates: Partial<NodeData>) => {
    setNodes(prev => prev.map(node =>
      node.id === nodeId ? { ...node, ...updates } : node
    ));
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  };

  const handleSuggestWorkflow = (description: string) => {
    Alert.alert('AI Suggestion', `Suggested workflow: ${description}`);
    // Here you would integrate with actual AI service
  };

  const handleCreateWorkflow = (workflowData: any) => {
    // ◎ Create and save quantum workflow
    console.log('Creating quantum workflow:', workflowData);
    // Here you would save the workflow to storage or send to backend
  };

  const handleValidateWorkflow = () => {
    const issues = [];
    if (nodes.length === 0) {
      issues.push('No nodes in workflow');
    }
    if (nodes.some(node => node.connections.length === 0 && node.type !== 'webhook')) {
      issues.push('Some nodes have no connections');
    }

    if (issues.length === 0) {
      Alert.alert('Validation', 'Workflow is valid! ✅');
    } else {
      Alert.alert('Validation Issues', issues.join('\n'));
    }
  };

  const handleOptimizeWorkflow = () => {
    Alert.alert('Optimization', 'Workflow optimized for performance! ⚡');
    // Here you would implement actual optimization logic
  };

  const handleNodeSelect = (node: NodeData) => {
    setSelectedNode(node);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Constructor</Text>
        <Text style={styles.subtitle}>Build Quantum Workflows</Text>
      </View>

      <View style={styles.mainContent}>
        <View style={styles.canvasContainer}>
          <QuantumCanvas
            nodes={nodes}
            onNodeSelect={handleNodeSelect}
            onNodeUpdate={handleUpdateNode}
            onNodeDelete={handleDeleteNode}
          />
        </View>

        {selectedNode && (
          <View style={styles.inspectorContainer}>
            <NodeInspector
              selectedNode={selectedNode}
              onUpdateNode={handleUpdateNode}
            />
          </View>
        )}
      </View>

      {selectedNode?.type === 'titan' && (
        <TitanEvolutionPanel
          titanNode={selectedNode}
          onUpdateNode={handleUpdateNode}
        />
      )}

      <AIWorkflowAssistant
        nodes={nodes}
        onAddNode={handleAddNode}
        onUpdateNode={handleUpdateNode}
        onDeleteNode={handleDeleteNode}
        onSuggestWorkflow={handleSuggestWorkflow}
        onValidateWorkflow={handleValidateWorkflow}
        onOptimizeWorkflow={handleOptimizeWorkflow}
        onCreateWorkflow={handleCreateWorkflow}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1419',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1d23',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#61dafb',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#cccccc',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  canvasContainer: {
    flex: 1,
  },
  inspectorContainer: {
    width: 300,
    backgroundColor: '#1a1f24',
    borderLeftWidth: 1,
    borderLeftColor: '#333',
  },
});