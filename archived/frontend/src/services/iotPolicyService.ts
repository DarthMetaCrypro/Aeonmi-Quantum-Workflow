import api, { ApiResponse } from './api';

export interface IotPolicyState {
  micro_ai_enabled: boolean;
  enforced_at?: string;
  reason?: string;
  actor?: string;
  revision?: number;
}

const STORAGE_KEY = 'quantumforge-iot-policy';

class IotPolicyService {
  private cache: IotPolicyState | null = null;

  private persist(state: IotPolicyState) {
    this.cache = state;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      window.dispatchEvent(new CustomEvent('iot-policy-updated', { detail: state }));
    }
  }

  private loadFromStorage(): IotPolicyState | null {
    if (this.cache) {
      return this.cache;
    }

    if (typeof window === 'undefined') {
      return null;
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as IotPolicyState;
      this.cache = parsed;
      return parsed;
    } catch (error) {
      console.warn('Failed to parse IoT policy from storage', error);
      return null;
    }
  }

  getPolicySnapshot(): IotPolicyState | null {
    return this.cache || this.loadFromStorage();
  }

  isMicroAiEnabled(): boolean {
    const snapshot = this.getPolicySnapshot();
    return snapshot ? snapshot.micro_ai_enabled !== false : true;
  }

  async fetchPolicy(): Promise<ApiResponse<IotPolicyState>> {
    const response = await api.get<IotPolicyState>('/api/iot/micro-ai');
    if (response.status === 'success' && response.result) {
      this.persist(response.result);
    }
    return response;
  }

  async setMicroAiEnabled(enabled: boolean, reason?: string): Promise<ApiResponse<IotPolicyState>> {
    const response = await api.post<IotPolicyState>('/api/iot/micro-ai', {
      micro_ai_enabled: enabled,
      reason,
      actor: 'quantumforge-frontend'
    });

    if (response.status === 'success' && response.result) {
      this.persist(response.result);
    }

    return response;
  }

  async getHistory(): Promise<ApiResponse<any>> {
    return api.get('/api/iot/micro-ai/history');
  }
}

const iotPolicyService = new IotPolicyService();
export type { IotPolicyState };
export { iotPolicyService };
export default iotPolicyService;
