import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BaseNodeComponent } from './BaseNode';
import { NodeProps } from './types';

export function EntropyWalletNode(props: NodeProps) {
  const { node, onUpdate } = props;

  const entropySources = ['Quantum RNG', 'Hardware RNG', 'Mixed'];
  const selectedSource = node.config.entropySource || 'Quantum RNG';

  const generateEntropy = () => {
    // Simulate entropy generation
    const entropy = Math.random().toString(36).substring(2, 15);
    onUpdate({
      config: {
        ...node.config,
        generatedEntropy: entropy,
        timestamp: new Date().toISOString()
      }
    });
  };

  return (
    <BaseNodeComponent
      {...props}
      title="Entropy Wallet"
      color="#ff6b6b"
      icon="wallet"
    >
      <View style={styles.content}>
        <Text style={styles.label}>Entropy Source:</Text>
        <View style={styles.sourceButtons}>
          {entropySources.map((source) => (
            <TouchableOpacity
              key={source}
              style={[
                styles.sourceButton,
                selectedSource === source && styles.selectedSource
              ]}
              onPress={() => onUpdate({
                config: { ...node.config, entropySource: source }
              })}
            >
              <Text style={[
                styles.sourceText,
                selectedSource === source && styles.selectedSourceText
              ]}>
                {source}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.generateButton}
          onPress={generateEntropy}
        >
          <Text style={styles.generateText}>Generate Entropy</Text>
        </TouchableOpacity>

        {node.config.generatedEntropy && (
          <View style={styles.entropyDisplay}>
            <Text style={styles.entropyLabel}>Generated:</Text>
            <Text style={styles.entropyValue} numberOfLines={2}>
              {node.config.generatedEntropy}
            </Text>
            <Text style={styles.timestamp}>
              {node.config.timestamp ? new Date(node.config.timestamp).toLocaleTimeString() : ''}
            </Text>
          </View>
        )}

        <Text style={styles.balance}>
          Balance: {node.config.balance || '0.00'} ETH
        </Text>
      </View>
    </BaseNodeComponent>
  );
}

const styles = StyleSheet.create({
  content: {
    marginTop: 8,
  },
  label: {
    color: '#ff6b6b',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sourceButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  sourceButton: {
    backgroundColor: '#0f1419',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 4,
    padding: 4,
    margin: 2,
  },
  selectedSource: {
    backgroundColor: '#ff6b6b',
    borderColor: '#ff6b6b',
  },
  sourceText: {
    color: '#ff6b6b',
    fontSize: 8,
  },
  selectedSourceText: {
    color: '#0f1419',
    fontWeight: 'bold',
  },
  generateButton: {
    backgroundColor: '#ff6b6b',
    borderRadius: 6,
    padding: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  generateText: {
    color: '#0f1419',
    fontSize: 10,
    fontWeight: 'bold',
  },
  entropyDisplay: {
    backgroundColor: '#0f1419',
    borderRadius: 4,
    padding: 6,
    marginBottom: 8,
  },
  entropyLabel: {
    color: '#ff6b6b',
    fontSize: 8,
    fontWeight: 'bold',
  },
  entropyValue: {
    color: '#45b7d1',
    fontSize: 8,
    fontFamily: 'monospace',
    marginVertical: 2,
  },
  timestamp: {
    color: '#666',
    fontSize: 6,
  },
  balance: {
    color: '#ff6b6b',
    fontSize: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});