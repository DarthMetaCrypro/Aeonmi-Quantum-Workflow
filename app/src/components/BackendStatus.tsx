import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { api } from '../services/api';
import { palette } from '../theme/colors';
import useRootStore from '../state/store';

const BackendStatus: React.FC = () => {
  const setBackendConnected = useRootStore((state) => state.setBackendConnected);
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'checking'>(
    'checking',
  );
  const [info, setInfo] = useState<{ workflows: number; endpoints: number } | null>(null);

  const checkConnection = async () => {
    setStatus('checking');
    try {
      const health = await api.checkHealth();
      setStatus('connected');
      setBackendConnected(true);
      setInfo({ workflows: health.workflows, endpoints: health.endpoints });
    } catch (e) {
      setStatus('disconnected');
      setBackendConnected(false);
      setInfo(null);
    }
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <TouchableOpacity onPress={checkConnection} style={styles.container}>
      <View
        style={[
          styles.dot,
          status === 'connected' ? styles.connected : styles.disconnected,
        ]}
      />
      <Text style={styles.text}>
        {status === 'checking'
          ? 'Connecting...'
          : status === 'connected'
            ? `Backend: Online • ${info?.workflows || 0} Workflows • ${info?.endpoints || 0} API Endpoints`
            : 'Backend: Offline'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F2A37',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  connected: {
    backgroundColor: palette.success,
    shadowColor: palette.success,
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  disconnected: {
    backgroundColor: palette.danger,
  },
  text: {
    color: palette.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default BackendStatus;
