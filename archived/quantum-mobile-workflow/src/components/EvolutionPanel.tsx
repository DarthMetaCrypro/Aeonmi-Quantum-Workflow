// src/components/EvolutionPanel.tsx

import React, { useState } from 'react';
import { View, Text, Switch, TextInput, StyleSheet } from 'react-native';
import { EvolutionPolicy } from '../types';

export const EvolutionPanel: React.FC<{
  policy: EvolutionPolicy;
  onPolicyChange: (policy: EvolutionPolicy) => void;
}> = ({ policy, onPolicyChange }) => {
  const [maxVariants, setMaxVariants] = useState(policy.maxVariants.toString());

  const updatePolicy = (updates: Partial<EvolutionPolicy>) => {
    onPolicyChange({ ...policy, ...updates });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Evolution Policy</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Enabled:</Text>
        <Switch
          value={policy.enabled}
          onValueChange={(enabled) => updatePolicy({ enabled })}
          trackColor={{ false: '#767577', true: '#00d4ff' }}
          thumbColor={policy.enabled ? '#ffffff' : '#f4f3f4'}
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Max Variants:</Text>
        <TextInput
          style={styles.input}
          value={maxVariants}
          onChangeText={(text) => {
            setMaxVariants(text);
            const num = parseInt(text, 10);
            if (!isNaN(num)) updatePolicy({ maxVariants: num });
          }}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Primary KPI:</Text>
        <Text style={styles.value}>{policy.kpiPrimary}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>QUBE Security Required:</Text>
        <Switch
          value={policy.constraints.mustUseQubeSecurity}
          onValueChange={(mustUseQubeSecurity) =>
            updatePolicy({
              constraints: { ...policy.constraints, mustUseQubeSecurity },
            })
          }
          trackColor={{ false: '#767577', true: '#00d4ff' }}
          thumbColor={policy.constraints.mustUseQubeSecurity ? '#ffffff' : '#f4f3f4'}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2a2a2a',
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00d4ff',
  },
  title: {
    fontSize: 18,
    color: '#00d4ff',
    marginBottom: 15,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
  },
  value: {
    color: '#cccccc',
    fontSize: 14,
  },
  input: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#00d4ff',
  },
});