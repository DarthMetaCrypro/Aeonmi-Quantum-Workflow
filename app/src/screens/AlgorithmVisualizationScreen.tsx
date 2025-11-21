import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { palette } from '../theme/colors';
import Card from '../components/Card';
import QuantumCircuitVisualizer from '../components/QuantumCircuitVisualizer';

type AlgorithmType = 'grover' | 'shor' | 'vqe';

const AlgorithmVisualizationScreen: React.FC = () => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>('grover');

  const algorithms = [
    {
      id: 'grover' as AlgorithmType,
      name: "Grover's Search",
      description: 'Quantum search algorithm for unstructured databases',
      icon: '🔍',
      useCase: 'Database search, optimization problems',
    },
    {
      id: 'shor' as AlgorithmType,
      name: "Shor's Algorithm",
      description: 'Integer factorization for cryptography',
      icon: '🔐',
      useCase: 'Breaking RSA encryption, number theory',
    },
    {
      id: 'vqe' as AlgorithmType,
      name: 'VQE',
      description: 'Variational Quantum Eigensolver for chemistry',
      icon: '⚗️',
      useCase: 'Molecular simulation, material science',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Quantum Algorithm Visualization</Text>
        <Text style={styles.subtitle}>
          Explore quantum circuits and their gate operations
        </Text>
      </View>

      <View style={styles.algorithmSelector}>
        {algorithms.map((algo) => (
          <TouchableOpacity
            key={algo.id}
            style={[
              styles.algorithmCard,
              selectedAlgorithm === algo.id && styles.algorithmCardSelected,
            ]}
            onPress={() => setSelectedAlgorithm(algo.id)}
          >
            <Text style={styles.algorithmIcon}>{algo.icon}</Text>
            <Text style={styles.algorithmName}>{algo.name}</Text>
            <Text style={styles.algorithmDescription}>{algo.description}</Text>
            <Text style={styles.algorithmUseCase}>Use: {algo.useCase}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Card style={styles.visualizerCard}>
        <QuantumCircuitVisualizer algorithm={selectedAlgorithm} />
      </Card>

      <Card style={styles.infoCard}>
        <Text style={styles.infoTitle}>Understanding Quantum Circuits</Text>
        <Text style={styles.infoText}>
          Quantum circuits represent quantum algorithms as sequences of quantum gates
          applied to qubits. Each gate transforms the quantum state, and the final
          measurement collapses the superposition to classical bits.
        </Text>
        <View style={styles.infoSection}>
          <Text style={styles.infoSectionTitle}>Key Concepts:</Text>
          <Text style={styles.infoPoint}>• Qubits: Quantum bits in superposition</Text>
          <Text style={styles.infoPoint}>• Gates: Unitary operations on qubits</Text>
          <Text style={styles.infoPoint}>
            • Entanglement: Correlations between qubits
          </Text>
          <Text style={styles.infoPoint}>
            • Measurement: Collapse to classical output
          </Text>
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: palette.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: palette.textSecondary,
  },
  algorithmSelector: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  algorithmCard: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1F2A37',
  },
  algorithmCardSelected: {
    borderColor: palette.accentPrimary,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
  },
  algorithmIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  algorithmName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: palette.textPrimary,
    marginBottom: 6,
  },
  algorithmDescription: {
    fontSize: 12,
    color: palette.textSecondary,
    marginBottom: 8,
  },
  algorithmUseCase: {
    fontSize: 11,
    color: palette.accentPrimary,
    fontStyle: 'italic',
  },
  visualizerCard: {
    margin: 20,
    marginTop: 0,
    padding: 0,
    overflow: 'hidden',
  },
  infoCard: {
    margin: 20,
    marginTop: 0,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: palette.textPrimary,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: palette.textSecondary,
    lineHeight: 20,
    marginBottom: 15,
  },
  infoSection: {
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#1F2A37',
  },
  infoSectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: palette.textPrimary,
    marginBottom: 10,
  },
  infoPoint: {
    fontSize: 13,
    color: palette.textSecondary,
    marginBottom: 6,
    paddingLeft: 10,
  },
});

export default AlgorithmVisualizationScreen;
