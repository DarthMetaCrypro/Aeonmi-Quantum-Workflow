// Type declarations for React Native missing exports
/// <reference types="react-native" />

declare module 'react-native' {
  import { Component } from 'react';

  export class ActivityIndicator extends Component<any> {}
  export class KeyboardAvoidingView extends Component<any> {}
  export class RefreshControl extends Component<any> {}
  export const Platform: {
    OS: string;
    select: <T>(specifics: { [platform: string]: T }) => T;
  };
}
