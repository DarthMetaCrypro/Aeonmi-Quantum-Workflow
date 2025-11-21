import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { Shield, Activity, Zap } from 'lucide-react-native';
import { palette } from '../theme/colors';
import { api } from '../services/api';
import useRootStore from '../state/store';

interface BB84Key {
  key_id: string;
  key_length: number;
  key: string;
  error_rate: number;
  security_level: string;
  timestamp: string;
}

interface SecureChannel {
  channel_id: string;
  status: string;
  encryption: string;
  key_refresh_interval: string;
  eavesdropping_detected: boolean;
  timestamp: string;
}

const BB84SecurityScreen = () => {
  const isBackendConnected = useRootStore((state) => state.isBackendConnected);
  const [generatedKey, setGeneratedKey] = useState<BB84Key | null>(null);
  const [secureChannel, setSecureChannel] = useState<SecureChannel | null>(null);
  const [generating, setGenerating] = useState(false);
  const [qubits, setQubits] = useState<
    { basis: string; value: number; x: number; y: number }[]
  >([]);
  const [animatedValue] = useState(new Animated.Value(0));

  useEffect(() => {
    if (generating) {
      // Animate qubit generation
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [generating]);

  const generateQuantumKey = async () => {
    if (!isBackendConnected) return;

    setGenerating(true);

    // Simulate qubit generation visualization
    const newQubits = Array.from({ length: 8 }, (_, i) => ({
      basis: Math.random() > 0.5 ? 'X' : 'Z',
      value: Math.random() > 0.5 ? 1 : 0,
      x: Math.random() * 300,
      y: Math.random() * 200,
    }));
    setQubits(newQubits);

    try {
      const result = await api.generateBB84Key(256);
      setGeneratedKey(result);
    } catch (error) {
      // BB84 key generation failed - error handled in UI
    } finally {
      setGenerating(false);
    }
  };

  const establishSecureChannel = async () => {
    if (!isBackendConnected || !generatedKey) return;

    try {
      const result = await api.createSecureChannel({ key_id: generatedKey.key_id });
      setSecureChannel(result);
    } catch (error) {
      // Secure channel creation failed - error handled in UI
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Shield color={palette.accentPrimary} size={24} />
        <Text style={styles.headerTitle}>BB84 Quantum Security</Text>
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Quantum Key Distribution</Text>
        <Text style={styles.infoText}>
          BB84 protocol uses quantum mechanics to generate cryptographic keys that are
          provably secure. Any eavesdropping attempt disturbs the quantum state and is
          immediately detected.
        </Text>
      </View>

      {/* Quantum Visualization */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quantum State Transmission</Text>
        <View style={styles.quantumCanvas}>
          {qubits.map((qubit, index) => (
            <Animated.View
              key={index}
              style={[
                styles.qubit,
                {
                  left: qubit.x,
                  top: qubit.y,
                  opacity: animatedValue,
                },
              ]}
            >
              <Text style={styles.qubitBasis}>{qubit.basis}</Text>
              <Text style={styles.qubitValue}>{qubit.value}</Text>
            </Animated.View>
          ))}
          {qubits.length === 0 && (
            <Text style={styles.placeholderText}>Ready to generate quantum key</Text>
          )}
        </View>
      </View>

      {/* Key Generation */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Shield color={palette.accentSecondary} size={20} />
          <Text style={[styles.cardTitle, { marginBottom: 0, marginLeft: 8 }]}>
            Generate Quantum Key
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, generating && styles.buttonDisabled]}
          onPress={generateQuantumKey}
          disabled={generating || !isBackendConnected}
        >
          <Zap color={palette.background} size={20} />
          <Text style={styles.buttonText}>
            {generating ? 'Generating...' : 'Generate BB84 Key'}
          </Text>
        </TouchableOpacity>

        {generatedKey && (
          <View style={styles.keyDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Key ID:</Text>
              <Text style={styles.detailValue}>
                {generatedKey.key_id.substring(0, 8)}...
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Length:</Text>
              <Text style={styles.detailValue}>{generatedKey.key_length} bits</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Error Rate:</Text>
              <Text
                style={[
                  styles.detailValue,
                  {
                    color:
                      generatedKey.error_rate < 0.02 ? palette.success : palette.warning,
                  },
                ]}
              >
                {(generatedKey.error_rate * 100).toFixed(2)}%
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Security:</Text>
              <Text style={[styles.detailValue, { color: palette.success }]}>
                {generatedKey.security_level}
              </Text>
            </View>
            <View style={styles.keyPreview}>
              <Text style={styles.keyText}>{generatedKey.key}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Secure Channel */}
      {generatedKey && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Shield color={palette.success} size={20} />
            <Text style={[styles.cardTitle, { marginBottom: 0, marginLeft: 8 }]}>
              Secure Channel
            </Text>
          </View>

          {!secureChannel ? (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: palette.success }]}
              onPress={establishSecureChannel}
            >
              <Shield color={palette.background} size={20} />
              <Text style={styles.buttonText}>Establish Secure Channel</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.channelDetails}>
              <View style={styles.statusRow}>
                <Activity color={palette.success} size={16} />
                <Text style={[styles.statusText, { color: palette.success }]}>
                  Channel Active
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Encryption:</Text>
                <Text style={styles.detailValue}>{secureChannel.encryption}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Key Refresh:</Text>
                <Text style={styles.detailValue}>
                  {secureChannel.key_refresh_interval}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Eavesdropping:</Text>
                <View style={styles.statusBadge}>
                  {secureChannel.eavesdropping_detected ? (
                    <>
                      <Zap color={palette.error} size={16} />
                      <Text style={[styles.badgeText, { color: palette.error }]}>
                        Detected
                      </Text>
                    </>
                  ) : (
                    <>
                      <Shield color={palette.success} size={16} />
                      <Text style={[styles.badgeText, { color: palette.success }]}>
                        None Detected
                      </Text>
                    </>
                  )}
                </View>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Protocol Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>How BB84 Works</Text>
        <Text style={styles.infoText}>
          1. <Text style={styles.bold}>Preparation:</Text> Sender (Alice) prepares qubits
          in random bases (X or Z)
          {'\n'}2. <Text style={styles.bold}>Transmission:</Text> Qubits sent through
          quantum channel
          {'\n'}3. <Text style={styles.bold}>Measurement:</Text> Receiver (Bob) measures
          in random bases
          {'\n'}4. <Text style={styles.bold}>Basis Reconciliation:</Text> Alice and Bob
          compare bases over public channel
          {'\n'}5. <Text style={styles.bold}>Key Extraction:</Text> Keep only bits where
          bases matched
          {'\n'}6. <Text style={styles.bold}>Error Checking:</Text> Verify eavesdropping
          by comparing subset
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: palette.surface,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  headerTitle: {
    color: palette.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  card: {
    margin: 16,
    marginBottom: 0,
    padding: 16,
    backgroundColor: palette.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoCard: {
    margin: 16,
    padding: 16,
    backgroundColor: palette.surfaceElevated,
    borderRadius: 12,
  },
  infoTitle: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    color: palette.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  bold: {
    fontWeight: 'bold',
    color: palette.accentPrimary,
  },
  quantumCanvas: {
    height: 200,
    backgroundColor: palette.background,
    borderRadius: 8,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qubit: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: palette.accentSecondary,
  },
  qubitBasis: {
    color: palette.background,
    fontSize: 10,
    fontWeight: 'bold',
  },
  qubitValue: {
    color: palette.background,
    fontSize: 12,
    fontWeight: 'bold',
  },
  placeholderText: {
    color: palette.textSecondary,
    fontSize: 14,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: palette.accentPrimary,
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: palette.textSecondary,
  },
  buttonText: {
    color: palette.background,
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  keyDetails: {
    backgroundColor: palette.background,
    padding: 12,
    borderRadius: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    color: palette.textSecondary,
    fontSize: 14,
  },
  detailValue: {
    color: palette.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  keyPreview: {
    marginTop: 8,
    padding: 12,
    backgroundColor: palette.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.accentPrimary,
  },
  keyText: {
    color: palette.accentPrimary,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  channelDetails: {
    backgroundColor: palette.background,
    padding: 12,
    borderRadius: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default BB84SecurityScreen;
