/**
 * λ≔ Aeonmi User Profile Screen
 *
 * ◎ BB84 Quantum-secured user identity management
 * ⊗ API key generation and quantum encryption
 * ⟲ Self-evolving user preferences and monetization
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useAppStore } from '../stores/appStore';

export function UserProfileScreen() {
  const { userProfile, createUserProfile, generateApiKey } = useAppStore();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    confirmEmail: ''
  });

  const handleCreateProfile = () => {
    if (!formData.username || !formData.email) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (formData.email !== formData.confirmEmail) {
      Alert.alert('Error', 'Emails do not match');
      return;
    }

    createUserProfile({
      username: formData.username,
      email: formData.email,
      quantumEntropy: Math.random() * 1000,
      subscription: {
        tier: 'free',
        expiresAt: Date.now() + (365 * 24 * 60 * 60 * 1000), // 1 year
        credits: 100
      },
      achievements: []
    });

    Alert.alert('Success', 'Aeonmi profile created with BB84 quantum security!');
  };

  const handleGenerateApiKey = () => {
    const newKey = generateApiKey();
    Alert.alert('New API Key', `Generated: ${newKey}\n\nSave this key securely!`);
  };

  if (userProfile) {
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.title}>◎ Aeonmi Quantum Profile</Text>

        <View style={styles.profileCard}>
          <Text style={styles.label}>λ≔ Username:</Text>
          <Text style={styles.value}>{userProfile.username}</Text>

          <Text style={styles.label}>⟲ Email:</Text>
          <Text style={styles.value}>{userProfile.email}</Text>

          <Text style={styles.label}>⊗ API Key:</Text>
          <Text style={styles.apiKey}>{userProfile.apiKey}</Text>

          <Text style={styles.label}>◎ Subscription:</Text>
          <Text style={styles.value}>{userProfile.subscription.tier.toUpperCase()}</Text>

          <Text style={styles.label}>|ψ⟩ Quantum Entropy:</Text>
          <Text style={styles.value}>{userProfile.quantumEntropy}</Text>

          <Text style={styles.label}>🏆 Achievements:</Text>
          <Text style={styles.value}>{userProfile.achievements.join(', ') || 'None yet'}</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleGenerateApiKey}>
          <Text style={styles.buttonText}>🔑 Generate New API Key</Text>
        </TouchableOpacity>

        <View style={styles.securityCard}>
          <Text style={styles.securityTitle}>🔐 BB84 Quantum Security</Text>
          <Text style={styles.securityText}>
            Your profile is secured with BB84 quantum key distribution.
            Public Key: {userProfile.bb84Keys.publicKey.substring(0, 20)}...
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>λ≔ Create Aeonmi Profile</Text>
      <Text style={styles.subtitle}>Join the quantum workflow revolution</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Username:</Text>
        <TextInput
          style={styles.input}
          value={formData.username}
          onChangeText={(text) => setFormData({...formData, username: text})}
          placeholder="Enter quantum username"
        />

        <Text style={styles.label}>Email:</Text>
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={(text) => setFormData({...formData, email: text})}
          placeholder="quantum@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Confirm Email:</Text>
        <TextInput
          style={styles.input}
          value={formData.confirmEmail}
          onChangeText={(text) => setFormData({...formData, confirmEmail: text})}
          placeholder="Confirm email address"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TouchableOpacity style={styles.createButton} onPress={handleCreateProfile}>
          <Text style={styles.createButtonText}>◎ Create Quantum Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.featuresCard}>
        <Text style={styles.featuresTitle}>🚀 Aeonmi Features</Text>
        <Text style={styles.feature}>• BB84 Quantum Encryption</Text>
        <Text style={styles.feature}>• Self-Evolving Workflows</Text>
        <Text style={styles.feature}>• API Key Generation</Text>
        <Text style={styles.feature}>• Monetization Dashboard</Text>
        <Text style={styles.feature}>• Quantum-Classical Hybrid Runtime</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00ffff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 30,
  },
  form: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    marginBottom: 15,
  },
  createButton: {
    backgroundColor: '#00ffff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  createButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#00ffff',
  },
  value: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 15,
  },
  apiKey: {
    fontSize: 14,
    color: '#00ff00',
    fontFamily: 'monospace',
    marginBottom: 15,
    backgroundColor: '#0a0a0a',
    padding: 10,
    borderRadius: 4,
  },
  button: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  securityCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ff6b00',
  },
  securityTitle: {
    fontSize: 18,
    color: '#ff6b00',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  securityText: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  featuresCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00ff00',
  },
  featuresTitle: {
    fontSize: 18,
    color: '#00ff00',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  feature: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 5,
  },
});