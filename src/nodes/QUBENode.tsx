import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BaseNodeComponent } from './BaseNode';
import { NodeProps } from './types';

export function QUBENode(props: NodeProps) {
  const { node, onUpdate } = props;

  const algorithms = ['QAOA', 'VQE', 'QPE', 'Grover'];
  const selectedAlgorithm = node.config.algorithm || 'QAOA';

  return (
    <BaseNodeComponent
      {...props}
      title="QUBE"
      color="#45b7d1"
      icon="shield-checkmark"
    >
      <View style={styles.content}>
        <Text style={styles.label}>Algorithm:</Text>
        <View style={styles.algorithmButtons}>
          {algorithms.map((algorithm) => (
            <TouchableOpacity
              key={algorithm}
              style={[
                styles.algorithmButton,
                selectedAlgorithm === algorithm && styles.selectedAlgorithm
              ]}
              onPress={() => onUpdate({
                config: { ...node.config, algorithm }
              })}
            >
              <Text style={[
                styles.algorithmText,
                selectedAlgorithm === algorithm && styles.selectedAlgorithmText
              ]}>
                {algorithm}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Qubits:</Text>
        <View style={styles.qubitSelector}>
          {[4, 8, 16, 32].map((qubits) => (
            <TouchableOpacity
              key={qubits}
              style={[
                styles.qubitButton,
                node.config.qubits === qubits && styles.selectedQubit
              ]}
              onPress={() => onUpdate({
                config: { ...node.config, qubits }
              })}
            >
              <Text style={[
                styles.qubitText,
                node.config.qubits === qubits && styles.selectedQubitText
              ]}>
                {qubits}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.encryptionStatus}>
          Status: {node.config.isEncrypted ? 'Encrypted' : 'Ready to Encrypt'}
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
    color: '#45b7d1',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  algorithmButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  algorithmButton: {
    backgroundColor: '#0f1419',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 4,
    padding: 4,
    margin: 2,
  },
  selectedAlgorithm: {
    backgroundColor: '#45b7d1',
    borderColor: '#45b7d1',
  },
  algorithmText: {
    color: '#45b7d1',
    fontSize: 8,
  },
  selectedAlgorithmText: {
    color: '#0f1419',
    fontWeight: 'bold',
  },
  qubitSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  qubitButton: {
    backgroundColor: '#0f1419',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 4,
    padding: 4,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  selectedQubit: {
    backgroundColor: '#45b7d1',
    borderColor: '#45b7d1',
  },
  qubitText: {
    color: '#45b7d1',
    fontSize: 10,
  },
  selectedQubitText: {
    color: '#0f1419',
    fontWeight: 'bold',
  },
  encryptionStatus: {
    color: '#45b7d1',
    fontSize: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});