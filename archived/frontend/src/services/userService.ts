// User Management Service - Handles user profiles, authentication, and subscriptions
import api, { ApiResponse } from './api';

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  createdAt: Date;
  lastLoginAt: Date;
  status: 'active' | 'inactive' | 'suspended';
  role: 'free' | 'pro' | 'enterprise' | 'admin';
}

export interface UserProfile {
  user: User;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
      workflowComplete: boolean;
      systemUpdates: boolean;
    };
  };
  stats: {
    workflowsCreated: number;
    workflowsExecuted: number;
    apiCalls: number;
    storageUsed: number;
    lastActivity: Date;
  };
}

export interface Subscription {
  id: string;
  userId: string;
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  paymentMethod?: PaymentMethod;
  usage: {
    workflows: number;
    executions: number;
    storage: number;
    apiCalls: number;
  };
  limits: {
    maxWorkflows: number;
    maxExecutions: number;
    maxStorage: number;
    maxApiCalls: number;
  };
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface Referral {
  id: string;
  referrerId: string;
  referredId: string;
  status: 'pending' | 'completed' | 'rewarded';
  rewardAmount: number;
  rewardType: 'credits' | 'subscription' | 'bonus';
  createdAt: Date;
  completedAt?: Date;
}

export interface SocialShare {
  id: string;
  userId: string;
  platform: 'twitter' | 'facebook' | 'linkedin' | 'instagram' | 'tiktok';
  contentType: 'workflow' | 'achievement' | 'referral';
  sharedAt: Date;
  engagement: {
    likes: number;
    shares: number;
    comments: number;
  };
  rewardEarned: number;
}

class UserService {
  private currentUser: UserProfile | undefined = undefined;
  private subscription: Subscription | undefined = undefined;

  // Authentication
  async login(email: string, password: string): Promise<ApiResponse<UserProfile>> {
    const response = await api.post<UserProfile>('/auth/login', { email, password });
    if (response.status === 'success' && response.result) {
      this.currentUser = response.result;
      localStorage.setItem('user', JSON.stringify(response.result));
    }
    return response;
  }

  async register(userData: {
    email: string;
    password: string;
    username: string;
    firstName: string;
    lastName: string;
  }): Promise<ApiResponse<UserProfile>> {
    const response = await api.post<UserProfile>('/auth/register', userData);
    if (response.status === 'success' && response.result) {
      this.currentUser = response.result;
      localStorage.setItem('user', JSON.stringify(response.result));
    }
    return response;
  }

  async logout(): Promise<void> {
    await api.post<void>('/auth/logout');
    this.currentUser = undefined;
    this.subscription = undefined;
    localStorage.removeItem('user');
    localStorage.removeItem('subscription');
  }

  // User Profile Management
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    if (this.currentUser) {
      return { status: 'success', result: this.currentUser };
    }

    const cached = localStorage.getItem('user');
    if (cached) {
      this.currentUser = JSON.parse(cached);
      return { status: 'success', result: this.currentUser };
    }

    const response = await api.get<UserProfile>('/user/profile');
    if (response.status === 'success' && response.result) {
      this.currentUser = response.result;
      localStorage.setItem('user', JSON.stringify(response.result));
    }
    return response;
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    const response = await api.put<UserProfile>('/user/profile', updates);
    if (response.status === 'success' && response.result) {
      this.currentUser = response.result;
      localStorage.setItem('user', JSON.stringify(response.result));
    }
    return response;
  }

  // Subscription Management
  async getSubscription(): Promise<ApiResponse<Subscription>> {
    if (this.subscription) {
      return { status: 'success', result: this.subscription };
    }

    const cached = localStorage.getItem('subscription');
    if (cached) {
      this.subscription = JSON.parse(cached);
      return { status: 'success', result: this.subscription };
    }

    const response = await api.get<Subscription>('/user/subscription');
    if (response.status === 'success' && response.result) {
      this.subscription = response.result;
      localStorage.setItem('subscription', JSON.stringify(response.result));
    }
    return response;
  }

