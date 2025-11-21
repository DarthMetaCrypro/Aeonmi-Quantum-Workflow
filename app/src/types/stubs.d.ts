declare module 'react-native' {
  import * as React from 'react';

  export const View: React.ComponentType<any>;
  export const Text: React.ComponentType<any>;
  export const ScrollView: React.ComponentType<any>;
  export const Pressable: React.ComponentType<any>;
  export const TouchableOpacity: React.ComponentType<any>;
  export const Alert: { alert: (...args: any[]) => void };
  export const StyleSheet: { create<T extends Record<string, any>>(styles: T): T };
  export const StatusBar: React.ComponentType<any>;
  export const FlatList: React.ComponentType<any>;
  export const TextInput: React.ComponentType<any>;
  export type ViewProps = Record<string, any>;
  export const Animated: any;
  export const Dimensions: {
    get: (dimension: string) => { width: number; height: number };
  };
  export const Modal: React.ComponentType<any>;
}

declare module 'react-native-safe-area-context' {
  import * as React from 'react';
  export const SafeAreaProvider: React.ComponentType<any>;
}

declare module 'react-native-gesture-handler' {
  import * as React from 'react';

  export class PanGestureHandler extends React.Component<any> {}
  export class PinchGestureHandler extends React.Component<any> {}
  export type PanGestureHandlerGestureEvent = any;
  export type PanGestureHandlerStateChangeEvent = any;
  export type PinchGestureHandlerGestureEvent = any;
  export type PinchGestureHandlerStateChangeEvent = any;
  export const State: {
    UNDETERMINED: number;
    BEGAN: number;
    CANCELLED: number;
    ACTIVE: number;
    END: number;
    FAILED: number;
  };
}

declare module '@react-navigation/native' {
  import * as React from 'react';
  export const NavigationContainer: React.ComponentType<any>;
  export const DarkTheme: any;
  export function useNavigation<T = any>(): T;
  export function useRoute<T = any>(): T;
  export type RouteProp<T, U> = any;
}

declare module '@react-navigation/bottom-tabs' {
  export function createBottomTabNavigator<T = any>(): any;
}

declare module '@react-navigation/native-stack' {
  export function createNativeStackNavigator<T = any>(): any;
}

declare module '@react-native-async-storage/async-storage' {
  const AsyncStorage: any;
  export default AsyncStorage;
}

declare module 'react-hook-form' {
  import * as React from 'react';
  export const Controller: React.ComponentType<any>;
  export const FormProvider: React.ComponentType<any>;
  export function useForm<T = any>(
    config?: Record<string, any>,
  ): {
    control: any;
    setValue: (name: string, value: any) => void;
    reset: (values?: Partial<T>) => void;
    handleSubmit: (fn: (values: T) => void) => () => void;
    watch: (name?: keyof T | (keyof T)[]) => any;
  };
  export function useFormContext<T = any>(): {
    control: any;
    setValue: (name: string, value: any) => void;
  };
  export function useFieldArray(config: { control: any; name: string }): {
    fields: Array<{ id: string } & Record<string, any>>;
    append: (value: Record<string, any>) => void;
    remove: (index: number) => void;
  };
}

declare module 'lucide-react-native' {
  import * as React from 'react';
  export const Palette: React.ComponentType<any>;
  export const Workflow: React.ComponentType<any>;
  export const Shield: React.ComponentType<any>;
  export const ChevronRight: React.ComponentType<any>;
  export const Activity: React.ComponentType<any>;
  export const Zap: React.ComponentType<any>;
  export const Cpu: React.ComponentType<any>;
}

declare module 'zustand' {
  export type SetState<T> = (
    partial: Partial<T> | ((state: T) => Partial<T>),
    replace?: boolean,
    action?: string,
  ) => void;
  export type GetState<T> = () => T;
  export type StoreApi<T> = {
    getState: GetState<T>;
    setState: SetState<T>;
    subscribe: (listener: (state: T, prevState: T) => void) => () => void;
  };
  export type UseBoundStore<T> = {
    (): T;
    <U>(selector: (state: T) => U): U;
    getState: GetState<T>;
    setState: SetState<T>;
    subscribe: StoreApi<T>['subscribe'];
  };
  export type StateCreator<T> = (
    set: SetState<T>,
    get: GetState<T>,
    api: StoreApi<T>,
  ) => T;
  export function create<T>(initializer: StateCreator<T>): UseBoundStore<T>;
  export function create<T>(): (initializer: StateCreator<T>) => UseBoundStore<T>;
}

declare module 'zustand/middleware' {
  export const devtools: any;
  export const persist: any;
  export const createJSONStorage: any;
}
