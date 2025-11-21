// src/screens/WorkflowCanvasScreen.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import Svg from 'react-native-svg';
import { Node, Edge, NodeType } from '../types';
import { QuantumNode } from '../components/QuantumNode';
import { QuantumEdge } from '../components/QuantumEdge';

type WorkflowCanvasRouteProp = RouteProp<{ WorkflowCanvas: { workflowId: string } }, 'WorkflowCanvas'>;

export const WorkflowCanvasScreen: React.FC<{ route: WorkflowCanvasRouteProp }> = ({ route }) => {
  const { workflowId } = route.params;
  const [nodes, setNodes] = useState<Node[]>([
    {
      id: 'trigger1',
      type: 'TRIGGER_HTTP',
      label: 'API Trigger',
      position: { x: 50, y: 50 },
    },
    {
      id: 'qube1',
      type: 'QUBE_KEY',
      label: 'BB84 Key Gen',
      position: { x: 200, y: 50 },
    },
    {
      id: 'ai1',
      type: 'AI_AGENT',
      label: 'Content AI',
      position: { x: 350, y: 50 },
    },
    {
      id: 'compute1',
      type: 'QUBE_COMPUTE',
      label: 'Quantum Encrypt',
      position: { x: 200, y: 200 },
    },
    {
      id: 'titan1',
      type: 'TITAN_OPTIMIZER',
      label: 'Performance Opt',
      position: { x: 350, y: 200 },
    },
  ]);

  const [edges] = useState<Edge[]>([
    { id: 'e1', source: 'trigger1', target: 'qube1' },
    { id: 'e2', source: 'qube1', target: 'ai1' },
    { id: 'e3', source: 'ai1', target: 'compute1' },
    { id: 'e4', source: 'compute1', target: 'titan1' },
  ]);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const handleNodePress = (nodeId: string) => {
    setSelectedNodeId(selectedNodeId === nodeId ? null : nodeId);
  };

  const addNode = (type: NodeType) => {
    const newNode: Node = {
      id: `node_${Date.now()}`,
      type,
      label: type.replace('_', ' '),
      position: { x: Math.random() * 300 + 50, y: Math.random() * 300 + 50 },
    };
    setNodes([...nodes, newNode]);
  };

  const getNodeById = (id: string) => nodes.find(n => n.id === id);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quantum Workflow Canvas: {workflowId}</Text>

      {/* Node Palette */}
      <ScrollView horizontal style={styles.palette} showsHorizontalScrollIndicator={false}>
        {(['TRIGGER_HTTP', 'QUBE_KEY', 'AI_AGENT', 'QUBE_COMPUTE', 'TITAN_OPTIMIZER', 'META_EVOLVER'] as NodeType[]).map((type) => (
          <TouchableOpacity
            key={type}
            style={styles.paletteButton}
            onPress={() => addNode(type)}
          >
            <Text style={styles.paletteText}>{type.replace('_', ' ')}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Canvas */}
      <View style={styles.canvas}>
        <Svg style={StyleSheet.absoluteFill}>
          {edges.map((edge) => {
            const sourceNode = getNodeById(edge.source);
            const targetNode = getNodeById(edge.target);
            if (!sourceNode || !targetNode) return null;

            return (
              <QuantumEdge
                key={edge.id}
                edge={edge}
                sourceNode={sourceNode}
                targetNode={targetNode}
                isSelected={false}
              />
            );
          })}
        </Svg>

        {nodes.map((node) => (
          <QuantumNode
            key={node.id}
            node={node}
            isSelected={selectedNodeId === node.id}
            onPress={() => handleNodePress(node.id)}
          />
        ))}
      </View>

      {selectedNodeId && (
        <View style={styles.nodeInfo}>
          <Text style={styles.nodeInfoText}>
            Selected: {getNodeById(selectedNodeId)?.label}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  title: {
    fontSize: 18,
    color: '#00d4ff',
    marginBottom: 10,
  },
  palette: {
    maxHeight: 50,
    marginBottom: 10,
  },
  paletteButton: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#00d4ff',
  },
  paletteText: {
    color: '#00d4ff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  canvas: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00d4ff',
    position: 'relative',
  },
  nodeInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#2a2a2a',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#00d4ff',
  },
  nodeInfoText: {
    color: '#ffffff',
    fontSize: 14,
  },
});