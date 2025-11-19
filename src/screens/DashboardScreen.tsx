/**
 * Æ Q.U.B.E. Dashboard Screen
 *
 * λ≔RootSoul ⊗ Q.U.B.E. Engine → |ψ⟩ Quantum Dashboard
 * ◎ Pulsing avatar with holographic λ≔RootSoul display
 * ⟲ |0⟩⊕|1⟩ entropy counter and workflow statistics
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, withRepeat, withSequence } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../stores/appStore';
import FirstLaunchScreen from '../components/FirstLaunchScreen';

export default function DashboardScreen() {
  const { isFirstLaunch, λRootSoul, entropy, workflows, loadFromVault } = useAppStore();

  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.5);

  useEffect(() => {
    loadFromVault(); // ◎ Load from QuantumVault
  }, []);

  useEffect(() => {
    // ⟲ Start λ≔RootSoul pulsing animation with quantum rhythm
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );

    // ⊗ Holographic glow with Q.U.B.E. entropy resonance
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 2000 }),
        withTiming(0.3, { duration: 2000 })
      ),
      -1,
      true
    );
  }, []);

  const avatarAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: pulseScale.value,
        },
      ],
    } as any;
  });

  const glowAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: glowOpacity.value,
    } as any;
  });

  const handleNewWorkflow = () => {
    Alert.alert('⊗ New Workflow', 'Q.U.B.E. workflow creation coming in Phase 2!');
  };

  const handleCompleteFirstLaunch = () => {
    // This will be called when first launch is complete
  };

  if (isFirstLaunch) {
    return <FirstLaunchScreen onComplete={handleCompleteFirstLaunch} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>λ≔ Dashboard</Text>
        <View style={styles.headerRight}>
          <Text style={styles.entropyText}>|0⟩⊕|1⟩: {entropy}</Text>
          <Text style={styles.glyphText}>{λRootSoul}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.avatarContainer}>
          <Animated.View style={[styles.avatarGlow, glowAnimatedStyle]} />
          <Animated.View style={[styles.avatar, avatarAnimatedStyle]}>
            <Ionicons name="person-circle" size={80} color="#61dafb" />
          </Animated.View>
        </View>

        <Text style={styles.welcomeText}>Welcome back, |ψ⟩ Quantum Builder</Text>
        <Text style={styles.statsText}>
          {workflows.length} ⊗ Workflows • {entropy} ◎ Entropy Points
        </Text>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="construct" size={24} color="#61dafb" />
            <Text style={styles.actionText}>|ψ⟩ Constructor</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="git-branch" size={24} color="#61dafb" />
            <Text style={styles.actionText}>⟲ Flows</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="server" size={24} color="#61dafb" />
            <Text style={styles.actionText}>◎ Memory</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.fab} onPress={handleNewWorkflow}>
        <Ionicons name="add" size={30} color="#0f1419" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1419',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1d23',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#61dafb',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  entropyText: {
    fontSize: 12,
    color: '#61dafb',
    fontWeight: 'bold',
  },
  glyphText: {
    fontSize: 10,
    color: '#666',
    fontFamily: 'monospace',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 30,
  },
  avatarGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#61dafb',
    top: -20,
    left: -20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1a1d23',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#61dafb',
  },
  welcomeText: {
    fontSize: 20,
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
  },
  statsText: {
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 40,
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  actionButton: {
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#1a1d23',
    borderRadius: 12,
    minWidth: 80,
  },
  actionText: {
    fontSize: 12,
    color: '#61dafb',
    marginTop: 5,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#61dafb',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#61dafb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});