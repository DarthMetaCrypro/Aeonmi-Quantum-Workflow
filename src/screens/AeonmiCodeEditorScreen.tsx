/**
 * ⊗ Aeonmi Code Editor
 *
 * ◎ Quantum-Classical Hybrid Syntax Editor
 * λ≔ Real-time Aeonmi code execution
 * ⟲ BB84-secured quantum runtime environment
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useAppStore } from '../stores/appStore';

export function AeonmiCodeEditorScreen() {
  const { executeAeonmiCode, userProfile } = useAppStore();
  const [code, setCode] = useState(`// λ≔ Aeonmi Quantum Workflow
let x = 10;
let message = "Hello Quantum World";

// ⊗ Quantum operations
hadamard q1;
measure q1;

// ⟲ Control flow
if (x > 5) {
    log("High quantum value: " + x);
}

log(message);`);
  const [output, setOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecute = async () => {
    if (!userProfile) {
      Alert.alert('Error', 'Please create an Aeonmi profile first');
      return;
    }

    setIsExecuting(true);
    try {
      const result = await executeAeonmiCode(code);
      if (result.success) {
        const outputText = `◎ Execution Successful!
Quantum Advantage: ${result.quantumAdvantage}x
Execution Time: ${new Date(result.executionTime).toLocaleTimeString()}

Results:
${Object.entries(result.result).map(([key, value]) =>
  `${key}: ${value}`
).join('\n')}`;
        setOutput(outputText);
      } else {
        setOutput(`❌ Execution Failed: ${result.error}`);
      }
    } catch (error) {
      setOutput(`❌ Error: ${(error as Error).message}`);
    }
    setIsExecuting(false);
  };

  const loadExample = (exampleType: string) => {
    switch (exampleType) {
      case 'variables':
        setCode(`// λ≔ Variable Operations
let quantum_number = 42;
let superposition = "entangled";
let efficiency = 95.7;

log("Quantum number: " + quantum_number);
log("State: " + superposition);
log("Efficiency: " + efficiency + "%");`);
        break;
      case 'quantum':
        setCode(`// ⊗ Quantum Operations
hadamard q1;  // Create superposition |0⟩ + |1⟩
measure q1;    // Collapse to classical state

// ⟲ Quantum workflow
let entangled = true;
if (entangled) {
    log("Quantum entanglement detected");
} else {
    log("Classical state observed");
}`);
        break;
      case 'workflow':
        setCode(`// ◎ Complete Aeonmi Workflow
let workflow_name = "Quantum Automation";
let efficiency = 0;
let iterations = 5;

// ⟲ Loop with quantum optimization
for i in 0..iterations {
    efficiency = efficiency + (i * 2.5);
    log("Iteration " + i + ": " + efficiency + "% efficient");
}

// ⊗ Final quantum measurement
hadamard result;
measure result;

log(workflow_name + " completed with " + efficiency + "% efficiency");`);
        break;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⊗ Aeonmi Code Editor</Text>
      <Text style={styles.subtitle}>Quantum-Classical Hybrid Programming</Text>

      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.exampleButton} onPress={() => loadExample('variables')}>
          <Text style={styles.exampleButtonText}>Variables</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.exampleButton} onPress={() => loadExample('quantum')}>
          <Text style={styles.exampleButtonText}>Quantum Ops</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.exampleButton} onPress={() => loadExample('workflow')}>
          <Text style={styles.exampleButtonText}>Workflow</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.executeButton, isExecuting && styles.executingButton]}
          onPress={handleExecute}
          disabled={isExecuting}
        >
          <Text style={styles.executeButtonText}>
            {isExecuting ? '⟲ Executing...' : '◎ Execute'}
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.codeEditor}
        value={code}
        onChangeText={setCode}
        multiline
        placeholder="Enter Aeonmi code..."
        placeholderTextColor="#666"
      />

      <Text style={styles.outputLabel}>λ≔ Execution Output:</Text>
      <ScrollView style={styles.outputContainer}>
        <Text style={styles.output}>{output || 'Ready to execute quantum code...'}</Text>
      </ScrollView>

      <View style={styles.syntaxCard}>
        <Text style={styles.syntaxTitle}>📚 Aeonmi Syntax Guide</Text>
        <Text style={styles.syntaxText}>
          • Variables: let x = value{'\n'}
          • Quantum: hadamard q, measure q{'\n'}
          • Control: if/else, for i in range{'\n'}
          • Output: log(message)
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00ffff',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  exampleButton: {
    backgroundColor: '#333',
    padding: 8,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 2,
  },
  exampleButtonText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
  executeButton: {
    backgroundColor: '#00ff00',
    padding: 8,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 2,
  },
  executingButton: {
    backgroundColor: '#666',
  },
  executeButtonText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  codeEditor: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#00ffff',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontFamily: 'monospace',
    fontSize: 14,
    height: 200,
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  outputLabel: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  outputContainer: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
    height: 150,
    marginBottom: 15,
  },
  output: {
    color: '#00ff00',
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
  },
  syntaxCard: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff6b00',
  },
  syntaxTitle: {
    fontSize: 16,
    color: '#ff6b00',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  syntaxText: {
    fontSize: 12,
    color: '#ccc',
    lineHeight: 18,
  },
});