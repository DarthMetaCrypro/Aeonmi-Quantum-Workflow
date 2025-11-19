/**
 * Æ Q.U.B.E. Root Application
 *
 * λ≔RootSoul ⊗ Q.U.B.E. Engine → |ψ⟩ Application State
 * ◎ Quantum Universal Base Engine initialization
 * ⟲ Infinite workflow cycles through Æ navigation
 */

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import { useAppStore } from './src/stores/appStore';

/**
 * λ≔RootApp ≔ Q.U.B.E. Application Entry Point
 *
 * Initializes |ψ⟩ quantum state from λ≔RootSoul ⊗ QuantumVault
 * ⟲ Continuous state synchronization with holographic storage
 */
export default function RootApp() {
  // λ≔RootSoul state management through Q.U.B.E. engine
  const { loadFromVault } = useAppStore();

  useEffect(() => {
    /**
     * ◎ Q.U.B.E. State Expansion
     * Load |ψ⟩ application state from λ≔RootSoul ⊗ QuantumVault
     * ⟲ Persistent quantum memory across application cycles
     */
    loadFromVault(); // λ≔VaultLoad equivalent
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {/**
         * ⟲ Q.U.B.E. Navigation Cycle
         * Bottom tab navigation through Æ quantum workflows
         */}
        <BottomTabNavigator />

        {/**
         * ◎ Status Bar in Q.U.B.E. Theme
         * Dark quantum aesthetic with cyan accent |ψ⟩
         */}
        <StatusBar style="light" backgroundColor="#0f1419" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}