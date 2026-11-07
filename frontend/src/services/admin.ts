import { apiRequest } from './api';

export interface PlatformStats {
  users: {
    total: number;
    owners: number;
    customers: number;
  };
  products: {
    total: number;
    pendingApproval: number;
  };
  bookings: {
    active: number;
    completed: number;
    openDisputes: number;
  };
  financials: {
    grossSimulatedVolume: number;
    totalRentalFees: number;
    depositsHeld: number;
    depositsRefunded: number;
    damageDeductions: number;
  };
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'CUSTOMER' | 'OWNER' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
  isVerifiedOwner: boolean;
  trustScore: number;
  createdAt: string;
  _count: {
    products: number;
    bookings: number;
  };
}

export interface AdminDispute {
  id: string;
  claimAmount: number;
  reason: string;
  description: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED';
  resolutionNotes?: string;
  deductedFromDeposit: number;
  createdAt: string;
  booking: {
    bookingNumber: string;
    product: {
      name: string;
    };
    depositRecord?: {
      originalAmount: number;
      status: string;
    };
  };
  raisedBy: {
    fullName: string;
    email: string;
    role: string;
  };
}

export const adminService = {
  async getStats(): Promise<{ success: boolean; data: PlatformStats }> {
    return apiRequest('/admin/stats');
  },

  async getUsers(params: { role?: string; status?: string; search?: string } = {}): Promise<{ success: boolean; data: AdminUser[] }> {
    const query = new URLSearchParams();
    if (params.role) query.append('role', params.role);
    if (params.status) query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    const qs = query.toString();
    return apiRequest(`/admin/users${qs ? `?${qs}` : ''}`);
  },

  async updateUserStatus(
    userId: string,
    data: { status?: 'ACTIVE' | 'SUSPENDED'; isVerifiedOwner?: boolean }
  ): Promise<{ success: boolean; message: string; data: any }> {
    return apiRequest(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async reviewProduct(
    productId: string,
    approvalStatus: 'APPROVED' | 'REJECTED',
    rejectionReason?: string
  ): Promise<{ success: boolean; message: string }> {
    return apiRequest(`/admin/products/${productId}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ approvalStatus, rejectionReason }),
    });
  },

  async getAllBookings(status?: string): Promise<{ success: boolean; data: any[] }> {
    const qs = status ? `?status=${status}` : '';
    return apiRequest(`/admin/bookings${qs}`);
  },

  async getDisputes(): Promise<{ success: boolean; data: AdminDispute[] }> {
    return apiRequest('/admin/disputes');
  },

  async resolveDispute(
    disputeId: string,
    data: {
      status: 'RESOLVED' | 'REJECTED';
      resolutionNotes: string;
      deductedFromDeposit: number;
    }
  ): Promise<{ success: boolean; message: string; data: any }> {
    return apiRequest(`/admin/disputes/${disputeId}/resolve`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
