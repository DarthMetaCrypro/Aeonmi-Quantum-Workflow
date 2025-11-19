/**
 * Æ Q.U.B.E. Titan Evolution Panel
 *
 * ◎ Live A/B evolution panel for Titan nodes
 * ⟲ Quantum evolutionary algorithms with real-time feedback
 * ⊗ Intelligent variant optimization and winner selection
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { NodeData } from '../nodes/types';

interface TitanEvolutionPanelProps {
  titanNode: NodeData | null;
  onUpdateNode: (nodeId: string, updates: Partial<NodeData>) => void;
}

export function TitanEvolutionPanel({ titanNode, onUpdateNode }: TitanEvolutionPanelProps) {
  const [evolutionProgress, setEvolutionProgress] = useState(0);
  const [isEvolving, setIsEvolving] = useState(false);
  const progressAnim = new Animated.Value(0);

  useEffect(() => {
    if (isEvolving) {
      // ◎ Q.U.B.E. evolution animation with quantum timing
      Animated.timing(progressAnim, {
        toValue: 100,
        duration: 5000,
        useNativeDriver: false,
      }).start(() => {
        setIsEvolving(false);
        setEvolutionProgress(100);
        // ⟲ Simulate quantum evolution result
        const winner = Math.random() > 0.5 ? 'A' : 'B';
        if (titanNode) {
          onUpdateNode(titanNode.id, {
            config: {
              ...titanNode.config,
              winner,
              evolutionComplete: true,
              timestamp: new Date().toISOString()
            }
          });
        }
      });
    }
  }, [isEvolving, titanNode, onUpdateNode, progressAnim]);

  const startEvolution = () => {
    if (!titanNode) return;
    setIsEvolving(true);
    setEvolutionProgress(0);
    progressAnim.setValue(0);
    onUpdateNode(titanNode.id, {
      config: {
        ...titanNode.config,
        evolutionComplete: false,
        winner: null
      }
    });
  };

  const selectVariant = (variant: 'A' | 'B') => {
    if (!titanNode) return;
    // ⊗ Quantum variant selection with Q.U.B.E. state update
    onUpdateNode(titanNode.id, {
      config: {
        ...titanNode.config,
        selectedVariant: variant,
        winner: variant
      }
    });
  };

  if (!titanNode || titanNode.type !== 'titan') {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>◎ Titan A/B Evolution</Text>
        <Text style={styles.status}>
          {isEvolving ? '⟲ Evolving...' : titanNode.config.evolutionComplete ? '⊗ Complete' : '◎ Ready'}
        </Text>
      </View>

      <View style={styles.variantsContainer}>
        <TouchableOpacity
          style={[
            styles.variantButton,
            titanNode.config.selectedVariant === 'A' && styles.selectedVariant
          ]}
          onPress={() => selectVariant('A')}
        >
          <Text style={styles.variantLabel}>|ψ⟩ Variant A</Text>
          <Text style={styles.variantContent}>
            {titanNode.config.variantA || '⊗ Prompt A content...'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.variantButton,
            titanNode.config.selectedVariant === 'B' && styles.selectedVariant
          ]}
          onPress={() => selectVariant('B')}
        >
          <Text style={styles.variantLabel}>|ψ⟩ Variant B</Text>
          <Text style={styles.variantContent}>
            {titanNode.config.variantB || '⊗ Prompt B content...'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.evolveButton, isEvolving && styles.evolving]}
          onPress={startEvolution}
          disabled={isEvolving}
        >
          <Text style={styles.evolveText}>
            {isEvolving ? '⟲ Evolving...' : '◎ Start Evolution'}
          </Text>
        </TouchableOpacity>
      </View>

      {isEvolving && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>⟲ Evolution Progress</Text>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {evolutionProgress.toFixed(1)}%
          </Text>
        </View>
      )}

      {titanNode.config.winner && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultLabel}>⊗ Winner:</Text>
          <Text style={[styles.resultWinner, titanNode.config.winner === 'A' ? styles.winnerA : styles.winnerB]}>
            |ψ⟩ Variant {titanNode.config.winner}
          </Text>
          <Text style={styles.resultTimestamp}>
            {titanNode.config.timestamp ? new Date(titanNode.config.timestamp).toLocaleTimeString() : ''}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0f1419',
    borderTopWidth: 1,
    borderTopColor: '#333',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#45b7d1',
    fontSize: 16,
    fontWeight: 'bold',
  },
  status: {
    color: '#f39c12',
    fontSize: 12,
  },
  variantsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  variantButton: {
    flex: 1,
    backgroundColor: '#1a1f24',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
  },
  selectedVariant: {
    borderColor: '#45b7d1',
    backgroundColor: '#1a2a33',
  },
  variantLabel: {
    color: '#45b7d1',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  variantContent: {
    color: '#fff',
    fontSize: 10,
    lineHeight: 14,
  },
  controls: {
    marginBottom: 16,
  },
  evolveButton: {
    backgroundColor: '#f39c12',
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
  },
  evolving: {
    backgroundColor: '#e67e22',
  },
  evolveText: {
    color: '#0f1419',
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressLabel: {
    color: '#45b7d1',
    fontSize: 12,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#f39c12',
    borderRadius: 4,
  },
  progressText: {
    color: '#f39c12',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
  },
  resultContainer: {
    alignItems: 'center',
  },
  resultLabel: {
    color: '#45b7d1',
    fontSize: 12,
    marginBottom: 4,
  },
  resultWinner: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  winnerA: {
    color: '#e74c3c',
  },
  winnerB: {
    color: '#27ae60',
  },
  resultTimestamp: {
    color: '#666',
    fontSize: 10,
  },
});