import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import {
  Server,
  Activity,
  Lock,
  Play,
  Check,
  Clock,
  AlertTriangle,
  CheckCircle,
  Cpu,
} from 'lucide-react-native';
import { palette } from '../theme/colors';
import { api, HardwareInfo, HardwareJob } from '../services/api';
import useRootStore from '../state/store';

const HardwareScreen = () => {
  const [apiToken, setApiToken] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [hardwareInfo, setHardwareInfo] = useState<HardwareInfo | null>(null);
  const [jobs, setJobs] = useState<HardwareJob[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Load initial mock data
    fetchJobs();
  }, []);

  const handleConnect = async () => {
    if (!apiToken.trim()) return;
    setIsConnecting(true);
    try {
      const response = await api.connectToHardware(apiToken);
      if (response.status === 'success') {
        setIsConnected(true);
        const info = await api.getHardwareInfo();
        setHardwareInfo(info);
        fetchJobs();
      }
    } catch (error) {
      // Connection failed - error handled in UI
    } finally {
      setIsConnecting(false);
    }
  };

  const fetchJobs = async () => {
    const jobList = await api.getHardwareJobs();
    setJobs(jobList);
  };

  const renderJobItem = ({ item }: { item: HardwareJob }) => {
    let statusColor = palette.textSecondary;
    let StatusIcon = Clock;

    switch (item.status) {
      case 'completed':
        statusColor = palette.success;
        StatusIcon = CheckCircle;
        break;
      case 'running':
        statusColor = palette.accentPrimary;
        StatusIcon = Activity;
        break;
      case 'failed':
        statusColor = palette.error;
        StatusIcon = AlertTriangle;
        break;
    }

    return (
      <View style={styles.jobItem}>
        <View style={styles.jobIconContainer}>
          <StatusIcon color={statusColor} size={20} />
        </View>
        <View style={styles.jobInfo}>
          <Text style={styles.jobId}>{item.job_id}</Text>
          <Text style={styles.jobBackend}>
            {item.backend} • {item.shots} shots
          </Text>
        </View>
        <View style={[styles.statusBadge, { borderColor: statusColor }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Cpu color={palette.accentPrimary} size={24} />
        <Text style={styles.headerTitle}>Hardware Integration Console</Text>
      </View>

      {/* Connection Manager */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Lock color={palette.accentSecondary} size={20} />
          <Text style={styles.cardTitle}>IBM Quantum Access</Text>
        </View>

        {!isConnected ? (
          <>
            <Text style={styles.label}>API Token</Text>
            <TextInput
              style={styles.input}
              value={apiToken}
              onChangeText={setApiToken}
              placeholder="Paste your IBM Quantum API Token"
              placeholderTextColor={palette.textTertiary}
              secureTextEntry
            />
            <TouchableOpacity
              style={[styles.button, isConnecting && styles.buttonDisabled]}
              onPress={handleConnect}
              disabled={isConnecting || !apiToken.trim()}
            >
              {isConnecting ? (
                <ActivityIndicator color={palette.background} size="small" />
              ) : (
                <Text style={styles.buttonText}>Connect to Quantum Cloud</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.connectedContainer}>
            <CheckCircle color={palette.success} size={48} />
            <Text style={styles.connectedText}>Securely Connected</Text>
            <TouchableOpacity
              style={styles.disconnectButton}
              onPress={() => setIsConnected(false)}
            >
              <Text style={styles.disconnectText}>Disconnect</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Hardware Status */}
      {isConnected && hardwareInfo && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Server color={palette.accentPrimary} size={20} />
            <Text style={styles.cardTitle}>Backend Status</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Backend Name</Text>
            <Text style={styles.infoValue}>{hardwareInfo.backend_name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Qubits Available</Text>
            <Text style={styles.infoValue}>{hardwareInfo.num_qubits}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>System Status</Text>
            <View style={styles.statusIndicator}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      hardwareInfo.status === 'active' ? palette.success : palette.error,
                  },
                ]}
              />
              <Text style={styles.infoValue}>{hardwareInfo.status.toUpperCase()}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Job Monitor */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Play color={palette.textPrimary} size={20} />
          <Text style={styles.cardTitle}>Job Monitor</Text>
        </View>

        <FlatList
          data={jobs}
          renderItem={renderJobItem}
          keyExtractor={(item: HardwareJob) => item.job_id}
          scrollEnabled={false}
          ListEmptyComponent={<Text style={styles.emptyText}>No jobs found.</Text>}
        />
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
    marginLeft: 8,
  },
  label: {
    color: palette.textSecondary,
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: palette.background,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 8,
    padding: 12,
    color: palette.textPrimary,
    marginBottom: 16,
  },
  button: {
    backgroundColor: palette.accentPrimary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: palette.textTertiary,
  },
  buttonText: {
    color: palette.background,
    fontWeight: 'bold',
    fontSize: 14,
  },
  connectedContainer: {
    alignItems: 'center',
    padding: 16,
  },
  connectedText: {
    color: palette.success,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 16,
  },
  disconnectButton: {
    padding: 8,
  },
  disconnectText: {
    color: palette.error,
    fontSize: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignItems: 'center',
  },
  infoLabel: {
    color: palette.textSecondary,
    fontSize: 14,
  },
  infoValue: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  jobItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  jobIconContainer: {
    marginRight: 12,
  },
  jobInfo: {
    flex: 1,
  },
  jobId: {
    color: palette.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  jobBackend: {
    color: palette.textSecondary,
    fontSize: 12,
  },
  statusBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyText: {
    color: palette.textTertiary,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default HardwareScreen;
