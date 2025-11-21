// Tauri IPC Types for BB84 Quantum Security

export interface QuantumKeyRequest {
  key_length: number;
  with_eavesdropper: boolean;
  eve_intercept_rate?: number;
}

export interface KeyGenerationResult {
  alice_bits: boolean[];
  alice_bases: string[];
  bob_bases: string[];
  raw_key: boolean[];
  final_key: boolean[];
  error_rate: number;
  eavesdropping_detected: boolean;
  key_hex: string;
}

export interface QuantumStatus {
  active: boolean;
  protocol: string;
  version: string;
  ready: boolean;
}

export interface BB84Commands {
  get_quantum_status: () => Promise<QuantumStatus>;
  generate_quantum_key: (request: QuantumKeyRequest) => Promise<KeyGenerationResult>;
  generate_secure_key: (key_length: number) => Promise<KeyGenerationResult>;
  test_eavesdropping_detection: (
    key_length: number,
    eve_intercept_rate: number
  ) => Promise<KeyGenerationResult>;
}

// Tauri invoke wrapper with type safety
declare global {
  interface Window {
    __TAURI__?: {
      invoke: <T>(command: string, args?: Record<string, unknown>) => Promise<T>;
    };
  }
}

export const isTauriAvailable = (): boolean => {
  return typeof window !== 'undefined' && '__TAURI__' in window;
};

export const invokeTauri = async <T>(
  command: string,
  args?: Record<string, unknown>
): Promise<T> => {
  if (!isTauriAvailable()) {
    throw new Error('Tauri is not available. Running in web mode.');
  }
  return window.__TAURI__!.invoke<T>(command, args);
};
