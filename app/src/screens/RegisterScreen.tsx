import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import useRootStore from '../state/store';
import { registerSchema } from '../utils/authValidation';

interface RegisterScreenProps {
  onSwitchToLogin: () => void;
}

export default function RegisterScreen({ onSwitchToLogin }: RegisterScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const register = useRootStore((state) => state.register);
  const isLoading = useRootStore((state) => state.isLoading);

  const handleRegister = async () => {
    // Validate inputs
    const validation = registerSchema.safeParse({
      name: name.trim(),
      email: email.trim(),
      password,
      confirmPassword,
    });

    if (!validation.success) {
      const firstError = validation.error.issues[0];
      Alert.alert('Validation Error', firstError.message);
      return;
    }

    try {
      await register(
        validation.data.name,
        validation.data.email,
        validation.data.password,
      );
      Alert.alert('Success', 'Account created successfully!');
      // Navigation handled by App.tsx based on auth state
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Please try again');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join QuantumForge today</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your Name"
            placeholderTextColor="#666"
            autoComplete="name"
            accessibilityLabel="Full name"
            accessibilityHint="Enter your full name"
            accessibilityRole="none"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="#666"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            accessibilityLabel="Email address"
            accessibilityHint="Enter your email address for account creation"
            accessibilityRole="none"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="At least 8 characters"
            placeholderTextColor="#666"
            secureTextEntry
            autoComplete="password-new"
            accessibilityLabel="Password"
            accessibilityHint="Enter a password with at least 8 characters, including uppercase, lowercase, and numbers"
            accessibilityRole="none"
          />

          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter password"
            placeholderTextColor="#666"
            secureTextEntry
            autoComplete="password-new"
            accessibilityLabel="Confirm password"
            accessibilityHint="Re-enter your password to confirm"
            accessibilityRole="none"
          />

          <View style={styles.requirements}>
            <Text style={styles.requirementText}>• Minimum 8 characters</Text>
            <Text style={styles.requirementText}>• At least 1 uppercase letter</Text>
            <Text style={styles.requirementText}>• At least 1 number</Text>
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="Create account"
            accessibilityHint="Tap to create your QuantumForge account"
            accessibilityState={{ disabled: isLoading, busy: isLoading }}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={onSwitchToLogin}>
              <Text style={styles.link}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0a0e1a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#1a1f2e',
    borderRadius: 12,
    padding: 32,
    borderWidth: 1,
    borderColor: '#00d4ff',
    marginVertical: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00d4ff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#0a0e1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#fff',
    marginBottom: 16,
  },
  requirements: {
    backgroundColor: '#0a0e1a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  requirementText: {
    color: '#888',
    fontSize: 12,
    marginBottom: 4,
  },
  button: {
    backgroundColor: '#00d4ff',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#0a0e1a',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#888',
    fontSize: 14,
  },
  link: {
    color: '#00d4ff',
    fontSize: 14,
    fontWeight: '600',
  },
});
