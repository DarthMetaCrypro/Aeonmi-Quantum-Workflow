import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: [
      '.web.tsx',
      '.tsx',
      '.web.ts',
      '.ts',
      '.web.jsx',
      '.jsx',
      '.web.js',
      '.js',
      '.css',
      '.json',
    ],
    alias: [
      {
        find: 'react-native/Libraries/Utilities/codegenNativeComponent',
        replacement: 'react-native-web/dist/exports/View',
      },
      {
        find: 'react-native/Libraries/Renderer/shims/ReactNativeViewConfigRegistry',
        replacement: path.resolve(
          __dirname,
          './src/mocks/ReactNativeViewConfigRegistry.js',
        ),
      },
      {
        find: 'react-native-web/dist/modules/ReactNativeViewConfigRegistry',
        replacement: path.resolve(
          __dirname,
          './src/mocks/ReactNativeViewConfigRegistry.js',
        ),
      },
      {
        find: 'react-native/Libraries/Renderer/shims/ReactFabric',
        replacement: 'react-native-web/dist/exports/View',
      },
      {
        find: 'react-native/Libraries/Image/AssetRegistry',
        replacement: 'react-native-web/dist/modules/AssetRegistry',
      },
      {
        find: 'react-native/Libraries/ReactNative/ReactFabricPublicInstance/ReactFabricPublicInstance',
        replacement: 'react-native-web/dist/exports/View',
      },
      {
        find: 'react-native/Libraries/Pressability/PressabilityDebug',
        replacement: path.resolve(__dirname, './src/mocks/PressabilityDebug.js'),
      },
      {
        find: 'react-native-web/Libraries/Pressability/PressabilityDebug',
        replacement: path.resolve(__dirname, './src/mocks/PressabilityDebug.js'),
      },
      {
        find: 'react-native/Libraries/Renderer/shims/ReactNative',
        replacement: 'react-native-web',
      },
      {
        find: 'react-native-web/Libraries/Renderer/shims/ReactNative',
        replacement: 'react-native-web',
      },
      { find: 'react-native', replacement: 'react-native-web' },
      { find: '@', replacement: path.resolve(__dirname, './src') },
    ],
  },
  define: {
    global: 'window',
    __DEV__: 'true',
  },
  esbuild: {
    loader: 'tsx',
    include: /.*\.[jt]sx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      resolveExtensions: [
        '.web.tsx',
        '.tsx',
        '.web.ts',
        '.ts',
        '.web.jsx',
        '.jsx',
        '.web.js',
        '.js',
        '.css',
        '.json',
      ],
      loader: {
        '.js': 'jsx',
      },
    },
  },
  build: {
    outDir: 'dist',
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
