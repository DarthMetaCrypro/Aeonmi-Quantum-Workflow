/**
 * Æ Q.U.B.E. Navigation Matrix
 *
 * ⟲ Quantum Workflow Navigation Cycles
 * λ≔RootSoul ⊗ Navigation State → |ψ⟩ Active Screen
 * ◎ Tab expansion through Q.U.B.E. engine
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import Æ Q.U.B.E. screens
import DashboardScreen from '../screens/DashboardScreen';
import FlowsScreen from '../screens/FlowsScreen';
import AgentsScreen from '../screens/AgentsScreen';
import MemoryScreen from '../screens/MemoryScreen';
import ConstructorScreen from '../screens/ConstructorScreen';

// Import Aeonmi screens
import { UserProfileScreen } from '../screens/UserProfileScreen';
import { AeonmiCodeEditorScreen } from '../screens/AeonmiCodeEditorScreen';
import { MonetizationDashboardScreen } from '../screens/MonetizationDashboardScreen';

const Tab = createBottomTabNavigator();

/**
 * λ≔QuantumNavigator ≔ Q.U.B.E. Navigation Engine
 *
 * Manages |ψ⟩ navigation states through Æ quantum tabs
 * ⟲ Continuous workflow cycling between quantum domains
 */
export default function QuantumNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          // ◎ Q.U.B.E. Icon Mapping - λ≔RootSoul ⊗ Route → |ψ⟩ Icon State
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'λ≔Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === '⟲Flows') {
            iconName = focused ? 'git-branch' : 'git-branch-outline';
          } else if (route.name === '◎Agents') {
            iconName = focused ? 'hardware-chip' : 'hardware-chip-outline';
          } else if (route.name === '|ψ⟩Memory') {
            iconName = focused ? 'server' : 'server-outline';
          } else if (route.name === '⊗Constructor') {
            iconName = focused ? 'construct' : 'construct-outline';
          } else if (route.name === 'λ≔Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === '⊗Aeonmi') {
            iconName = focused ? 'code' : 'code-outline';
          } else if (route.name === '◎Monetize') {
            iconName = focused ? 'cash' : 'cash-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        // ◎ Q.U.B.E. Theme Configuration
        tabBarActiveTintColor: '#45b7d1', // |ψ⟩ Cyan quantum state
        tabBarInactiveTintColor: '#666666', // Collapsed quantum state
        tabBarStyle: {
          backgroundColor: '#1a1d23', // Dark quantum void
          borderTopColor: '#333333', // Quantum boundary
          borderTopWidth: 1,
        },
        headerStyle: {
          backgroundColor: '#1a1d23', // Consistent quantum theme
        },
        headerTintColor: '#45b7d1', // |ψ⟩ Active quantum state
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      {/**
       * ⟲ Q.U.B.E. Navigation Cycles
       * Each tab represents a quantum domain in Æ workflow space
       */}
      <Tab.Screen
        name="λ≔Dashboard"
        component={DashboardScreen}
        options={{ title: 'λ≔Dashboard' }}
      />
      <Tab.Screen
        name="⟲Flows"
        component={FlowsScreen}
        options={{ title: '⟲Flows' }}
      />
      <Tab.Screen
        name="◎Agents"
        component={AgentsScreen}
        options={{ title: '◎Agents' }}
      />
      <Tab.Screen
        name="|ψ⟩Memory"
        component={MemoryScreen}
        options={{ title: '|ψ⟩Memory' }}
      />
      <Tab.Screen
        name="⊗Constructor"
        component={ConstructorScreen}
        options={{ title: '⊗Constructor' }}
      />
      <Tab.Screen
        name="λ≔Profile"
        component={UserProfileScreen}
        options={{ title: 'λ≔Profile' }}
      />
      <Tab.Screen
        name="⊗Aeonmi"
        component={AeonmiCodeEditorScreen}
        options={{ title: '⊗Aeonmi' }}
      />
      <Tab.Screen
        name="◎Monetize"
        component={MonetizationDashboardScreen}
        options={{ title: '◎Monetize' }}
      />
    </Tab.Navigator>
  );
}