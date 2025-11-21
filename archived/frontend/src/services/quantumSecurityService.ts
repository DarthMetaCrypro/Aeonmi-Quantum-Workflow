import {
  QuantumKeyRequest,
  KeyGenerationResult,
  QuantumStatus,
  invokeTauri,
  isTauriAvailable,
} from '../types/tauri';

/**
 * Quantum Security Service
 * Manages BB84 quantum key distribution through Tauri backend
 */
class QuantumSecurityService {
  private currentKey: KeyGenerationResult | null = null;
  private keyHistory: KeyGenerationResult[] = [];
  private maxHistorySize = 10;

  /**
   * Check if running in Tauri (desktop) mode
   */
  isTauriMode(): boolean {
    return isTauriAvailable();
  }

  /**
   * Get quantum security system status
   */
  async getStatus(): Promise<QuantumStatus> {
    if (!this.isTauriMode()) {
      return {
        active: false,
        protocol: 'BB84',
        version: '1.0.0',
        ready: false,
      };
    }

    try {
      return await invokeTauri<QuantumStatus>('get_quantum_status');
    } catch (error) {
      console.error('Failed to get quantum status:', error);
      throw error;
    }
  }

  /**
   * Generate quantum key using BB84 protocol
   */
  async generateKey(
    keyLength: number = 256,
    withEavesdropper: boolean = false,
    eveInterceptRate?: number
  ): Promise<KeyGenerationResult> {
    if (!this.isTauriMode()) {
      throw new Error('Quantum key generation requires Tauri desktop mode');
    }

    try {
      const request: QuantumKeyRequest = {
        key_length: keyLength,
        with_eavesdropper: withEavesdropper,
        eve_intercept_rate: eveInterceptRate,
      };

      const result = await invokeTauri<KeyGenerationResult>(
        'generate_quantum_key',
        { request }
      );

      // Store in history
      this.currentKey = result;
      this.addToHistory(result);

      return result;
    } catch (error) {
      console.error('Failed to generate quantum key:', error);
      throw error;
    }
  }

  /**
   * Generate secure quantum key (no eavesdropper simulation)
   */
  async generateSecureKey(keyLength: number = 256): Promise<KeyGenerationResult> {
    if (!this.isTauriMode()) {
      throw new Error('Quantum key generation requires Tauri desktop mode');
    }

    try {
      const result = await invokeTauri<KeyGenerationResult>(
        'generate_secure_key',
        { key_length: keyLength }
      );

      this.currentKey = result;
      this.addToHistory(result);

      return result;
    } catch (error) {
      console.error('Failed to generate secure key:', error);
      throw error;
    }
  }

  /**
   * Test eavesdropping detection with simulated Eve
   */
  async testEavesdroppingDetection(
    keyLength: number = 256,
    eveInterceptRate: number = 0.3
  ): Promise<KeyGenerationResult> {
    if (!this.isTauriMode()) {
      throw new Error('Eavesdropping test requires Tauri desktop mode');
    }

    try {
      const result = await invokeTauri<KeyGenerationResult>(
        'test_eavesdropping_detection',
        {
          key_length: keyLength,
          eve_intercept_rate: eveInterceptRate,
        }
      );

      this.addToHistory(result);
      return result;
    } catch (error) {
      console.error('Failed to test eavesdropping detection:', error);
      throw error;
    }
  }

  /**
   * Get current active quantum key
   */
  getCurrentKey(): KeyGenerationResult | null {
    return this.currentKey;
  }

  /**
   * Get key generation history
   */
  getKeyHistory(): KeyGenerationResult[] {
    return [...this.keyHistory];
  }

  /**
   * Clear current key (security measure)
   */
  clearCurrentKey(): void {
    this.currentKey = null;
  }

  /**
   * Clear all keys from memory (security measure)
   */
  clearAllKeys(): void {
    this.currentKey = null;
    this.keyHistory = [];
  }

  /**
   * Get key as hex string
   */
  getKeyHex(): string | null {
    return this.currentKey?.key_hex || null;
  }

  /**
   * Get key statistics
   */
  getKeyStats(): {
    keyLength: number;
    errorRate: number;
    eavesdroppingDetected: boolean;
    rawKeyLength: number;
    finalKeyLength: number;
  } | null {
    if (!this.currentKey) return null;

    return {
      keyLength: this.currentKey.final_key.length,
      errorRate: this.currentKey.error_rate,
      eavesdroppingDetected: this.currentKey.eavesdropping_detected,
      rawKeyLength: this.currentKey.raw_key.length,
      finalKeyLength: this.currentKey.final_key.length,
    };
  }

  /**
   * Export key for use in encryption
   */
  exportKey(): Uint8Array | null {
    if (!this.currentKey) return null;

    // Convert hex string to bytes
    const hex = this.currentKey.key_hex;
    const bytes = new Uint8Array(hex.length / 2);

    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }

    return bytes;
  }

  /**
   * Check if key is secure (no eavesdropping detected)
   */
  isKeySecure(): boolean {
    if (!this.currentKey) return false;
    return !this.currentKey.eavesdropping_detected;
  }

  /**
   * Get security assessment
   */
  getSecurityAssessment(): {
    secure: boolean;
    errorRate: number;
    recommendation: string;
  } {
    if (!this.currentKey) {
      return {
        secure: false,
        errorRate: 0,
        recommendation: 'No key generated',
      };
    }

    const errorRate = this.currentKey.error_rate;
    const eavesdropping = this.currentKey.eavesdropping_detected;

    let recommendation = '';
    let secure = true;

    if (eavesdropping) {
      recommendation = 'CRITICAL: Eavesdropping detected! Do not use this key. Generate a new one.';
      secure = false;
    } else if (errorRate > 0.05) {
      recommendation = 'WARNING: High error rate. Consider regenerating key.';
      secure = false;
    } else if (errorRate > 0.02) {
      recommendation = 'CAUTION: Moderate error rate. Key is usable but monitor closely.';
    } else {
      recommendation = 'SECURE: Key generation successful with low error rate.';
    }

    return {
      secure,
      errorRate,
      recommendation,
    };
  }

  /**
   * Add key to history
   */
  private addToHistory(result: KeyGenerationResult): void {
    this.keyHistory.unshift(result);

    // Limit history size
    if (this.keyHistory.length > this.maxHistorySize) {
      this.keyHistory = this.keyHistory.slice(0, this.maxHistorySize);
    }
  }

  /**
   * Simulate BB84 protocol visualization data
   */
  getVisualizationData(): {
    aliceBases: string[];
    bobBases: string[];
    matchingBases: boolean[];
    errorRate: number;
  } | null {
    if (!this.currentKey) return null;

    const aliceBases = this.currentKey.alice_bases;
    const bobBases = this.currentKey.bob_bases;
    const matchingBases = aliceBases.map((a, i) => a === bobBases[i]);

    return {
      aliceBases,
      bobBases,
      matchingBases,
      errorRate: this.currentKey.error_rate,
    };
  }
}

// Export singleton instance
const quantumSecurityService = new QuantumSecurityService();
export default quantumSecurityService;
