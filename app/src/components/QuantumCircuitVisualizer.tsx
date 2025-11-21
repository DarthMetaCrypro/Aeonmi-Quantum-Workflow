import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { palette } from '../theme/colors';
import { api } from '../services/api';

interface Gate {
  type: string;
  qubit?: number;
  control?: number;
  target?: number;
}

interface AlgorithmInfo {
  name: string;
  qubits: number;
  gates: string[];
  complexity: string;
  quantum_advantage: string;
  circuit_depth: number;
}

interface Props {
  algorithm: 'grover' | 'shor' | 'vqe';
}

const QuantumCircuitVisualizer: React.FC<Props> = ({ algorithm }) => {
  const [info, setInfo] = useState<AlgorithmInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [animatedGate, setAnimatedGate] = useState<number>(-1);

  useEffect(() => {
    loadAlgorithm();
  }, [algorithm]);

  const loadAlgorithm = async () => {
    setLoading(true);
    try {
      const data = await api.visualizeAlgorithm(algorithm);
      setInfo(data);
      animateCircuit(data.gates.length);
    } catch (e) {
      // Failed to load algorithm - error handled in UI
    } finally {
      setLoading(false);
    }
  };

  const animateCircuit = (gateCount: number) => {
    let index = 0;
    const interval = setInterval(() => {
      setAnimatedGate(index);
      index++;
      if (index >= gateCount) {
        clearInterval(interval);
        setTimeout(() => setAnimatedGate(-1), 500);
      }
    }, 300);
  };

  const renderGate = (gate: string, index: number, qubitIndex: number) => {
    const isAnimated = animatedGate === index;

    const gateStyles = {
      H: { bg: '#4FC3F7', label: 'H' },
      X: { bg: '#F06292', label: 'X' },
      Y: { bg: '#BA68C8', label: 'Y' },
      Z: { bg: '#9575CD', label: 'Z' },
      CZ: { bg: '#FFB74D', label: 'CZ' },
      CNOT: { bg: '#FF8A65', label: '⊕' },
      QFT: { bg: '#4DB6AC', label: 'QFT' },
      IQFT: { bg: '#4DD0E1', label: 'QFT†' },
      CMOD: { bg: '#FFD54F', label: 'MOD' },
      RY: { bg: '#AED581', label: 'RY' },
      RZ: { bg: '#81C784', label: 'RZ' },
    };

    const style = gateStyles[gate as keyof typeof gateStyles] || {
      bg: '#78909C',
      label: gate,
    };

    return (
      <View
        key={`${gate}-${index}-${qubitIndex}`}
        style={[
          styles.gate,
          { backgroundColor: style.bg },
          isAnimated && styles.gateAnimated,
        ]}
      >
        <Text style={styles.gateLabel}>{style.label}</Text>
      </View>
    );
  };

  const renderQubitLine = (qubitIndex: number) => {
    if (!info) return null;

    return (
      <View key={qubitIndex} style={styles.qubitRow}>
        <Text style={styles.qubitLabel}>|q{qubitIndex}⟩</Text>
        <View style={styles.qubitLine}>
          {info.gates.map((gate, index) => renderGate(gate, index, qubitIndex))}
        </View>
        <View style={styles.measurement}>
          <Text style={styles.measurementIcon}>⟨M⟩</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading quantum circuit...</Text>
      </View>
    );
  }

  if (!info) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to load algorithm</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} horizontal>
      <View style={styles.circuit}>
        <View style={styles.header}>
          <Text style={styles.title}>{info.name}</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Qubits</Text>
              <Text style={styles.statValue}>{info.qubits}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Depth</Text>
              <Text style={styles.statValue}>{info.circuit_depth}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Complexity</Text>
              <Text style={styles.statValue}>{info.complexity}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Advantage</Text>
              <Text style={[styles.statValue, styles.advantage]}>
                {info.quantum_advantage}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.circuitDiagram}>
          {Array.from({ length: info.qubits }, (_, i) => renderQubitLine(i))}
        </View>

        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Gate Legend:</Text>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendGate, { backgroundColor: '#4FC3F7' }]} />
              <Text style={styles.legendText}>H = Hadamard</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendGate, { backgroundColor: '#F06292' }]} />
              <Text style={styles.legendText}>X = Pauli-X (NOT)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendGate, { backgroundColor: '#FF8A65' }]} />
              <Text style={styles.legendText}>⊕ = CNOT</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  circuit: {
    padding: 20,
    minWidth: 800,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: palette.accentPrimary,
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 15,
  },
  stat: {
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.accentPrimary,
    minWidth: 100,
  },
  statLabel: {
    fontSize: 11,
    color: palette.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: palette.textPrimary,
  },
  advantage: {
    color: palette.success,
  },
  circuitDiagram: {
    marginVertical: 20,
  },
  qubitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
    height: 50,
  },
  qubitLabel: {
    fontSize: 14,
    color: palette.textPrimary,
    fontWeight: 'bold',
    width: 60,
    fontFamily: 'monospace',
  },
  qubitLine: {
    flex: 1,
    height: 2,
    backgroundColor: palette.accentPrimary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
  },
  gate: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  gateAnimated: {
    transform: [{ scale: 1.2 }],
    shadowColor: palette.accentPrimary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },
  gateLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  measurement: {
    width: 60,
    height: 50,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: palette.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  measurementIcon: {
    fontSize: 18,
    color: palette.success,
  },
  legend: {
    marginTop: 30,
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1F2A37',
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: palette.textPrimary,
    marginBottom: 10,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendGate: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: palette.textSecondary,
  },
  loadingText: {
    color: palette.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    padding: 40,
  },
  errorText: {
    color: palette.danger,
    fontSize: 14,
    textAlign: 'center',
    padding: 40,
  },
});

export default QuantumCircuitVisualizer;
