// App.tsx

import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { WorkflowCanvasScreen } from './src/screens/WorkflowCanvasScreen';
import { RunHistoryScreen } from './src/screens/RunHistoryScreen';
import { QuantumSplash } from './src/components/QuantumSplash';

export type RootStackParamList = {
  Dashboard: undefined;
  WorkflowCanvas: { workflowId: string };
  RunHistory: { workflowId: string };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <QuantumSplash onComplete={() => setShowSplash(false)} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Dashboard"
        screenOptions={{
          headerStyle: { backgroundColor: '#1a1a1a' },
          headerTintColor: '#00d4ff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ title: 'Quantum Workflows' }}
        />
        <Stack.Screen
          name="WorkflowCanvas"
          component={WorkflowCanvasScreen}
          options={{ title: 'Workflow Editor' }}
        />
        <Stack.Screen
          name="RunHistory"
          component={RunHistoryScreen}
          options={{ title: 'Execution History' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}