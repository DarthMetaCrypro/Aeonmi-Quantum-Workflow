import React, { useEffect, useState, Suspense, lazy } from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, ActivityIndicator, View, StyleSheet } from 'react-native';
import {
  Palette,
  Workflow,
  MessageCircle,
  Zap,
  File,
  User,
  Activity,
  Server,
  Shield,
} from 'lucide-react-native';

// Lazy-loaded screens for code splitting
const DashboardScreen = lazy(() => import('./src/screens/DashboardScreen'));
const WorkflowCanvasScreen = lazy(() => import('./src/screens/WorkflowCanvasScreen'));
const RunHistoryScreen = lazy(() => import('./src/screens/RunHistoryScreen'));
const ChatScreen = lazy(() => import('./src/screens/ChatScreen'));
const OptimizationScreen = lazy(() => import('./src/screens/OptimizationScreen'));
const QRNGScreen = lazy(() => import('./src/screens/QRNGScreen'));
const CollaborationScreen = lazy(() => import('./src/screens/CollaborationScreen'));
const QuantumMLScreen = lazy(() => import('./src/screens/QuantumMLScreen'));
const HardwareScreen = lazy(() => import('./src/screens/HardwareScreen'));
const AlgorithmVisualizationScreen = lazy(
  () => import('./src/screens/AlgorithmVisualizationScreen'),
);
const BB84SecurityScreen = lazy(() => import('./src/screens/BB84SecurityScreen'));
const AeonmiSourcePreviewModal = lazy(
  () => import('./src/screens/AeonmiSourcePreviewModal'),
);
const EvolutionPanel = lazy(() => import('./src/screens/EvolutionPanel'));
const LoginScreen = lazy(() => import('./src/screens/LoginScreen'));
const RegisterScreen = lazy(() => import('./src/screens/RegisterScreen'));
const AccountScreen = lazy(() => import('./src/screens/AccountScreen'));

import ConstructorAI from './src/components/ConstructorAI';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { LoadingFallback } from './src/components/LoadingFallback';
import { palette } from './src/theme/colors';
import useRootStore from './src/state/store';
import { seedWorkflows } from './src/mocks/seeds';
import { setTokenExpiredCallback } from './src/services/api';
import apiService from './src/services/api';

export type RootStackParamList = {
  Auth: undefined;
  Tabs: undefined;
  AeonmiSourcePreview: undefined;
  EvolutionPanel: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type RootTabParamList = {
  Dashboard: undefined;
  Canvas: undefined;
  History: undefined;
  Chat: undefined;
  Optimization: undefined;
  QRNG: undefined;
  Collaboration: undefined;
  QuantumML: undefined;
  Hardware: undefined;
  AlgorithmVisualization: undefined;
  BB84Security: undefined;
  Account: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();

// Auth Stack Navigator (Login/Register)
const AuthNavigator = () => {
  const [showRegister, setShowRegister] = useState(false);

  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      {!showRegister ? (
        <AuthStack.Screen name="Login">
          {() => (
            <Suspense fallback={<LoadingFallback />}>
              <LoginScreen onSwitchToRegister={() => setShowRegister(true)} />
            </Suspense>
          )}
        </AuthStack.Screen>
      ) : (
        <AuthStack.Screen name="Register">
          {() => (
            <Suspense fallback={<LoadingFallback />}>
              <RegisterScreen onSwitchToLogin={() => setShowRegister(false)} />
            </Suspense>
          )}
        </AuthStack.Screen>
      )}
    </AuthStack.Navigator>
  );
};

// Main Tabs Navigator (Authenticated)
const TabsNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0B1116',
          borderTopColor: '#17202A',
        },
        tabBarActiveTintColor: palette.accentPrimary,
        tabBarInactiveTintColor: palette.textSecondary,
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Palette color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <MessageCircle color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="QuantumML"
        component={QuantumMLScreen}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Activity color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Hardware"
        component={HardwareScreen}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Server color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Optimization"
        component={OptimizationScreen}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Zap color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="QRNG"
        component={QRNGScreen}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <File color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <User color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const App = () => {
  const hydrated = useRootStore((state) => state.hydrated);
  const initialize = useRootStore((state) => state.initialize);
  const isAuthenticated = useRootStore((state) => state.isAuthenticated);
  const isLoading = useRootStore((state) => state.isLoading);
  const loadTokensFromStorage = useRootStore((state) => state.loadTokensFromStorage);
  const refreshAuthToken = useRootStore((state) => state.refreshAuthToken);

  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Initialize app on mount
    const initializeApp = async () => {
      // Fetch CSRF token first
      await apiService.fetchCsrfToken();

      // Load saved auth tokens
      await loadTokensFromStorage();

      // Initialize workflows if needed
      if (!hydrated) {
        await initialize(seedWorkflows);
      }

      setAppReady(true);
    };

    initializeApp();
  }, []);

  useEffect(() => {
    // Set up token refresh callback for API client
    setTokenExpiredCallback(refreshAuthToken);
  }, [refreshAuthToken]);

  // Show loading screen while app initializes
  if (!appReady || isLoading) {
    return (
      <ErrorBoundary>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={palette.accentPrimary} />
        </View>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" />
        <NavigationContainer
          theme={{
            ...DarkTheme,
            colors: { ...DarkTheme.colors, background: palette.background },
          }}
        >
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!isAuthenticated ? (
              // Not authenticated - show auth flow
              <Stack.Screen
                name="Auth"
                component={AuthNavigator}
                options={{ headerShown: false }}
              />
            ) : (
              // Authenticated - show main app
              <>
                <Stack.Screen name="Tabs" options={{ headerShown: false }}>
                  {() => (
                    <Suspense fallback={<LoadingFallback />}>
                      <TabsNavigator />
                    </Suspense>
                  )}
                </Stack.Screen>
                <Stack.Screen
                  name="AeonmiSourcePreview"
                  options={{
                    presentation: 'modal',
                    headerShown: false,
                  }}
                >
                  {() => (
                    <Suspense fallback={<LoadingFallback />}>
                      <AeonmiSourcePreviewModal />
                    </Suspense>
                  )}
                </Stack.Screen>
                <Stack.Screen
                  name="EvolutionPanel"
                  options={{
                    presentation: 'modal',
                    headerShown: false,
                  }}
                >
                  {() => (
                    <Suspense fallback={<LoadingFallback />}>
                      <EvolutionPanel />
                    </Suspense>
                  )}
                </Stack.Screen>
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>

        {/* Constructor AI - Only show when authenticated */}
        {isAuthenticated && <ConstructorAI />}
      </SafeAreaProvider>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: palette.background,
  },
});

export default App;
