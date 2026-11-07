import { apiRequest } from './api';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  role: 'CUSTOMER' | 'OWNER' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
  isVerifiedOwner: boolean;
  ownerBio?: string;
  ownerAddress?: string;
  trustScore: number;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export const authService = {
  async register(data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    role?: 'CUSTOMER' | 'OWNER';
  }): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async logout(): Promise<void> {
    await apiRequest('/auth/logout', { method: 'POST' }).catch(() => {});
  },

  async getMe(): Promise<{ success: boolean; data: User }> {
    return apiRequest<{ success: boolean; data: User }>('/auth/me');
  },

  async updateMe(data: Partial<User>): Promise<{ success: boolean; data: User }> {
    return apiRequest<{ success: boolean; data: User }>('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async becomeOwner(data: {
    ownerBio: string;
    ownerAddress: string;
    phone: string;
  }): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/auth/become-owner', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string; devResetToken?: string }> {
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  },
};

