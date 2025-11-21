// src/components/QuantumSplash.tsx

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export const QuantumSplash: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      ),
    ]).start();

    // Auto-complete after 3 seconds
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Svg width={120} height={120} viewBox="0 0 100 100">
            {/* Quantum circuit symbol */}
            <Circle cx="50" cy="50" r="40" fill="none" stroke="#00d4ff" strokeWidth="2" />
            <Circle cx="50" cy="50" r="30" fill="none" stroke="#00d4ff" strokeWidth="1" opacity="0.5" />
            <Circle cx="50" cy="50" r="20" fill="none" stroke="#00d4ff" strokeWidth="1" opacity="0.3" />

            {/* Qubit representations */}
            <Circle cx="30" cy="30" r="3" fill="#00d4ff" />
            <Circle cx="70" cy="30" r="3" fill="#00d4ff" />
            <Circle cx="30" cy="70" r="3" fill="#00d4ff" />
            <Circle cx="70" cy="70" r="3" fill="#00d4ff" />

            {/* Entanglement lines */}
            <Path d="M30 30 L70 70" stroke="#ff6b00" strokeWidth="1" opacity="0.7" />
            <Path d="M70 30 L30 70" stroke="#ff6b00" strokeWidth="1" opacity="0.7" />

            {/* Center quantum core */}
            <Circle cx="50" cy="50" r="8" fill="#00d4ff" opacity="0.8" />
            <Circle cx="50" cy="50" r="4" fill="#ffffff" />
          </Svg>
        </Animated.View>

        <Text style={styles.title}>QuantumForge</Text>
        <Text style={styles.subtitle}>Mobile Workflow Engine</Text>
      </Animated.View>

      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Initializing quantum systems...</Text>
        <View style={styles.loadingBar}>
          <Animated.View
            style={[
              styles.loadingProgress,
              {
                width: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 32,
    color: '#00d4ff',
    fontWeight: 'bold',
    marginTop: 20,
    textShadowColor: '#00d4ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#cccccc',
    marginTop: 5,
  },
  loadingContainer: {
    alignItems: 'center',
    width: width * 0.8,
  },
  loadingText: {
    color: '#00d4ff',
    fontSize: 14,
    marginBottom: 10,
  },
  loadingBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#2a2a2a',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingProgress: {
    height: '100%',
    backgroundColor: '#00d4ff',
    borderRadius: 2,
  },
});