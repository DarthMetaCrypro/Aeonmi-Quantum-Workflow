import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Mock React Native modules for web testing
vi.mock('react-native', async () => {
  const RN = await vi.importActual('react-native-web');
  return {
    ...RN,
    Alert: {
      alert: vi.fn(),
    },
    Platform: {
      OS: 'web',
      select: (obj: any) => obj.web || obj.default,
    },
  };
});

// Mock encrypted storage
vi.mock('react-native-encrypted-storage', () => ({
  default: {
    setItem: vi.fn().mockResolvedValue(undefined),
    getItem: vi.fn().mockResolvedValue(null),
    removeItem: vi.fn().mockResolvedValue(undefined),
    clear: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock gesture handler
vi.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }: any) => children,
  PanGestureHandler: ({ children }: any) => children,
}));

// Mock reanimated
vi.mock('react-native-reanimated', () => ({
  default: {
    createAnimatedComponent: (component: any) => component,
  },
  useSharedValue: (value: any) => ({ value }),
  useAnimatedStyle: (callback: any) => callback(),
  withTiming: (value: any) => value,
  withSpring: (value: any) => value,
}));

// Cleanup after each test
afterEach(() => {
  cleanup();
});