  async upgradeSubscription(plan: string, paymentMethodId?: string): Promise<ApiResponse<Subscription>> {
    const response = await api.post<Subscription>('/user/subscription/upgrade', {
      plan,
      paymentMethodId
    });
    if (response.status === 'success' && response.result) {
      this.subscription = response.result;
      localStorage.setItem('subscription', JSON.stringify(response.result));
    }
    return response;
  }

  async cancelSubscription(): Promise<ApiResponse<Subscription>> {
    const response = await api.post<Subscription>('/user/subscription/cancel');
    if (response.status === 'success' && response.result) {
      this.subscription = response.result;
      localStorage.setItem('subscription', JSON.stringify(response.result));
    }
    return response;
  }

  // Payment Methods
  async addPaymentMethod(paymentData: any): Promise<ApiResponse<PaymentMethod>> {
    return api.post<PaymentMethod>('/user/payment-methods', paymentData);
  }

  async getPaymentMethods(): Promise<ApiResponse<PaymentMethod[]>> {
    return api.get<PaymentMethod[]>('/user/payment-methods');
  }

  async removePaymentMethod(methodId: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`/user/payment-methods/${methodId}`);
  }

  // Usage Tracking
  async getUsage(): Promise<ApiResponse<any>> {
    return api.get<any>('/user/usage');
  }

  checkLimits(action: 'workflow' | 'execution' | 'storage' | 'api'): boolean {
    if (!this.subscription) return false;

    const usage = this.subscription.usage;
    const limits = this.subscription.limits;

    switch (action) {
      case 'workflow':
        return usage.workflows < limits.maxWorkflows;
      case 'execution':
        return usage.executions < limits.maxExecutions;
      case 'storage':
        return usage.storage < limits.maxStorage;
      case 'api':
        return usage.apiCalls < limits.maxApiCalls;
      default:
        return false;
    }
  }

  // Referral System
  async createReferralLink(): Promise<ApiResponse<{ code: string; url: string }>> {
    return api.post<{ code: string; url: string }>('/user/referral');
  }

  async getReferrals(): Promise<ApiResponse<Referral[]>> {
    return api.get<Referral[]>('/user/referrals');
  }

  async getReferralStats(): Promise<ApiResponse<{
    totalReferrals: number;
    successfulReferrals: number;
    totalRewards: number;
    pendingRewards: number;
  }>> {
    return api.get<any>('/user/referral-stats');
  }

  // Social Sharing Rewards
  async trackSocialShare(shareData: Omit<SocialShare, 'id' | 'rewardEarned'>): Promise<ApiResponse<SocialShare>> {
    return api.post<any>('/user/social-share', shareData);
  }

  async getSocialRewards(): Promise<ApiResponse<{
    totalShares: number;
    totalRewards: number;
    platformStats: Record<string, number>;
  }>> {
    return api.get<any>('/user/social-rewards');
  }

  // Plan Information
  getPlanLimits(plan: string): any {
    const plans = {
      free: {
        maxWorkflows: 5,
        maxExecutions: 100,
        maxStorage: 100, // MB
        maxApiCalls: 1000,
        price: 0
      },
      starter: {
        maxWorkflows: 25,
        maxExecutions: 1000,
        maxStorage: 1000,
        maxApiCalls: 10000,
        price: 9.99
      },
      pro: {
        maxWorkflows: 100,
        maxExecutions: 10000,
        maxStorage: 10000,
        maxApiCalls: 100000,
        price: 29.99
      },
      enterprise: {
        maxWorkflows: -1, // unlimited
        maxExecutions: -1,
        maxStorage: 100000,
        maxApiCalls: -1,
        price: 99.99
      }
    };
    return plans[plan as keyof typeof plans] || plans.free;
  }

  // Utility methods
  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  getCurrentUser(): UserProfile | undefined {
    return this.currentUser;
  }

  getSubscriptionStatus(): Subscription | undefined {
    return this.subscription;
  }

  hasPermission(feature: string): boolean {
    if (!this.subscription) return false;

    // Free users get basic features
    if (this.subscription.plan === 'free') {
      return ['basic-workflows', 'community-support'].includes(feature);
    }

    // Pro users get advanced features
    if (this.subscription.plan === 'pro') {
      return !['enterprise-features', 'white-label'].includes(feature);
    }

    // Enterprise users get everything
    return true;
  }
}

const userService = new UserService();
export default userService;