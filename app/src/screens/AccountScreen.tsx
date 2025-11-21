import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Zap, Crown, Building2, LogOut, User } from 'lucide-react-native';
import useRootStore from '../state/store';

export default function AccountScreen() {
  const user = useRootStore((state) => state.user);
  const token = useRootStore((state) => state.token);
  const logout = useRootStore((state) => state.logout);
  const [usage, setUsage] = useState<any>(null);
  const [tiers, setTiers] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAccountData();
  }, []);

  const loadAccountData = async () => {
    try {
      if (!token) {
        setLoading(false);
        return;
      }

      // Get usage stats
      const usageResponse = await fetch('http://localhost:5000/api/auth/usage', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const usageData = await usageResponse.json();
      setUsage(usageData);

      // Get subscription tiers
      const tiersResponse = await fetch(
        'http://localhost:5000/api/auth/subscription/tiers',
      );
      const tiersData = await tiersResponse.json();
      setTiers(tiersData.tiers);

      setLoading(false);
    } catch (error) {
      // Error loading account data - handled in UI
      setLoading(false);
    }
  };

  const handleUpgrade = async (tier: string) => {
    try {
      if (!token) return;

      const response = await fetch(
        'http://localhost:5000/api/auth/subscription/upgrade',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ tier }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', data.message);
        loadAccountData(); // Reload to show updated tier
      } else {
        Alert.alert('Error', data.error || 'Upgrade failed');
      }
    } catch (error) {
      // Upgrade error - handled in UI
      Alert.alert('Error', 'Connection failed');
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const currentTier = user?.subscription_tier || 'free';
  const tierInfo = tiers?.[currentTier];

  const getTierIcon = (tier: string) => {
    if (tier === 'free') return Zap;
    if (tier === 'pro') return Crown;
    return Building2;
  };

  const getTierColor = (tier: string) => {
    if (tier === 'free') return '#888';
    if (tier === 'pro') return '#ffd700';
    return '#00d4ff';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <User size={40} color="#00d4ff" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#ff4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Current Subscription */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Subscription</Text>
        <View style={[styles.tierCard, { borderColor: getTierColor(currentTier) }]}>
          {React.createElement(getTierIcon(currentTier), {
            size: 32,
            color: getTierColor(currentTier),
          })}
          <Text style={[styles.tierName, { color: getTierColor(currentTier) }]}>
            {tierInfo?.name || 'Free'}
          </Text>
          <Text style={styles.tierPrice}>
            {tierInfo?.price === 0 ? 'Free Forever' : `$${tierInfo?.price}/month`}
          </Text>
        </View>
      </View>

      {/* Usage Statistics */}
      {usage && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Usage This Period</Text>

          <View style={styles.usageCard}>
            <View style={styles.usageRow}>
              <Text style={styles.usageLabel}>Quantum Jobs</Text>
              <Text style={styles.usageValue}>
                {usage.usage.quantum_jobs_this_month} /{' '}
                {usage.limits.quantum_jobs_per_month === -1
                  ? '∞'
                  : usage.limits.quantum_jobs_per_month}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(usage.percentage_used.quantum_jobs, 100)}%` },
                ]}
              />
            </View>
          </View>

          <View style={styles.usageCard}>
            <View style={styles.usageRow}>
              <Text style={styles.usageLabel}>AI Optimizations Today</Text>
              <Text style={styles.usageValue}>
                {usage.usage.ai_optimizations_today} /{' '}
                {usage.limits.ai_optimizations_per_day === -1
                  ? '∞'
                  : usage.limits.ai_optimizations_per_day}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(usage.percentage_used.ai_optimizations, 100)}%` },
                ]}
              />
            </View>
          </View>

          <View style={styles.usageCard}>
            <View style={styles.usageRow}>
              <Text style={styles.usageLabel}>Workflows Created</Text>
              <Text style={styles.usageValue}>
                {usage.usage.workflows_created} /{' '}
                {usage.limits.workflow_limit === -1 ? '∞' : usage.limits.workflow_limit}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(usage.percentage_used.workflows, 100)}%` },
                ]}
              />
            </View>
          </View>
        </View>
      )}

      {/* Available Plans */}
      {currentTier !== 'enterprise' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upgrade Your Plan</Text>

          {Object.entries(tiers || {}).map(([key, tier]: [string, any]) => {
            if (key === currentTier) return null;

            const TierIcon = getTierIcon(key);
            const tierColor = getTierColor(key);

            return (
              <View key={key} style={[styles.planCard, { borderColor: tierColor }]}>
                <View style={styles.planHeader}>
                  <TierIcon size={24} color={tierColor} />
                  <Text style={[styles.planName, { color: tierColor }]}>{tier.name}</Text>
                  <Text style={styles.planPrice}>
                    {tier.price === 0 ? 'Free' : `$${tier.price}/mo`}
                  </Text>
                </View>

                <View style={styles.planFeatures}>
                  {tier.features.map((feature: string, idx: number) => (
                    <Text key={idx} style={styles.featureText}>
                      ✓ {feature}
                    </Text>
                  ))}
                  <Text style={styles.featureText}>
                    ✓{' '}
                    {tier.quantum_jobs_per_month === -1
                      ? 'Unlimited'
                      : tier.quantum_jobs_per_month}{' '}
                    quantum jobs/month
                  </Text>
                  <Text style={styles.featureText}>
                    ✓ Up to {tier.max_qubits === -1 ? 'unlimited' : tier.max_qubits}{' '}
                    qubits
                  </Text>
                </View>

                {tier.price > 0 && (
                  <TouchableOpacity
                    style={[styles.upgradeButton, { backgroundColor: tierColor }]}
                    onPress={() => handleUpgrade(key)}
                  >
                    <Text style={styles.upgradeButtonText}>Upgrade to {tier.name}</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e1a',
  },
  header: {
    backgroundColor: '#1a1f2e',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#00d4ff',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0a0e1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00d4ff',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  userEmail: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  logoutText: {
    color: '#ff4444',
    marginLeft: 8,
    fontWeight: '600',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  tierCard: {
    backgroundColor: '#1a1f2e',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
  },
  tierName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
  },
  tierPrice: {
    fontSize: 16,
    color: '#888',
    marginTop: 8,
  },
  usageCard: {
    backgroundColor: '#1a1f2e',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  usageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  usageLabel: {
    fontSize: 14,
    color: '#ccc',
  },
  usageValue: {
    fontSize: 14,
    color: '#00d4ff',
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#0a0e1a',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00d4ff',
  },
  planCard: {
    backgroundColor: '#1a1f2e',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
    flex: 1,
  },
  planPrice: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  planFeatures: {
    marginBottom: 16,
  },
  featureText: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 8,
  },
  upgradeButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#0a0e1a',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
});
