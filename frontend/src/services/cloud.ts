import { apiRequest } from './api';

export interface AwsServiceItem {
  id: number;
  name: string;
  category: 'Foundational' | 'Application' | 'Advanced Infra';
  status: 'ACTIVE' | 'CONNECTED' | 'FUNCTIONAL' | 'ENFORCED' | 'CONFIGURED' | 'LOCAL_FALLBACK' | 'OPTIONAL_MODULE';
  role: string;
  file: string;
}

export interface CloudOverviewData {
  platform: string;
  version: string;
  region: string;
  environment: string;
  uptimeSeconds: number;
  timestamp: string;
  compute: {
    platform: string;
    architecture: string;
    cpus: number;
    memoryUsedMB: number;
    memoryTotalMB: number;
    memoryPercent: number;
  };
  database: {
    engine: string;
    status: 'CONNECTED' | 'DISCONNECTED';
    latencyMs: number;
    productCount: number;
    bookingCount: number;
    userCount: number;
  };
  drivers: {
    storage: string;
    notifications: string;
    payments: string;
    queue: string;
  };
  serviceCatalog: AwsServiceItem[];
}

export interface AuditLogItem {
  id: string;
  bookingId: string;
  eventType: string;
  actorId?: string;
  timestamp: string;
  payload?: any;
  pk?: string;
  sk?: string;
  ttl?: number;
}

export interface QuoteParams {
  pricePerDay: number;
  startDate: string;
  endDate: string;
  securityDeposit?: number;
}

export interface QuoteResult {
  days: number;
  dailyRate: number;
  basePrice: number;
  discountPercent: number;
  discountAmount: number;
  subtotalAfterDiscount: number;
  gstPercent: number;
  gstAmount: number;
  platformFee: number;
  securityDeposit: number;
  totalPayableNow: number;
  totalWithDeposit: number;
  refundableDeposit: number;
  breakdown: string;
  execution: {
    environment: string;
    durationMs: number;
    memoryUsedMb: number;
  };
}

export const cloudService = {
  async getOverview(): Promise<CloudOverviewData> {
    const res = await apiRequest<{ success: boolean; data: CloudOverviewData }>('/api/cloud/overview');
    return res.data;
  },

  async getAuditLogs(params?: { bookingId?: string; eventType?: string }): Promise<AuditLogItem[]> {
    const query = new URLSearchParams();
    if (params?.bookingId) query.set('bookingId', params.bookingId);
    if (params?.eventType) query.set('eventType', params.eventType);
    const qs = query.toString();
    const endpoint = `/api/cloud/audit-logs${qs ? `?${qs}` : ''}`;
    const res = await apiRequest<{ success: boolean; data: AuditLogItem[] }>(endpoint);
    return res.data;
  },

  async calculateQuote(params: QuoteParams): Promise<QuoteResult> {
    const res = await apiRequest<{ success: boolean; data: QuoteResult }>('/api/cloud/quote', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return res.data;
  },
};
