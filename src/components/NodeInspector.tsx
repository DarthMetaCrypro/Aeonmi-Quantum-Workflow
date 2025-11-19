/**
 * Æ Q.U.B.E. Node Inspector
 *
 * ◎ Right inspector for quantum node configuration
 * ⟲ Dynamic configuration panels for each node type
 * ⊗ Real-time node property editing and validation
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NodeData, NodeType } from '../nodes/types';

interface NodeInspectorProps {
  selectedNode: NodeData | null;
  onUpdateNode: (nodeId: string, updates: Partial<NodeData>) => void;
}

export function NodeInspector({ selectedNode, onUpdateNode }: NodeInspectorProps) {
  if (!selectedNode) {
    return (
      <View style={styles.container}>
        <Text style={styles.placeholder}>◎ Select a quantum node to configure</Text>
      </View>
    );
  }

  const renderConfigSection = () => {
    switch (selectedNode.type) {
      case 'webhook':
        return (
          <View style={styles.configSection}>
            <Text style={styles.sectionTitle}>⊗ Webhook Configuration</Text>
            <Text style={styles.configItem}>
              URL: {selectedNode.config.url || 'Not set'}
            </Text>
            <Text style={styles.configItem}>
              Method: {selectedNode.config.method || 'GET'}
            </Text>
            <Text style={styles.configItem}>
              Headers: {JSON.stringify(selectedNode.config.headers || {}, null, 2)}
            </Text>
          </View>
        );

      case 'loop':
        return (
          <View style={styles.configSection}>
            <Text style={styles.sectionTitle}>⟲ Loop Configuration</Text>
            <Text style={styles.configItem}>
              Iterations: {selectedNode.config.iterations || 1}
            </Text>
            <Text style={styles.configItem}>
              Delay: {selectedNode.config.delay || 0}ms
            </Text>
            <Text style={styles.configItem}>
              Condition: {selectedNode.config.condition || 'true'}
            </Text>
          </View>
        );

      case 'titan':
        return (
          <View style={styles.configSection}>
            <Text style={styles.sectionTitle}>◎ Titan A/B Evolution</Text>
            <Text style={styles.configItem}>
              Variant A: {selectedNode.config.variantA || 'Not set'}
            </Text>
            <Text style={styles.configItem}>
              Variant B: {selectedNode.config.variantB || 'Not set'}
            </Text>
            <Text style={styles.configItem}>
              Winner: {selectedNode.config.winner || 'Pending'}
            </Text>
          </View>
        );

      case 'qube':
        return (
          <View style={styles.configSection}>
            <Text style={styles.sectionTitle}>|ψ⟩ QUBE Quantum Encryption</Text>
            <Text style={styles.configItem}>
              Algorithm: {selectedNode.config.algorithm || 'QAOA'}
            </Text>
            <Text style={styles.configItem}>
              Qubits: {selectedNode.config.qubits || 4}
            </Text>
            <Text style={styles.configItem}>
              Status: {selectedNode.config.isEncrypted ? 'Encrypted' : 'Ready'}
            </Text>
          </View>
        );

      case 'entropy-wallet':
        return (
          <View style={styles.configSection}>
            <Text style={styles.sectionTitle}>|0⟩⊕|1⟩ Entropy Wallet</Text>
            <Text style={styles.configItem}>
              Source: {selectedNode.config.entropySource || 'Quantum RNG'}
            </Text>
            <Text style={styles.configItem}>
              Balance: {selectedNode.config.balance || '0.00'} ETH
            </Text>
            <Text style={styles.configItem}>
              Generated: {selectedNode.config.generatedEntropy ? 'Yes' : 'No'}
            </Text>
          </View>
        );

      case 'voice-to-glyph':
        return (
          <View style={styles.configSection}>
            <Text style={styles.sectionTitle}>λ≔ Voice-to-Glyph</Text>
            <Text style={styles.configItem}>
              Language: {selectedNode.config.language || 'EN'}
            </Text>
            <Text style={styles.configItem}>
              Transcription: {selectedNode.config.transcription || 'None'}
            </Text>
            <Text style={styles.configItem}>
              Glyphs: {selectedNode.config.glyphs ? selectedNode.config.glyphs.substring(0, 50) + '...' : 'None'}
            </Text>
          </View>
        );

      case 'emotional-balancer':
        return (
          <View style={styles.configSection}>
            <Text style={styles.sectionTitle}>⊕ Emotional Balancer</Text>
            <Text style={styles.configItem}>
              Current: {selectedNode.config.currentEmotion || 'Neutral'}
            </Text>
            <Text style={styles.configItem}>
              Balanced: {selectedNode.config.balancedEmotion || 'Not balanced'}
            </Text>
            <Text style={styles.configItem}>
              Confidence: {selectedNode.config.confidence || '0'}%
            </Text>
          </View>
        );

      default:
        return (
          <View style={styles.configSection}>
            <Text style={styles.sectionTitle}>◎ Configuration</Text>
            <Text style={styles.configItem}>
              {JSON.stringify(selectedNode.config, null, 2)}
            </Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.nodeTitle}>{selectedNode.title}</Text>
        <Text style={styles.nodeType}>⊗ {selectedNode.type}</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {renderConfigSection()}

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>◎ Node Info</Text>
          <Text style={styles.infoItem}>ID: {selectedNode.id}</Text>
          <Text style={styles.infoItem}>
            Position: ({selectedNode.position.x.toFixed(1)}, {selectedNode.position.y.toFixed(1)})
          </Text>
          <Text style={styles.infoItem}>
            Created: {new Date(selectedNode.createdAt).toLocaleString()}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1419',
    borderLeftWidth: 1,
    borderLeftColor: '#333',
  },
  placeholder: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 50,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  nodeTitle: {
    color: '#45b7d1',
    fontSize: 18,
    fontWeight: 'bold',
  },
  nodeType: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  scrollContainer: {
    flex: 1,
  },
  configSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sectionTitle: {
    color: '#45b7d1',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  configItem: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  infoSection: {
    padding: 16,
  },
  infoItem: {
    color: '#ccc',
    fontSize: 11,
    marginBottom: 6,
  },
});