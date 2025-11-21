// src/components/QuantumNode.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Node, NodeType } from '../types';

interface QuantumNodeProps {
  node: Node;
  onPress?: () => void;
  onLongPress?: () => void;
  isSelected?: boolean;
}

export const QuantumNode: React.FC<QuantumNodeProps> = ({
  node,
  onPress,
  onLongPress,
  isSelected = false,
}) => {
  const getNodeColor = (type: NodeType): string => {
    switch (type) {
      case 'QUBE_KEY':
      case 'QUBE_COMPUTE':
        return '#00d4ff'; // Quantum blue
      case 'TITAN_OPTIMIZER':
      case 'META_EVOLVER':
        return '#ff6b00'; // Evolution orange
      case 'AI_AGENT':
        return '#00ff88'; // AI green
      default:
        return '#cccccc'; // Default gray
    }
  };

  const getNodeIcon = (type: NodeType): string => {
    switch (type) {
      case 'TRIGGER_HTTP':
        return '🌐';
      case 'TRIGGER_SCHEDULE':
        return '⏰';
      case 'ACTION_HTTP':
        return '📡';
      case 'ACTION_DB':
        return '🗄️';
      case 'ACTION_EMAIL':
        return '📧';
      case 'LOGIC_CONDITION':
        return '🔀';
      case 'LOGIC_SWITCH':
        return '⚡';
      case 'AI_AGENT':
        return '🤖';
      case 'QUBE_KEY':
        return '🔐';
      case 'QUBE_COMPUTE':
        return '⚛️';
      case 'TITAN_OPTIMIZER':
        return '🧬';
      case 'META_EVOLVER':
        return '🔄';
      case 'UTIL_TRANSFORM':
        return '🔧';
      default:
        return '📦';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          borderColor: getNodeColor(node.type),
          backgroundColor: isSelected ? `${getNodeColor(node.type)}20` : '#2a2a2a',
          left: node.position.x,
          top: node.position.y,
        },
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <Text style={styles.icon}>{getNodeIcon(node.type)}</Text>
      <Text style={styles.label} numberOfLines={2}>
        {node.label}
      </Text>
      <View style={[styles.typeIndicator, { backgroundColor: getNodeColor(node.type) }]} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 120,
    minHeight: 80,
    borderRadius: 8,
    borderWidth: 2,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  icon: {
    fontSize: 24,
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  typeIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});