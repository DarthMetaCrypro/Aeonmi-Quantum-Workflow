import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { BaseNodeComponent } from './BaseNode';
import { NodeProps } from './types';

export function TitanNode(props: NodeProps) {
  const { node, onUpdate } = props;
  const [showEvolution, setShowEvolution] = useState(false);

  const variants = node.config.variants || [
    { id: 'A', prompt: '', score: 0 },
    { id: 'B', prompt: '', score: 0 }
  ];

  const updateVariant = (index: number, field: string, value: any) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    onUpdate({
      config: { ...node.config, variants: newVariants }
    });
  };

  const addVariant = () => {
    const newVariants = [...variants, {
      id: String.fromCharCode(65 + variants.length),
      prompt: '',
      score: 0
    }];
    onUpdate({
      config: { ...node.config, variants: newVariants }
    });
  };

  return (
    <BaseNodeComponent
      {...props}
      title="Titan"
      color="#4ecdc4"
      icon="fitness"
    >
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.evolutionButton}
          onPress={() => setShowEvolution(!showEvolution)}
        >
          <Text style={styles.evolutionButtonText}>
            {showEvolution ? 'Hide' : 'Show'} A/B Evolution
          </Text>
        </TouchableOpacity>

        {showEvolution && (
          <ScrollView style={styles.evolutionPanel} horizontal showsHorizontalScrollIndicator={false}>
            {variants.map((variant: any, index: number) => (
              <View key={variant.id} style={styles.variant}>
                <Text style={styles.variantTitle}>Variant {variant.id}</Text>
                <TextInput
                  style={styles.variantInput}
                  placeholder="Enter prompt..."
                  value={variant.prompt}
                  onChangeText={(text) => updateVariant(index, 'prompt', text)}
                  multiline
                  placeholderTextColor="#666"
                />
                <Text style={styles.scoreLabel}>Score: {variant.score}</Text>
                <View style={styles.scoreButtons}>
                  <TouchableOpacity
                    style={styles.scoreButton}
                    onPress={() => updateVariant(index, 'score', variant.score + 1)}
                  >
                    <Text style={styles.scoreButtonText}>+</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.scoreButton}
                    onPress={() => updateVariant(index, 'score', Math.max(0, variant.score - 1))}
                  >
                    <Text style={styles.scoreButtonText}>-</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <TouchableOpacity style={styles.addVariantButton} onPress={addVariant}>
              <Text style={styles.addVariantText}>+</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
    </BaseNodeComponent>
  );
}

const styles = StyleSheet.create({
  content: {
    marginTop: 8,
  },
  evolutionButton: {
    backgroundColor: '#4ecdc4',
    padding: 6,
    borderRadius: 4,
    alignItems: 'center',
  },
  evolutionButtonText: {
    color: '#0f1419',
    fontSize: 10,
    fontWeight: 'bold',
  },
  evolutionPanel: {
    marginTop: 8,
    maxHeight: 120,
  },
  variant: {
    backgroundColor: '#0f1419',
    borderRadius: 4,
    padding: 8,
    marginRight: 8,
    minWidth: 120,
  },
  variantTitle: {
    color: '#4ecdc4',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  variantInput: {
    backgroundColor: '#1a1d23',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 4,
    padding: 4,
    color: '#fff',
    fontSize: 9,
    minHeight: 40,
    textAlignVertical: 'top',
    marginBottom: 4,
  },
  scoreLabel: {
    color: '#4ecdc4',
    fontSize: 8,
    marginBottom: 4,
  },
  scoreButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scoreButton: {
    backgroundColor: '#4ecdc4',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreButtonText: {
    color: '#0f1419',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addVariantButton: {
    backgroundColor: '#333',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addVariantText: {
    color: '#4ecdc4',
    fontSize: 20,
    fontWeight: 'bold',
  },
});