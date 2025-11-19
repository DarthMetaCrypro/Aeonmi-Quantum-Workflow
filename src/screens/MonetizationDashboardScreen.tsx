/**
 * ◎ Aeonmi Monetization Dashboard
 *
 * λ≔ Revenue tracking and quantum efficiency analytics
 * ⊗ Workflow usage monetization
 * ⟲ Self-evolving pricing optimization
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAppStore } from '../stores/appStore';

export function MonetizationDashboardScreen() {
  const { monetizationStats, aeonmiWorkflows, userProfile, evolveWorkflow, monetizeWorkflow } = useAppStore();

  const handleEvolveWorkflow = (workflowId: string) => {
    evolveWorkflow(workflowId);
  };

  const handleMonetizeWorkflow = (workflowId: string) => {
    monetizeWorkflow(workflowId, Math.random() * 10); // Simulate revenue
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>◎ Aeonmi Monetization</Text>
      <Text style={styles.subtitle}>Quantum workflow revenue engine</Text>

      {/* Stats Overview */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>${monetizationStats.totalRevenue.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Total Revenue</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{monetizationStats.activeWorkflows}</Text>
          <Text style={styles.statLabel}>Active Workflows</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{monetizationStats.quantumEfficiency.toFixed(1)}%</Text>
          <Text style={styles.statLabel}>Quantum Efficiency</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{monetizationStats.userCredits}</Text>
          <Text style={styles.statLabel}>Credits Remaining</Text>
        </View>
      </View>

      {/* Subscription Status */}
      {userProfile && (
        <View style={styles.subscriptionCard}>
          <Text style={styles.cardTitle}>🏆 Subscription Status</Text>
          <Text style={styles.subscriptionTier}>{userProfile.subscription.tier.toUpperCase()}</Text>
          <Text style={styles.subscriptionDetail}>
            Expires: {new Date(userProfile.subscription.expiresAt).toLocaleDateString()}
          </Text>
          <Text style={styles.subscriptionDetail}>
            Credits: {userProfile.subscription.credits}
          </Text>
        </View>
      )}

      {/* Workflow Performance */}
      <View style={styles.workflowsCard}>
        <Text style={styles.cardTitle}>⟲ Aeonmi Workflows</Text>
        {aeonmiWorkflows.length === 0 ? (
          <Text style={styles.emptyText}>No workflows created yet</Text>
        ) : (
          aeonmiWorkflows.map((workflow) => (
            <View key={workflow.id} style={styles.workflowItem}>
              <View style={styles.workflowHeader}>
                <Text style={styles.workflowName}>{workflow.name}</Text>
                <Text style={styles.workflowRevenue}>${workflow.monetization.revenue.toFixed(2)}</Text>
              </View>

              <Text style={styles.workflowDesc}>{workflow.description}</Text>

              <View style={styles.workflowStats}>
                <Text style={styles.stat}>Efficiency: {workflow.performance.efficiency.toFixed(1)}%</Text>
                <Text style={styles.stat}>Quantum: {workflow.performance.quantumAdvantage.toFixed(1)}x</Text>
                <Text style={styles.stat}>Usage: {workflow.monetization.usage}</Text>
              </View>

              <View style={styles.workflowActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleEvolveWorkflow(workflow.id)}
                >
                  <Text style={styles.actionButtonText}>⟲ Evolve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleMonetizeWorkflow(workflow.id)}
                >
                  <Text style={styles.actionButtonText}>◎ Monetize</Text>
                </TouchableOpacity>
              </View>

              {workflow.evolutionHistory.length > 0 && (
                <View style={styles.evolutionHistory}>
                  <Text style={styles.evolutionTitle}>Evolution History:</Text>
                  {workflow.evolutionHistory.slice(-3).map((evolution, index) => (
                    <Text key={index} style={styles.evolutionItem}>
                      • {evolution.changes.join(', ')} ({new Date(evolution.timestamp).toLocaleDateString()})
                    </Text>
                  ))}
                </View>
              )}
            </View>
          ))
        )}
      </View>

      {/* Revenue Optimization */}
      <View style={styles.optimizationCard}>
        <Text style={styles.cardTitle}>λ≔ Revenue Optimization</Text>
        <Text style={styles.optimizationText}>
          • Self-evolving workflows increase efficiency by 5-10% per evolution
          • Quantum advantage provides 2.5x performance improvement
          • Monetization scales with workflow usage and complexity
          • BB84 security enables enterprise-grade deployments
        </Text>
      </View>

      {/* Achievements */}
      {userProfile && userProfile.achievements.length > 0 && (
        <View style={styles.achievementsCard}>
          <Text style={styles.cardTitle}>🏆 Achievements</Text>
          {userProfile.achievements.map((achievement, index) => (
            <Text key={index} style={styles.achievement}>• {achievement}</Text>
          ))}
        </View>
      )}
    </ScrollView>
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 8,
    width: '48%',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00ff00',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#ccc',
    textAlign: 'center',
  },
  subscriptionCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ff6b00',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  subscriptionTier: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ff6b00',
    marginBottom: 10,
  },
  subscriptionDetail: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 5,
  },
  workflowsCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#00ffff',
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  workflowItem: {
    backgroundColor: '#0a0a0a',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  workflowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  workflowName: {
    fontSize: 16,
    color: '#00ffff',
    fontWeight: 'bold',
  },
  workflowRevenue: {
    fontSize: 16,
    color: '#00ff00',
    fontWeight: 'bold',
  },
  workflowDesc: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 10,
  },
  workflowStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  stat: {
    fontSize: 12,
    color: '#888',
  },
  workflowActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#333',
    padding: 8,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  evolutionHistory: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  evolutionTitle: {
    fontSize: 12,
    color: '#ff6b00',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  evolutionItem: {
    fontSize: 11,
    color: '#ccc',
    marginBottom: 2,
  },
  optimizationCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#00ff00',
  },
  optimizationText: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 22,
  },
  achievementsCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffd700',
  },
  achievement: {
    fontSize: 14,
    color: '#ffd700',
    marginBottom: 5,
  },
});