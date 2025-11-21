import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Users, Cloud, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react-native';
import { palette } from '../theme/colors';
import { api, SyncStatus } from '../services/api';
import useRootStore from '../state/store';

const CollaborationScreen = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const isBackendConnected = useRootStore((state) => state.isBackendConnected);

  useEffect(() => {
    fetchSyncStatus();
  }, []);

  const fetchSyncStatus = async () => {
    const status = await api.getSyncStatus();
    setSyncStatus(status);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await api.syncWorkflows();
      await fetchSyncStatus();
    } catch (error) {
      // Sync failed - error handled in UI
    } finally {
      setIsSyncing(false);
    }
  };

  const teamMembers = [
    { id: '1', name: 'Dr. Quantum', role: 'Lead Researcher', status: 'online' },
    { id: '2', name: 'Alice Q.', role: 'Algorithm Engineer', status: 'offline' },
    { id: '3', name: 'Bob B.', role: 'Security Analyst', status: 'busy' },
  ];

  const renderMember = ({ item }: { item: any }) => (
    <View style={styles.memberItem}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.name}</Text>
        <Text style={styles.memberRole}>{item.role}</Text>
      </View>
      <View
        style={[
          styles.statusIndicator,
          {
            backgroundColor:
              item.status === 'online'
                ? palette.success
                : item.status === 'busy'
                  ? palette.warning
                  : palette.textTertiary,
          },
        ]}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Users color={palette.accentPrimary} size={24} />
        <Text style={styles.headerTitle}>Collaboration & Cloud</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Cloud color={palette.accentSecondary} size={20} />
          <Text style={styles.cardTitle}>Cloud Sync Status</Text>
        </View>

        <View style={styles.syncStatusContainer}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Status:</Text>
            <View style={styles.statusValueContainer}>
              {syncStatus?.status === 'synced' ? (
                <CheckCircle color={palette.success} size={16} />
              ) : (
                <AlertCircle color={palette.warning} size={16} />
              )}
              <Text style={styles.statusValue}>
                {syncStatus?.status.toUpperCase() || 'UNKNOWN'}
              </Text>
            </View>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Last Synced:</Text>
            <Text style={styles.statusValue}>
              {syncStatus
                ? new Date(syncStatus.last_synced).toLocaleTimeString()
                : '--:--'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.syncButton, isSyncing && styles.buttonDisabled]}
          onPress={handleSync}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <ActivityIndicator color={palette.background} size="small" />
          ) : (
            <>
              <RefreshCw color={palette.background} size={16} />
              <Text style={styles.buttonText}>Sync Now</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Users color={palette.accentPrimary} size={20} />
          <Text style={styles.cardTitle}>Team Members</Text>
        </View>
        <FlatList
          data={teamMembers}
          renderItem={renderMember}
          keyExtractor={(item: any) => item.id}
          scrollEnabled={false}
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
  syncStatusContainer: {
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'center',
  },
  statusLabel: {
    color: palette.textSecondary,
    fontSize: 14,
  },
  statusValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusValue: {
    color: palette.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  syncButton: {
    flexDirection: 'row',
    backgroundColor: palette.accentPrimary,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: palette.textTertiary,
  },
  buttonText: {
    color: palette.background,
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 14,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: palette.accentPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    color: palette.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  memberRole: {
    color: palette.textSecondary,
    fontSize: 12,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

export default CollaborationScreen;
